"use client"

import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function VolumeChart({ data }) {
  // Format the data for the chart
  const chartData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: "Volume",
        data: data.map((item) => item.volume),
        backgroundColor: data.map(
          (item) =>
            item.close > item.open
              ? "rgba(34, 197, 94, 0.6)" // Green for up days
              : "rgba(239, 68, 68, 0.6)", // Red for down days
        ),
        borderColor: data.map((item) => (item.close > item.open ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)")),
        borderWidth: 1,
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
          label: (context) => `Volume: ${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + "M"
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + "K"
            }
            return value
          },
        },
      },
    },
  }

  return <Bar data={chartData} options={options} />
}
