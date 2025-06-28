"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDown, ArrowUp } from "lucide-react"
import Link from "next/link"
import StockChart from "@/components/stock-chart"
import VolumeChart from "@/components/volume-chart"
import MovingAverageChart from "@/components/moving-average-chart"
import StockRecommendation from "@/components/stock-recommendation"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { STOCK_LIST } from "@/data/stocks"

export default function StockPage() {
  const [selectedStock, setSelectedStock] = useState("")
  const [stockData, setStockData] = useState(null)
  const [historicalData, setHistoricalData] = useState([])
  const [yearlyData, setYearlyData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (selectedStock) {
      fetchStockData(selectedStock)
    }
  }, [selectedStock])

  const fetchStockData = async (symbol) => {
    setLoading(true)
    setError("")

    try {
      const selectedStockInfo = STOCK_LIST.find((stock) => stock.symbol === symbol)
      const trend = selectedStockInfo?.trend || "normal"

      const response = await fetch(`/api/stock?symbol=${symbol}&trend=${trend}`)

      if (!response.ok) {
        throw new Error("Failed to fetch stock data")
      }

      const data = await response.json()
      setStockData(data.currentData)
      setHistoricalData(data.historicalData)
      setYearlyData(data.yearlyData)
    } catch (err) {
      console.error("Error fetching stock data:", err)
      setError("Failed to fetch stock data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleStockChange = (value) => {
    setSelectedStock(value)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 pt-20">
      <h1 className="text-3xl font-bold mb-8">Indian Stock Market Tracker</h1>

      <div className="w-full max-w-6xl">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select a Stock</label>
          <Select onValueChange={handleStockChange} value={selectedStock}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a stock" />
            </SelectTrigger>
            <SelectContent>
              {STOCK_LIST.map((stock) => (
                <SelectItem key={stock.symbol} value={stock.symbol}>
                  {stock.name} ({stock.symbol})
                  {stock.trend === "negative" && <span className="ml-2 text-red-500">↓</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4 mb-6">
          <Link href="/stock/practice">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Go to Practice Trading
            </button>
          </Link>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {selectedStock && (
          <div className="space-y-6">
            {loading ? (
              <StockDataSkeleton />
            ) : (
              stockData && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>{stockData.name}</CardTitle>
                      <CardDescription>Current Stock Information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Current Price</p>
                          <p className="text-2xl font-bold">₹{stockData.price.toFixed(2)}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Change</p>
                          <div className="flex items-center">
                            {stockData.change > 0 ? (
                              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <p
                              className={`text-lg font-semibold ${stockData.change > 0 ? "text-green-500" : "text-red-500"}`}
                            >
                              {stockData.change > 0 ? "+" : ""}
                              {stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Today's High</p>
                          <p className="text-lg font-semibold">₹{stockData.high.toFixed(2)}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Today's Low</p>
                          <p className="text-lg font-semibold">₹{stockData.low.toFixed(2)}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Volume</p>
                          <p className="text-lg font-semibold">{stockData.volume.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Tabs defaultValue="price">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="price">Price Trend</TabsTrigger>
                      <TabsTrigger value="volume">Volume Analysis</TabsTrigger>
                      <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
                      <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
                    </TabsList>

                    <TabsContent value="price">
                      <Card>
                        <CardHeader>
                          <CardTitle>Price Trend (Last 10 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <StockChart data={historicalData} />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="volume">
                      <Card>
                        <CardHeader>
                          <CardTitle>Volume Analysis (Last 10 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <VolumeChart data={historicalData} />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="technical">
                      <Card>
                        <CardHeader>
                          <CardTitle>Moving Averages (Last 10 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <MovingAverageChart data={historicalData} />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="recommendation">
                      <Card>
                        <CardHeader>
                          <CardTitle>Investment Recommendation</CardTitle>
                          <CardDescription>Based on 1-year historical data analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <StockRecommendation
                            data={yearlyData}
                            currentPrice={stockData.price}
                            stockSymbol={selectedStock}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </>
              )
            )}
          </div>
        )}
      </div>
    </main>
  )
}

function StockDataSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}