"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FinanceChatbot() {
  return (
    <Card className="fixed bottom-20 right-4 z-50 w-96 shadow-lg rounded-md border dark:border-gray-700">
      <CardHeader>
        <CardTitle>Finance Chatbot</CardTitle>
        <CardDescription>Ask me anything about finance!</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">This is a simplified chatbot for demonstration purposes.</p>
      </CardContent>
    </Card>
  )
}
