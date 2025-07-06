"use client"

import React, { useEffect, useState, useRef } from "react"
import { Chart, ArcElement, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"

// Register required Chart.js components
Chart.register(ArcElement, Tooltip, Legend)

interface ExpenseChartProps {
  userId: number
}

export default function ExpenseChart({ userId }: ExpenseChartProps) {
  const [chartData, setChartData] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null) // Store analysis data separately
  const [error, setError] = useState<string | null>(null)
  const chartRef = useRef(null) // Reference to the chart instance

  useEffect(() => {
    // Fetch categorized expense data
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/expense/analyze/${userId}`)
        const { totalSpent, analysis } = await response.json()

        // Store analysis data separately
        setAnalysis(analysis)

        // Prepare chart data
        setChartData({
          labels: Object.keys(analysis),
          datasets: [
            {
              label: `Expenses by Category (Total Spent: ₹${totalSpent.toFixed(2)})`,
              data: Object.values(analysis).map((item: any) => item.amount),
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
              ],
              hoverOffset: 4,
            },
          ],
        })
      } catch (err) {
        setError("Failed to fetch expense analysis.")
      }
    }

    fetchAnalysis()
  }, [userId])

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>
  }

  if (!chartData || !analysis) {
    return <div>Loading chart...</div>
  }

  return (
    <div style={{ width: 800, height: 400 }}>
      <h2 className="text-xl font-bold mb-4">Expense Analysis</h2>
      <Pie
        data={chartData}
        ref={chartRef} // Attach the chart instance to the ref
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || ""
                  const categoryData = analysis[label] || { amount: 0, percentage: 0 }
                  const amount = categoryData.amount.toFixed(2)
                  const percentage = categoryData.percentage
                  return `${label}: ₹${amount} (${percentage}%)`
                },
              },
            },
          },
        }}
      />
    </div>
  )
}