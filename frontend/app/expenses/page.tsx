"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ExpenseChart from "@/components/expense-chart"
import axios from "axios"

export default function ExpensesPage() {
  const [userId, setUserId] = useState(1)
  const [expenses, setExpenses] = useState([])
  const [categorized, setCategorized] = useState(null)
  const [isClassifying, setIsClassifying] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [totalSpent, setTotalSpent] = useState(0)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState(null)
  const [newExpense, setNewExpense] = useState({ expense_name: "", amount: "" })

  const clearResults = () => {
    setExpenses([])
    setCategorized(null)
    setAnalysis(null)
    setTotalSpent(0)
    setSummary(null)
    setError(null)
  }

  const fetchExpenses = async () => {
    clearResults()
    setActiveView("fetch")
    try {
      const response = await axios.get(`http://localhost:5000/api/expense/${userId}`)
      setExpenses(response.data)
      setError(null)
    } catch {
      setError("Failed to fetch expenses.")
    }
  }

  const classifyExpenses = async () => {
    clearResults()
    setActiveView("classify")
    setIsClassifying(true)
    setCategorized(expenses.map((exp) => ({ ...exp, category: "Loading..." })))
    try {
      const response = await axios.get(`http://localhost:5000/api/expense/classify/${userId}`)
      setCategorized(response.data.categorizedExpenses)
      setIsClassifying(false)
      setError(null)
    } catch {
      setError("Failed to classify expenses.")
      setIsClassifying(false)
    }
  }

  const analyzeExpenses = async () => {
    clearResults()
    setActiveView("analyze")
    try {
      const response = await axios.get(`http://localhost:5000/api/expense/analyze/${userId}`)
      console.log("Analysis Response:", response.data)
      setAnalysis(response.data.analysis)
      setTotalSpent(response.data.totalSpent)
      setError(null)
    } catch {
      setError("Failed to analyze expenses.")
    }
  }

  const generateSummary = async () => {
    clearResults()
    setActiveView("summary")
    try {
      const response = await axios.get(`http://localhost:5000/api/expense/summary/${userId}`)
      setSummary(response.data)
      setError(null)
    } catch {
      setError("Failed to generate summary.")
    }
  }

  const addExpense = async () => {
    clearResults()
    if (!newExpense.expense_name || !newExpense.amount) {
      setError("Please provide both expense name and amount.")
      return
    }

    try {
      const response = await axios.post("http://localhost:5000/api/expense", {
        user_id: userId,
        expense_name: newExpense.expense_name,
        amount: parseFloat(newExpense.amount),
      })
      setExpenses([...expenses, response.data])
      setNewExpense({ expense_name: "", amount: "" })
      setActiveView(null)
      setError(null)
    } catch {
      setError("Failed to add expense.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Expense Tracker</h1>

      <div className="mb-4">
        <label htmlFor="userId" className="block font-medium mb-2">
          User ID
        </label>
        <Input
          id="userId"
          type="number"
          value={userId}
          onChange={(e) => setUserId(Number(e.target.value))}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Button onClick={fetchExpenses}>Fetch Expenses</Button>
        <Button onClick={classifyExpenses}>Classify Expenses</Button>
        <Button onClick={analyzeExpenses}>Analyze Expenses</Button>
        <Button onClick={generateSummary}>Generate Summary</Button>
        <Button onClick={() => setActiveView(activeView === "add" ? null : "add")}>
          {activeView === "add" ? "Cancel" : "Add Expense"}
        </Button>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      {activeView === "add" && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Expense Name"
              value={newExpense.expense_name}
              onChange={(e) => setNewExpense({ ...newExpense, expense_name: e.target.value })}
              className="mb-4"
            />
            <Input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="mb-4"
            />
            <Button onClick={addExpense}>Submit</Button>
          </CardContent>
        </Card>
      )}

      {activeView === "fetch" && expenses.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Fetched Expenses</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 px-4 py-2">{exp.expense_name}</td>
                  <td className="border border-gray-300 px-4 py-2">₹{exp.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeView === "classify" && categorized && (
        <div>
          <h3 className="text-xl font-bold mb-4">Categorized Expenses</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Amount</th>
                <th className="border border-gray-300 px-4 py-2">Category</th>
              </tr>
            </thead>
            <tbody>
              {categorized.map((exp, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 px-4 py-2">{exp.expense_name}</td>
                  <td className="border border-gray-300 px-4 py-2">₹{exp.amount}</td>
                  <td className="border border-gray-300 px-4 py-2">{exp.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {isClassifying && <p>Classifying expenses... Please wait.</p>}
        </div>
      )}

      {activeView === "analyze" && (
        <div className="analysis-container">
          <h3 className="text-xl font-bold mb-4">Expense Analysis</h3>
          {analysis && Object.keys(analysis).length > 0 ? (
            <>
              <table className="w-full border-collapse border border-gray-300 mb-6">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analysis).map(([category, data]) => (
                    <tr key={category} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{category}</td>
                      <td className="border border-gray-300 px-4 py-2">₹{data.amount.toFixed(2)}</td>
                      <td className="border border-gray-300 px-4 py-2">{data.percentage}%</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-200 font-bold">
                    <td className="border border-gray-300 px-4 py-2">Total Spent</td>
                    <td className="border border-gray-300 px-4 py-2">₹{totalSpent.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2">100%</td>
                  </tr>
                </tbody>
              </table>
              <ExpenseChart userId={userId} />
            </>
          ) : (
            <p>No expense data to display.</p>
          )}
        </div>
      )}

      {activeView === "summary" && summary && (
        <div>
          <h3 className="text-xl font-bold mb-4">Summary</h3>
          <p>Total Spent: ₹{summary.totalSpent.toFixed(2)}</p>
          <div dangerouslySetInnerHTML={{ __html: summary.suggestions }} />
        </div>
      )}
    </div>
  )
}