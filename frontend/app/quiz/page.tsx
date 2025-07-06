"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function QuizPage() {
  const [quizData, setQuizData] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState("")
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch("http://localhost:8080/quiz/financial-literacy")
        if (!response.ok) {
          throw new Error("Failed to fetch quiz data.")
        }
        const data = await response.json()
        setQuizData(data)
      } catch (error) {
        console.error("Error fetching quiz data:", error)
      }
    }

    fetchQuizData()
  }, [])

  if (!quizData) {
    return <div className="container mx-auto px-4 py-8">Loading quiz...</div>
  }

  const quizKey = Object.keys(quizData)[0]
  const questions = quizData[quizKey]?.questions

  if (!questions || questions.length === 0) {
    return <div className="container mx-auto px-4 py-8">No quiz data available.</div>
  }

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value)
    setStatus("")
  }

  const checkAnswer = () => {
    const correctAnswer = questions[currentQuestionIndex].answer
    if (selectedOption === correctAnswer) {
      setStatus("Correct Answer")
      setScore(score + 1)
    } else {
      setStatus("Wrong Answer")
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedOption("")
      setStatus("")
    } else {
      setShowResults(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setSelectedOption("")
    setScore(0)
    setShowResults(false)
    setStatus("")
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  if (showResults) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Results</CardTitle>
            <CardDescription>
              You scored {score} out of {questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <Alert key={index} variant={selectedOption === q.answer ? "default" : "destructive"}>
                  <div className="flex items-start">
                    {selectedOption === q.answer ? (
                      <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                    )}
                    <div>
                      <AlertTitle>{q.question}</AlertTitle>
                      <AlertDescription>
                        Your answer: {q.options[selectedOption]}
                        {selectedOption !== q.answer && (
                          <div className="mt-1 text-sm">Correct answer: {q.options[q.answer]}</div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRestart} className="w-full">
              Take Quiz Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const question = questions[currentQuestionIndex]

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <CardTitle>
              Question {currentQuestionIndex + 1} of {questions.length}
            </CardTitle>
            <span className="text-sm text-muted-foreground">Score: {score}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <CardDescription className="mt-4 text-lg font-medium">{question.question}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedOption} onValueChange={handleOptionSelect}>
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 py-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button onClick={checkAnswer} disabled={!selectedOption} className="w-full mb-2">
            Check Answer
          </Button>
          <Button
            onClick={handleNextQuestion}
            disabled={!selectedOption || status === ""}
            className="w-full"
          >
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}