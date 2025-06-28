"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "../../styles/terms.css"

type Term = {
  _id: string
  term: string
  definition: string
  scenario_based_explanation: string
}

type QuizData = {
  [key: string]: {
    questions: {
      question: string
      options: string[]
      answer: string
    }[]
  }
}

export default function TermsPage() {
  const [category, setCategory] = useState("Stock Market")
  const [terms, setTerms] = useState<Term[]>([])
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null)
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [bookmarkedTerms, setBookmarkedTerms] = useState<Term[]>([])
  const [videoResults, setVideoResults] = useState<any[]>([])
  const [isVideoView, setIsVideoView] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [showBookmarks, setShowBookmarks] = useState(false)

  const YOUTUBE_API_KEY = "AIzaSyDH_iXaN8Aa-wuouFtQXKmDvYK2tUhIYf4"

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarked_terms")
    if (savedBookmarks) {
      setBookmarkedTerms(JSON.parse(savedBookmarks))
    }
  }, [])

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem("bookmarked_terms", JSON.stringify(bookmarkedTerms))
  }, [bookmarkedTerms])

  useEffect(() => {
    fetchTerms(category)
  }, [category])

  const fetchTerms = async (category: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/terms/${category}`)
      setTerms(response.data)
    } catch (error) {
      console.error("Error fetching terms:", error)
    }
  }

  const handleTermClick = (term: Term) => {
    setSelectedTerm(term)
  }

  const handleBackClick = () => {
    setSelectedTerm(null)
    setQuizData(null)
    setIsVideoView(false)
    setSelectedVideoId(null)
  }

  const handleQuizClick = async (title: string) => {
    try {
      const response = await axios.get(`http://localhost:8080/quiz/${title}`)
      setQuizData(response.data)
    } catch (error) {
      console.error("Error fetching quiz data:", error)
    }
  }

  const toggleBookmark = (term: Term) => {
    if (bookmarkedTerms.some((t) => t._id === term._id)) {
      setBookmarkedTerms(bookmarkedTerms.filter((t) => t._id !== term._id))
    } else {
      setBookmarkedTerms([...bookmarkedTerms, term])
    }
  }

  const handleYouTubeSearch = async (term: string) => {
    setIsUploading(true)
    try {
      const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          part: "snippet",
          q: `${term} basics in tamil`,
          type: "video",
          maxResults: 5,
          key: YOUTUBE_API_KEY,
        },
      })
      setVideoResults(response.data.items)
      setIsVideoView(true)
    } catch (error) {
      console.error("Error fetching YouTube videos:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId)
  }

  const handleShowBookmarks = () => {
    setShowBookmarks(true)
  }

  const handleHideBookmarks = () => {
    setShowBookmarks(false)
  }

  if (showBookmarks) {
    return (
      <div className="bookmarks-container">
        <button onClick={handleHideBookmarks} className="back-button">
          Back to Terms
        </button>
        <h1 className="bookmarks-title">Bookmarked Terms</h1>
        {bookmarkedTerms.length === 0 ? (
          <p>No bookmarked terms available.</p>
        ) : (
          <div className="terms-list">
            {bookmarkedTerms.map((term) => (
              <div key={term._id} className="term-card">
                <h2 className="term-title">{term.term}</h2>
                <p className="term-definition">{term.definition}</p>
                <button
                  className="bookmark-button"
                  onClick={() => toggleBookmark(term)}
                >
                  Remove Bookmark
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="terms-container">
      <h1 className="terms-title">Learn Key Terms</h1>
      <button onClick={handleShowBookmarks} className="bookmark-page-button">
        View Bookmarked Terms
      </button>
      {quizData ? (
        <Quiz quizData={quizData} onBack={handleBackClick} />
      ) : selectedTerm ? (
        isVideoView ? (
          <div className="video-view">
            <button onClick={handleBackClick} className="back-button">
              Back to Term Details
            </button>
            <h2 className="video-title">YouTube Videos for "{selectedTerm.term}"</h2>
            {selectedVideoId ? (
              <div className="video-iframe" style={{ textAlign: "center" }}>
                <iframe
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${selectedVideoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <button onClick={() => setSelectedVideoId(null)} className="back-button">
                  Back to Video List
                </button>
              </div>
            ) : isUploading ? (
              <div className="loading-spinner">Loading...</div>
            ) : (
              <div className="video-results">
                {videoResults.map((video) => (
                  <div key={video.id.videoId} className="video-card" style={{ marginBottom: "20px" }}>
                    <img
                      src={video.snippet.thumbnails.default.url}
                      alt={video.snippet.title}
                      className="video-thumbnail"
                      style={{ display: "block", margin: "0 auto" }}
                    />
                    <p className="video-title" style={{ textAlign: "center" }}>{video.snippet.title}</p>
                    <button
                      onClick={() => handleVideoSelect(video.id.videoId)}
                      className="video-select-button"
                      style={{ display: "block", margin: "10px auto" }}
                    >
                      Play Video
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="term-details">
            <button onClick={handleBackClick} className="back-button">
              Back to List
            </button>
            <h2 className="term-title">{selectedTerm.term}</h2>
            <p className="term-definition">
              <strong>Definition:</strong> {selectedTerm.definition}
            </p>
            <p className="term-scenario">
              <strong>Scenario:</strong> {selectedTerm.scenario_based_explanation}
            </p>
            <button className="quiz-button" onClick={() => handleQuizClick(selectedTerm.term)}>
              Start Quiz
            </button>
            <button className="youtube-button" onClick={() => handleYouTubeSearch(selectedTerm.term)}>
              Search YouTube
            </button>
          </div>
        )
      ) : (
        <>
          <div className="terms-category">
            <label htmlFor="category-select">Select a Category:</label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="terms-select"
            >
              <option value="Stock Market">Stock Market</option>
              <option value="Block Chain">Block Chain</option>
              <option value="Banking">Banking</option>
            </select>
          </div>
          <div className="terms-list">
            {terms.map((term) => (
              <div key={term._id} className="term-card" onClick={() => handleTermClick(term)}>
                <h2 className="term-title">{term.term}</h2>
                <button
                  className={`bookmark-button ${
                    bookmarkedTerms.some((t) => t._id === term._id) ? "bookmarked" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleBookmark(term)
                  }}
                >
                  {bookmarkedTerms.some((t) => t._id === term._id) ? "Unbookmark" : "Bookmark"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const Quiz = ({ quizData, onBack }: { quizData: QuizData; onBack: () => void }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState("")
  const [status, setStatus] = useState("")
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const quizKey = Object.keys(quizData)[0]
  const questions = quizData[quizKey]?.questions

  if (!questions || questions.length === 0) {
    return (
      <div className="quiz-container">
        <button onClick={onBack} className="back-button">
          Back to Term Details
        </button>
        <p>No quiz data available.</p>
      </div>
    )
  }

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(e.target.value)
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

  if (showResults) {
    return (
      <div className="quiz-results">
        <h2>Quiz Completed!</h2>
        <p>
          Your Score: {score} / {questions.length}
        </p>
        <button onClick={onBack} className="back-button">
          Return to Title Page
        </button>
      </div>
    )
  }

  const question = questions[currentQuestionIndex]

  return (
    <div className="quiz-container">
      <button onClick={onBack} className="back-button">
        Back to Term Details
      </button>
      <div className="quiz-question">
        <h2>{question.question}</h2>
        {question.options.map((option, index) => (
          <div key={index}>
            <input
              type="radio"
              id={`option-${index}`}
              name="quiz-option"
              value={option}
              onChange={handleOptionChange}
              checked={selectedOption === option}
            />
            <label htmlFor={`option-${index}`}>{option}</label>
          </div>
        ))}
        <button onClick={checkAnswer} className="check-button">
          Check Answer
        </button>
        {status && (
          <p className={`status ${status === "Correct Answer" ? "correct" : "wrong"}`}>{status}</p>
        )}
        <button
          onClick={handleNextQuestion}
          className="next-button"
          disabled={!selectedOption || status === ""}
        >
          Next
        </button>
      </div>
    </div>
  )
}