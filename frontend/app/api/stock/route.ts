import { type NextRequest, NextResponse } from "next/server"

// This is a mock API for demonstration purposes
// In a real application, you would use a real stock API service

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbol = searchParams.get("symbol")
  const trend = searchParams.get("trend") || "normal"

  if (!symbol) {
    return NextResponse.json({ error: "Stock symbol is required" }, { status: 400 })
  }

  try {
    // Generate consistent mock data based on the trend parameter
    const historicalData = generateMockHistoricalData(symbol, 10, trend)

    // Use the last day's closing price as the current price for consistency
    const lastDay = historicalData[historicalData.length - 1]
    const currentData = generateMockCurrentData(symbol, lastDay.close, trend)

    // Generate yearly data for recommendation
    const yearlyData = generateMockHistoricalData(symbol, 365, trend)

    return NextResponse.json({
      currentData,
      historicalData,
      yearlyData,
    })
  } catch (error) {
    console.error("Error fetching stock data:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}

function generateMockCurrentData(symbol: string, currentPrice: number, trend: string) {
  // Extract the stock name from the symbol
  const stockName = symbol.split(".")[0]

  // Generate a change based on the trend
  let change
  if (trend === "negative") {
    change = -1 * (Math.random() * 50 + 20) // Negative change between -20 and -70
  } else {
    change = Math.random() * 100 - 50 // Normal change between -50 and 50
  }

  // Calculate the previous price
  const previousPrice = currentPrice - change

  // Calculate the change percentage
  const changePercent = (change / previousPrice) * 100

  // Generate high and low prices that are consistent with current price
  const high = currentPrice + Math.random() * 50
  const low = currentPrice - Math.random() * 50

  return {
    symbol,
    name: getStockName(symbol),
    price: currentPrice,
    change,
    changePercent,
    high,
    low,
    volume: Math.floor(Math.random() * 10000000),
    timestamp: new Date().toISOString(),
  }
}

function generateMockHistoricalData(symbol: string, days: number, trend = "normal") {
  const data = []
  const today = new Date()

  // Use a seed based on the symbol to get consistent data for the same stock
  const symbolSeed = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  let basePrice = 1000 + (symbolSeed % 4000)

  // Adjust base  => acc + char.charCodeAt(0), 0)
  // Adjust base price and trend factor based on the trend parameter
  let trendFactor = 0.5 // Slight upward trend by default

  if (trend === "negative") {
    basePrice = 2000 + (symbolSeed % 2000) // Start higher for negative trend
    trendFactor = -2 // Strong downward trend
  }

  // Generate data for the specified number of days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Generate prices with some random variation but with a trend
    const dayFactor = Math.sin(i / 30) * 100 // Creates a wave pattern
    const randomFactor = Math.random() * 100 - 50

    const close = basePrice + dayFactor + randomFactor + i * trendFactor
    const open = close + Math.random() * 50 - 25
    const high = Math.max(open, close) + Math.random() * 30
    const low = Math.min(open, close) - Math.random() * 30

    data.push({
      date: date.toISOString().split("T")[0],
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000000),
    })
  }

  return data
}

function getStockName(symbol: string) {
  const stockMap = {
    "RELIANCE.BSE": "Reliance Industries",
    "TCS.BSE": "Tata Consultancy Services",
    "HDFCBANK.BSE": "HDFC Bank",
    "INFY.BSE": "Infosys",
    "HINDUNILVR.BSE": "Hindustan Unilever",
    "ICICIBANK.BSE": "ICICI Bank",
    "SBIN.BSE": "State Bank of India",
    "BHARTIARTL.BSE": "Bharti Airtel",
    "KOTAKBANK.BSE": "Kotak Mahindra Bank",
    "ITC.BSE": "ITC Limited",
    "WIPRO.BSE": "Wipro Limited",
    "AXISBANK.BSE": "Axis Bank",
    "MARUTI.BSE": "Maruti Suzuki India",
    "ASIANPAINT.BSE": "Asian Paints",
    "SUNPHARMA.BSE": "Sun Pharmaceutical",
    "BAJFINANCE.BSE": "Bajaj Finance",
    "TATAMOTORS.BSE": "Tata Motors",
    "NTPC.BSE": "NTPC Limited",
    "POWERGRID.BSE": "Power Grid Corporation",
    "ONGC.BSE": "Oil and Natural Gas Corporation",
    "TATASTEEL.BSE": "Tata Steel",
    "ADANIPORTS.BSE": "Adani Ports",
    "ULTRACEMCO.BSE": "UltraTech Cement",
    "HCLTECH.BSE": "HCL Technologies",
    "TECHM.BSE": "Tech Mahindra",
    "YESBANK.BSE": "Yes Bank",
    "RCOM.BSE": "Reliance Communications",
    "SUZLON.BSE": "Suzlon Energy",
    "IDEA.BSE": "Vodafone Idea",
    "DHFL.BSE": "Dewan Housing Finance",
  }

  return stockMap[symbol] || symbol
}
