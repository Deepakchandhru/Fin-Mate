"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function MovingAverageChart({ data }) {
  // Calculate 5-day moving average
  const ma5 = calculateMovingAverage(data, 5)

  // Calculate 10-day moving average if we have enough data
  const ma10 = calculateMovingAverage(data, 10)

  // Format the data for the chart
  const chartData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: "Closing Price",
        data: data.map((item) => item.close),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.1,
      },
      {
        label: "5-Day MA",
        data: ma5,
        borderColor: "rgb(234, 88, 12)",
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
      {
        label: "10-Day MA",
        data: ma10,
        borderColor: "rgb(132, 204, 22)",
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointRadius: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ₹${context.raw ? context.raw.toFixed(2) : "N/A"}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => "₹" + value.toFixed(2),
        },
      },
    },
  }

  return <Line data={chartData} options={options} />
}

// Helper function to calculate moving average
function calculateMovingAverage(data, period) {
  const result = []

  // Fill with null for the first (period-1) days
  for (let i = 0; i < period - 1; i++) {
    result.push(null)
  }

  // Calculate MA for the rest of the days
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close
    }
    result.push(sum / period)
  }

  return result
}
