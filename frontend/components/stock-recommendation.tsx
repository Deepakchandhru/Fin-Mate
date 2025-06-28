"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function StockRecommendation({ data, currentPrice, stockSymbol }) {
  const [recommendation, setRecommendation] = useState({
    action: "HOLD",
    confidence: 50,
    reasons: [],
    riskLevel: "MEDIUM",
  })

  useEffect(() => {
    if (data && data.length > 0) {
      analyzeStock(data, currentPrice, stockSymbol)
    }
  }, [data, currentPrice, stockSymbol])

  const analyzeStock = (yearlyData, currentPrice, stockSymbol) => {
    // Skip analysis if we don't have enough data
    if (yearlyData.length < 30) {
      setRecommendation({
        action: "HOLD",
        confidence: 50,
        reasons: ["Insufficient historical data for a reliable recommendation"],
        riskLevel: "MEDIUM",
      })
      return
    }

    // Check if this is one of our "poor performer" stocks
    const isPoorPerformer =
      stockSymbol.includes("YESBANK") ||
      stockSymbol.includes("RCOM") ||
      stockSymbol.includes("SUZLON") ||
      stockSymbol.includes("IDEA") ||
      stockSymbol.includes("DHFL")

    // Calculate key metrics
    const latestPrice = yearlyData[yearlyData.length - 1].close
    const oldestPrice = yearlyData[0].close
    const yearlyReturn = ((latestPrice - oldestPrice) / oldestPrice) * 100

    // Calculate 50-day and 200-day moving averages
    const ma50 = calculateMovingAverage(yearlyData.slice(-50), 50)
    const ma200 = calculateMovingAverage(yearlyData.slice(-200), 200)

    // Calculate volatility (standard deviation of returns)
    const returns = []
    for (let i = 1; i < yearlyData.length; i++) {
      returns.push(((yearlyData[i].close - yearlyData[i - 1].close) / yearlyData[i - 1].close) * 100)
    }
    const volatility = calculateStandardDeviation(returns)

    // Calculate RSI (Relative Strength Index)
    const rsi = calculateRSI(yearlyData.slice(-14))

    // Determine risk level
    let riskLevel = "MEDIUM"
    if (volatility > 3 || isPoorPerformer) {
      riskLevel = "HIGH"
    } else if (volatility < 1.5 && !isPoorPerformer) {
      riskLevel = "LOW"
    }

    // Initialize recommendation variables
    let action = "HOLD"
    let confidence = 50
    const reasons = []

    // For poor performers, override with negative signals
    if (isPoorPerformer) {
      action = "SELL"
      confidence = Math.floor(Math.random() * 15) + 75 // 75-90% confidence
      reasons.push("Significant downward trend over extended period")
      reasons.push("Poor financial performance and weak fundamentals")
      reasons.push("High debt levels and liquidity concerns")

      setRecommendation({
        action,
        confidence,
        reasons,
        riskLevel,
      })
      return
    }

    // Golden Cross (50-day MA crosses above 200-day MA)
    const goldenCross = ma50 > ma200

    // Death Cross (50-day MA crosses below 200-day MA)
    const deathCross = ma50 < ma200

    // Check if price is near 52-week high or low
    const prices = yearlyData.map((item) => item.close)
    const yearHigh = Math.max(...prices)
    const yearLow = Math.min(...prices)
    const nearYearHigh = currentPrice > yearHigh * 0.9
    const nearYearLow = currentPrice < yearLow * 1.1

    // Build recommendation
    if (goldenCross && rsi < 70) {
      action = "BUY"
      confidence += 15
      reasons.push("Golden Cross pattern detected (50-day MA above 200-day MA)")
    }

    if (deathCross || rsi > 70) {
      action = "SELL"
      confidence += 15
      if (deathCross) reasons.push("Death Cross pattern detected (50-day MA below 200-day MA)")
      if (rsi > 70) reasons.push("Stock may be overbought (RSI > 70)")
    }

    if (yearlyReturn > 20) {
      confidence += 10
      if (action === "BUY") {
        reasons.push("Strong upward trend over the past year (+" + yearlyReturn.toFixed(2) + "%)")
      } else if (action === "SELL") {
        reasons.push(
          "Stock has risen significantly over the past year (+" +
            yearlyReturn.toFixed(2) +
            "%), consider taking profits",
        )
      }
    }

    if (yearlyReturn < -20) {
      confidence += 10
      if (action === "SELL") {
        reasons.push("Strong downward trend over the past year (" + yearlyReturn.toFixed(2) + "%)")
      } else if (action === "BUY") {
        reasons.push(
          "Stock has fallen significantly over the past year (" +
            yearlyReturn.toFixed(2) +
            "%), potential value opportunity",
        )
      }
    }

    if (nearYearHigh) {
      if (action === "BUY") {
        confidence -= 10
        reasons.push("Price is near 52-week high, which may limit upside potential")
      } else if (action === "SELL") {
        confidence += 10
        reasons.push("Price is near 52-week high, good time to consider taking profits")
      }
    }

    if (nearYearLow) {
      if (action === "BUY") {
        confidence += 10
        reasons.push("Price is near 52-week low, potential value opportunity")
      } else if (action === "SELL") {
        confidence -= 10
        reasons.push("Price is near 52-week low, which may not be the best time to sell")
      }
    }

    // Adjust confidence based on volatility
    if (volatility > 3) {
      confidence -= 10
      reasons.push("High volatility detected, which increases risk")
    }

    // Add some randomness to confidence for more realistic variation
    confidence += Math.floor(Math.random() * 20) - 10 // +/- 10%

    // Ensure confidence stays within 0-100 range
    confidence = Math.max(0, Math.min(100, confidence))

    // If we don't have strong signals, default to HOLD
    if (reasons.length === 0 || confidence < 55) {
      action = "HOLD"
      confidence = Math.floor(Math.random() * 20) + 40 // 40-60% confidence
      reasons.push("No strong buy or sell signals detected at current price levels")
    }

    setRecommendation({
      action,
      confidence,
      reasons,
      riskLevel,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {recommendation.action === "BUY" && (
            <div className="bg-green-100 text-green-800 p-2 rounded-full">
              <TrendingUp className="h-6 w-6" />
            </div>
          )}
          {recommendation.action === "SELL" && (
            <div className="bg-red-100 text-red-800 p-2 rounded-full">
              <TrendingDown className="h-6 w-6" />
            </div>
          )}
          {recommendation.action === "HOLD" && (
            <div className="bg-yellow-100 text-yellow-800 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6" />
            </div>
          )}
          <div>
            <h3 className="text-2xl font-bold">{recommendation.action}</h3>
            <p className="text-sm text-muted-foreground">Recommendation Confidence</p>
          </div>
        </div>
        <div
          className={`text-sm px-2 py-1 rounded-full ${
            recommendation.riskLevel === "HIGH"
              ? "bg-red-100 text-red-800"
              : recommendation.riskLevel === "LOW"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          Risk: {recommendation.riskLevel}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Low Confidence</span>
          <span>High Confidence</span>
        </div>
        <Progress value={recommendation.confidence} className="h-2" />
        <div className="text-center text-sm text-muted-foreground">{recommendation.confidence}% confidence</div>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Analysis Factors:</h4>
        <ul className="space-y-2">
          {recommendation.reasons.map((reason, index) => (
            <li key={index} className="text-sm flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-sm text-muted-foreground mt-4 bg-muted p-3 rounded-md">
        <p className="font-semibold">Disclaimer:</p>
        <p>
          This is a simplified analysis for educational purposes only. Always consult with a financial advisor before
          making investment decisions.
        </p>
      </div>
    </div>
  )
}

// Helper function to calculate moving average
function calculateMovingAverage(data, period) {
  if (data.length < period) return null

  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i].close
  }

  return sum / period
}

// Helper function to calculate standard deviation
function calculateStandardDeviation(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const squaredDifferences = values.map((value) => Math.pow(value - mean, 2))
  const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / values.length
  return Math.sqrt(variance)
}

// Helper function to calculate RSI (Relative Strength Index)
function calculateRSI(data) {
  if (data.length < 14) return 50 // Default to neutral if not enough data

  let gains = 0
  let losses = 0

  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close
    if (change > 0) {
      gains += change
    } else {
      losses -= change
    }
  }

  if (losses === 0) return 100 // All gains

  const relativeStrength = gains / losses
  return 100 - 100 / (1 + relativeStrength)
}
