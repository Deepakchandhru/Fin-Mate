"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      console.log("Fetching news from backend...")
      try {
        const response = await fetch("http://localhost:5000/api/news")
        console.log("Response status:", response.status)
        if (!response.ok) {
          throw new Error("Failed to fetch news.")
        }
        const data = await response.json()
        console.log("News data received:", data)
        setNewsArticles(data)
      } catch (error) {
        console.error("Error fetching news:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [])

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading news...</div>
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Financial News</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsArticles.map((article) => (
          <Card key={article._id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="outline">{article.category || "General"}</Badge>
                <span className="text-xs text-muted-foreground">{article.timeDifference || "Unknown Date"}</span>
              </div>
              <CardTitle className="mt-2">{article.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p>{article.content}</p>
              <p className="text-sm text-muted-foreground mt-2">
                <b>Source:</b> {article.source || "Unknown"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}