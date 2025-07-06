import os
import json
import numpy as np
import tensorflow as tf
import pandas as pd
from transformers import BertTokenizer, TFBertModel

MODEL_STORAGE_PATH = "models/model.h5"
CATEGORY_PATH = "models/categories.json"
TOKENIZER = BertTokenizer.from_pretrained("bert-base-uncased")
BERT_MODEL = TFBertModel.from_pretrained("bert-base-uncased")
MAX_LENGTH = 15

def load_data(dataset_path="dataset/expense.csv"):
    print("Loading dataset...")
    df = pd.read_csv(dataset_path)
    df = df.dropna(subset=["Description", "Category"])
    print(f"Loaded {len(df)} records.")
    return df

def get_categories(df, existing_categories=None):
    new_categories = list(df["Category"].unique())
    if existing_categories:
        categories = list(set(existing_categories + new_categories))
    else:
        categories = new_categories
    print(f"Found {len(categories)} unique categories.")
    return categories

def get_bert_embeddings(text):
    inputs = TOKENIZER(text, padding="max_length", truncation=True, max_length=MAX_LENGTH, return_tensors="tf")
    outputs = BERT_MODEL(**inputs)
    return tf.reduce_mean(outputs.last_hidden_state, axis=1).numpy()

def preprocess_data(df, categories):
    print("Preprocessing data...")
    X = np.array([get_bert_embeddings(desc) for desc in df["Description"]])
    y = np.array([categories.index(cat) for cat in df["Category"]])
    y = tf.keras.utils.to_categorical(y, num_classes=len(categories))

    X = np.expand_dims(X, axis=1)  
    X = np.squeeze(X, axis=2)  

    print(f"Data preprocessed! X shape: {X.shape}, y shape: {y.shape}")
    return X, y

def build_model(num_classes):
    print("Building BiLSTM model...")
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(1, 768)),  
        tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(64, return_sequences=False)),
        tf.keras.layers.Dropout(0.5),
        tf.keras.layers.Dense(num_classes, activation="softmax")
    ])
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    print("Model built successfully!")
    return model

def train_model(dataset_path="dataset/expense.csv", incremental=False):
    df = load_data(dataset_path)

    if incremental and os.path.exists(CATEGORY_PATH):
        with open(CATEGORY_PATH, "r") as f:
            existing_categories = json.load(f)
    else:
        existing_categories = None

    categories = get_categories(df, existing_categories)

    X, y = preprocess_data(df, categories)

    if incremental and os.path.exists(MODEL_STORAGE_PATH):
        print("Loading existing model...")
        model = tf.keras.models.load_model(MODEL_STORAGE_PATH)

        if model.output_shape[-1] != len(categories):
            print("Updating model output layer to match new categories...")
            model.pop() 
            model.add(tf.keras.layers.Dense(len(categories), activation="softmax"))
            model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    else:
        print("Building a new model...")
        model = build_model(len(categories))

    print("Starting training...")
    history = model.fit(X, y, epochs=10, validation_split=0.2, batch_size=16)

    print("Model trained successfully!")
    os.makedirs(os.path.dirname(MODEL_STORAGE_PATH), exist_ok=True)  
    model.save(MODEL_STORAGE_PATH)
    print(f"Model saved to {MODEL_STORAGE_PATH}")

    with open(CATEGORY_PATH, "w") as f:
        json.dump(categories, f)
    print("Categories saved.")

if __name__ == "__main__":
    train_model(incremental=True)