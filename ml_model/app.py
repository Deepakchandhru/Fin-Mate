import os
import json
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import BertTokenizer, TFBertModel
from langchain_groq import ChatGroq
from groq import Groq
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import markdown
from train import train_model  
from dotenv import load_dotenv


load_dotenv()  # Load variables from .env

groq_api_key = os.getenv("GROQ_API_KEY")

client = Groq(api_key=groq_api_key)
chat_history = []

MODEL_PATH = os.getenv("MODEL_PATH", "models/model.h5")
CATEGORY_PATH = os.getenv("CATEGORY_PATH", "models/categories.json")

TOKENIZER = BertTokenizer.from_pretrained("bert-base-uncased")
BERT_MODEL = TFBertModel.from_pretrained("bert-base-uncased")
MAX_LENGTH = 15

app = Flask(__name__)
CORS(app)

if not os.path.exists(MODEL_PATH):
    print("Model not found! Training now...")
    train_model()

model = tf.keras.models.load_model(MODEL_PATH)

with open(CATEGORY_PATH, "r") as f:
    categories = json.load(f)

def get_bert_embeddings(text):
    inputs = TOKENIZER(text, padding="max_length", truncation=True, max_length=MAX_LENGTH, return_tensors="tf")
    outputs = BERT_MODEL(**inputs)
    return tf.reduce_mean(outputs.last_hidden_state, axis=1).numpy() 

def genresponse(prompt):
    with app.app_context():
        llm = ChatGroq(model="llama3-70b-8192",
                    api_key=groq_api_key,
                    model_kwargs={"response_format": {"type": "json_object"}},
                    temperature=0,
                    max_tokens=None,
                    timeout=None,
                    max_retries=2)
        content = json.loads(llm.invoke(prompt).content)
        return jsonify(content)

@app.route('/quiz/<title>', methods=['GET'])
def genquiz(title):
    prompt_format = """
    Please generate a set of 10 multiple-choice questions (MCQs) for each of the following topics.
    The output must be a json object:
    {
       "topic":{ "questions": [
            {
                "question": "<question_text>",
                "options": ["<option1>", "<option2>", "<option3>", "<option4>"],
                "answer": "<correct_option>"
            }
        ]
    }
    }
    """
    
    messages = [
        ("system", prompt_format),
        ("human", f"Give the 10 MCQ questions for each topic in {title}.")
    ]
  
    return genresponse(messages)

@app.route('/api/financial-doubt', methods=['POST'])
def financial_doubt():
    data = request.json
    user_question = data.get('question')

    # Initialize the Groq language model
    groq_chat = ChatGroq(groq_api_key=groq_api_key, model_name='llama3-8b-8192')
    memory = ConversationBufferMemory(k=5)

    # Define the prompt template
    prompt_template = PromptTemplate(
        input_variables=["question"],
        template=(
            "You are a financial assistant. Answer questions related to stocks, finance, blockchain, banking, and investments. "
            "If the question is unrelated, politely decline and must always reply as 'I only answer questions related to stocks, finance, blockchain, banking, and investments.' only. "
            "Here is the question: {question}"
        )
    )

    # Initialize the LLMChain with the prompt and language model
    chain = LLMChain(
        llm=groq_chat,
        prompt=prompt_template,
        verbose=True,
        memory=memory
    )

    # Generate the response
    response = chain.run({"question": user_question}).strip()
    html_response = markdown.markdown(response)

    # Append the conversation to chat history
    message = {'human': user_question, 'AI': html_response}
    chat_history.append(message)
    print(f"Chat history: {chat_history}")

    return jsonify({'response': response, 'history': chat_history})

@app.route("/suggestions", methods=["POST"])
def generate_suggestions():
    try:
        data = request.get_json()
        analysis = data.get("analysis")
        totalSpent = data.get("totalSpent")

        if not analysis or not totalSpent:
            return jsonify({"error": "Both 'analysis' and 'totalSpent' are required."}), 400

        # Create the prompt for Groq AI
        prompt = f"""
        Based on the following expense analysis, suggest ways to optimize spending:

        Analysis: {analysis}
        Total Spent: ₹{totalSpent:.2f}

        Provide actionable suggestions for the user to reduce unnecessary expenses and improve financial health.
        """

        # Use Groq API to generate suggestions
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-8b-8192",  # Replace with the appropriate model
        )

        # Extract suggestions from the Groq API response
        raw_suggestions = chat_completion.choices[0].message.content.strip()

        # Convert markdown-style suggestions to HTML
        html_suggestions = markdown.markdown(raw_suggestions)

        return jsonify({"suggestions": html_suggestions})

    except Exception as e:
        print(f"Error generating suggestions: {e}")
        return jsonify({"error": "Failed to generate suggestions."}), 500

@app.route("/predict", methods=["POST"])
def classify_expenses():
    data = request.get_json()

    if not isinstance(data, list):
        return jsonify({"error": "Input should be a list of expense objects"}), 400

    results = []
    for expense in data:
        expense_name = expense.get("expense_name", "")

        if not expense_name:
            results.append({"error": "No description provided for an expense"})
            continue

        input_embedding = get_bert_embeddings(expense_name)
        input_embedding = np.expand_dims(input_embedding, axis=1)  

        prediction = model.predict(input_embedding)
        category_index = np.argmax(prediction)
        predicted_category = categories[category_index]

        results.append({
            "expense_name": expense_name,
            "predicted_category": predicted_category
        })

    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True, port=8080)