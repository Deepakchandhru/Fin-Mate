"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, TrendingUp, TrendingDown, Clock, AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import Navbar from "@/components/navbar"
import { STOCK_LIST } from "@/data/stocks"

// Types
type Transaction = {
  id: string
  type: "buy" | "sell"
  symbol: string
  name: string
  quantity: number
  price: number
  total: number
  timestamp: Date
}

type PortfolioItem = {
  symbol: string
  name: string
  quantity: number
  averageBuyPrice: number
  currentPrice: number
  currentValue: number
  profitLoss: number
  profitLossPercentage: number
}

type WatchlistItem = {
  symbol: string
  name: string
  addedAt: Date
  price: number
  currentPrice: number
  change: number
  changePercent: number
}

export default function PracticePage() {
  // User's virtual balance
  const [balance, setBalance] = useState(1000000) // Start with ₹10,00,000

  // Portfolio state
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [initialInvestment, setInitialInvestment] = useState(0)

  // Transactions history
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Watchlist
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])

  // Market data
  const [marketData, setMarketData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  // Selected stock for trading
  const [selectedStock, setSelectedStock] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [stockPrice, setStockPrice] = useState(0)
  const [stockData, setStockData] = useState(null)

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStocks, setFilteredStocks] = useState(STOCK_LIST)

  // Dialog state
  const [buyDialogOpen, setBuyDialogOpen] = useState(false)
  const [sellDialogOpen, setSellDialogOpen] = useState(false)

  // Load initial data
  useEffect(() => {
    // Load saved data from localStorage if available
    const savedBalance = localStorage.getItem("practice_balance")
    const savedPortfolio = localStorage.getItem("practice_portfolio")
    const savedTransactions = localStorage.getItem("practice_transactions")
    const savedWatchlist = localStorage.getItem("practice_watchlist")

    if (savedBalance) setBalance(Number.parseFloat(savedBalance))
    if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio))
    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions)
      // Convert string timestamps back to Date objects
      setTransactions(
        parsedTransactions.map((t) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        })),
      )
    }
    if (savedWatchlist) {
      const parsedWatchlist = JSON.parse(savedWatchlist)
      setWatchlist(
        parsedWatchlist.map((w) => ({
          ...w,
          addedAt: new Date(w.addedAt),
        })),
      )
    }

    // Fetch initial market data for all stocks
    fetchAllMarketData()
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("practice_balance", balance.toString())
  }, [balance])

  useEffect(() => {
    localStorage.setItem("practice_portfolio", JSON.stringify(portfolio))

    // Calculate total portfolio value
    const totalValue = portfolio.reduce((sum, item) => sum + item.currentValue, 0)
    setPortfolioValue(totalValue)

    // Calculate initial investment
    const totalInvestment = portfolio.reduce((sum, item) => sum + item.averageBuyPrice * item.quantity, 0)
    setInitialInvestment(totalInvestment)
  }, [portfolio])

  useEffect(() => {
    localStorage.setItem("practice_transactions", JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem("practice_watchlist", JSON.stringify(watchlist))
  }, [watchlist])

  // Filter stocks based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = STOCK_LIST.filter(
        (stock) =>
          stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredStocks(filtered)
    } else {
      setFilteredStocks(STOCK_LIST)
    }
  }, [searchTerm])

  // Fetch market data for all stocks
  const fetchAllMarketData = async () => {
    setLoading(true)
    try {
      const data = {}

      // In a real app, you would batch these requests or have an API endpoint
      // that returns data for multiple stocks. For simplicity, we'll use our mock API.
      for (const stock of STOCK_LIST.slice(0, 20)) {
        // Limit to 20 for demo
        const response = await fetch(`/api/stock?symbol=${stock.symbol}`)
        if (response.ok) {
          const stockData = await response.json()
          data[stock.symbol] = stockData.currentData
        }
      }

      setMarketData(data)

      // Update portfolio with current prices
      updatePortfolioPrices(data)

      // Update watchlist with current prices
      updateWatchlistPrices(data)
    } catch (error) {
      console.error("Error fetching market data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch market data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update portfolio items with current market prices
  const updatePortfolioPrices = (marketData) => {
    if (Object.keys(marketData).length === 0) return

    setPortfolio((prevPortfolio) =>
      prevPortfolio.map((item) => {
        const currentData = marketData[item.symbol]
        if (!currentData) return item

        const currentPrice = currentData.price
        const currentValue = currentPrice * item.quantity
        const profitLoss = currentValue - item.averageBuyPrice * item.quantity
        const profitLossPercentage = ((currentPrice - item.averageBuyPrice) / item.averageBuyPrice) * 100

        return {
          ...item,
          currentPrice,
          currentValue,
          profitLoss,
          profitLossPercentage,
        }
      }),
    )
  }

  // Update watchlist items with current market prices
  const updateWatchlistPrices = (marketData) => {
    if (Object.keys(marketData).length === 0) return

    setWatchlist((prevWatchlist) =>
      prevWatchlist.map((item) => {
        const currentData = marketData[item.symbol]
        if (!currentData) return item

        return {
          ...item,
          currentPrice: currentData.price,
          change: currentData.change,
          changePercent: currentData.changePercent,
        }
      }),
    )
  }

  // Fetch data for a specific stock
  const fetchStockData = async (symbol) => {
    try {
      const response = await fetch(`/api/stock?symbol=${symbol}`)
      if (!response.ok) {
        throw new Error("Failed to fetch stock data")
      }

      const data = await response.json()
      setStockData(data.currentData)
      setStockPrice(data.currentData.price)

      // Update market data
      setMarketData((prev) => ({
        ...prev,
        [symbol]: data.currentData,
      }))
    } catch (error) {
      console.error("Error fetching stock data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch stock data. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle stock selection for trading
  const handleSelectStock = (symbol) => {
    setSelectedStock(symbol)
    setQuantity(1)
    fetchStockData(symbol)
  }

  // Buy stock
  const handleBuyStock = () => {
    if (!selectedStock || !stockData || quantity <= 0) {
      toast({
        title: "Error",
        description: "Please select a stock and enter a valid quantity.",
        variant: "destructive",
      })
      return
    }

    const totalCost = stockPrice * quantity

    if (totalCost > balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance to complete this purchase.",
        variant: "destructive",
      })
      return
    }

    // Create transaction record
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: "buy",
      symbol: selectedStock,
      name: stockData.name,
      quantity,
      price: stockPrice,
      total: totalCost,
      timestamp: new Date(),
    }

    // Update transactions history
    setTransactions((prev) => [transaction, ...prev])

    // Update balance
    setBalance((prev) => prev - totalCost)

    // Update portfolio
    const existingPosition = portfolio.find((item) => item.symbol === selectedStock)

    if (existingPosition) {
      // Update existing position
      const newQuantity = existingPosition.quantity + quantity
      const newAverageBuyPrice =
        (existingPosition.averageBuyPrice * existingPosition.quantity + stockPrice * quantity) / newQuantity

      setPortfolio((prev) =>
        prev.map((item) =>
          item.symbol === selectedStock
            ? {
                ...item,
                quantity: newQuantity,
                averageBuyPrice: newAverageBuyPrice,
                currentValue: newQuantity * stockPrice,
                profitLoss: (stockPrice - newAverageBuyPrice) * newQuantity,
                profitLossPercentage: ((stockPrice - newAverageBuyPrice) / newAverageBuyPrice) * 100,
              }
            : item,
        ),
      )
    } else {
      // Add new position
      const newPosition: PortfolioItem = {
        symbol: selectedStock,
        name: stockData.name,
        quantity,
        averageBuyPrice: stockPrice,
        currentPrice: stockPrice,
        currentValue: stockPrice * quantity,
        profitLoss: 0,
        profitLossPercentage: 0,
      }

      setPortfolio((prev) => [...prev, newPosition])
    }

    // Reset form and close dialog
    setQuantity(1)
    setBuyDialogOpen(false)

    toast({
      title: "Purchase Successful",
      description: `You bought ${quantity} shares of ${stockData.name} for ₹${totalCost.toFixed(2)}.`,
    })
  }

  // Sell stock
  const handleSellStock = () => {
    if (!selectedStock || !stockData || quantity <= 0) {
      toast({
        title: "Error",
        description: "Please select a stock and enter a valid quantity.",
        variant: "destructive",
      })
      return
    }

    const position = portfolio.find((item) => item.symbol === selectedStock)

    if (!position) {
      toast({
        title: "Error",
        description: "You don't own any shares of this stock.",
        variant: "destructive",
      })
      return
    }

    if (quantity > position.quantity) {
      toast({
        title: "Error",
        description: `You only own ${position.quantity} shares of this stock.`,
        variant: "destructive",
      })
      return
    }

    const saleValue = stockPrice * quantity

    // Create transaction record
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: "sell",
      symbol: selectedStock,
      name: stockData.name,
      quantity,
      price: stockPrice,
      total: saleValue,
      timestamp: new Date(),
    }

    // Update transactions history
    setTransactions((prev) => [transaction, ...prev])

    // Update balance
    setBalance((prev) => prev + saleValue)

    // Update portfolio
    if (position.quantity === quantity) {
      // Remove position if selling all shares
      setPortfolio((prev) => prev.filter((item) => item.symbol !== selectedStock))
    } else {
      // Update position if selling some shares
      setPortfolio((prev) =>
        prev.map((item) =>
          item.symbol === selectedStock
            ? {
                ...item,
                quantity: item.quantity - quantity,
                currentValue: (item.quantity - quantity) * stockPrice,
                profitLoss: (stockPrice - item.averageBuyPrice) * (item.quantity - quantity),
                profitLossPercentage: ((stockPrice - item.averageBuyPrice) / item.averageBuyPrice) * 100,
              }
            : item,
        ),
      )
    }

    // Reset form and close dialog
    setQuantity(1)
    setSellDialogOpen(false)

    toast({
      title: "Sale Successful",
      description: `You sold ${quantity} shares of ${stockData.name} for ₹${saleValue.toFixed(2)}.`,
    })
  }

  // Add stock to watchlist
  const handleAddToWatchlist = (symbol, name) => {
    // Check if already in watchlist
    if (watchlist.some((item) => item.symbol === symbol)) {
      toast({
        title: "Already in Watchlist",
        description: `${name} is already in your watchlist.`,
      })
      return
    }

    // Get current price from market data
    const stockData = marketData[symbol]

    if (!stockData) {
      // Fetch data if not available
      fetchStockData(symbol).then(() => {
        const newItem: WatchlistItem = {
          symbol,
          name,
          addedAt: new Date(),
          price: marketData[symbol]?.price || 0,
          currentPrice: marketData[symbol]?.price || 0,
          change: marketData[symbol]?.change || 0,
          changePercent: marketData[symbol]?.changePercent || 0,
        }

        setWatchlist((prev) => [...prev, newItem])

        toast({
          title: "Added to Watchlist",
          description: `${name} has been added to your watchlist.`,
        })
      })
    } else {
      // Use available data
      const newItem: WatchlistItem = {
        symbol,
        name,
        addedAt: new Date(),
        price: stockData.price,
        currentPrice: stockData.price,
        change: stockData.change,
        changePercent: stockData.changePercent,
      }

      setWatchlist((prev) => [...prev, newItem])

      toast({
        title: "Added to Watchlist",
        description: `${name} has been added to your watchlist.`,
      })
    }
  }

  // Remove stock from watchlist
  const handleRemoveFromWatchlist = (symbol) => {
    setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol))

    toast({
      title: "Removed from Watchlist",
      description: `Stock has been removed from your watchlist.`,
    })
  }

  // Reset practice account
  const handleResetAccount = () => {
    if (
      confirm(
        "Are you sure you want to reset your practice account? This will clear your portfolio, transactions, and watchlist.",
      )
    ) {
      setBalance(1000000)
      setPortfolio([])
      setTransactions([])
      setWatchlist([])

      localStorage.removeItem("practice_balance")
      localStorage.removeItem("practice_portfolio")
      localStorage.removeItem("practice_transactions")
      localStorage.removeItem("practice_watchlist")

      toast({
        title: "Account Reset",
        description: "Your practice account has been reset to the initial state.",
      })
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center p-4 md:p-8 pt-20">
        <h1 className="text-3xl font-bold mb-2">Stock Market Practice</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-2xl">
          Practice trading with virtual money. Buy and sell stocks to learn how the market works without risking real
          money.
        </p>

        <div className="w-full max-w-7xl">
          {/* Account Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Available Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(portfolioValue)}</div>
                {initialInvestment > 0 && (
                  <div className="flex items-center mt-2">
                    {portfolioValue > initialInvestment ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500 text-sm">
                          +{formatCurrency(portfolioValue - initialInvestment)} (
                          {(((portfolioValue - initialInvestment) / initialInvestment) * 100).toFixed(2)}%)
                        </span>
                      </>
                    ) : portfolioValue < initialInvestment ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-red-500 text-sm">
                          {formatCurrency(portfolioValue - initialInvestment)} (
                          {(((portfolioValue - initialInvestment) / initialInvestment) * 100).toFixed(2)}%)
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground text-sm">No change</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(balance + portfolioValue)}</div>
                <div className="flex items-center mt-2">
                  <Progress value={(portfolioValue / (balance + portfolioValue)) * 100} className="h-2" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Cash: {((balance / (balance + portfolioValue)) * 100).toFixed(1)}%</span>
                  <span>Invested: {((portfolioValue / (balance + portfolioValue)) * 100).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="market">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            {/* Market Tab */}
            <TabsContent value="market">
              <Card>
                <CardHeader>
                  <CardTitle>Market Overview</CardTitle>
                  <CardDescription>Browse and trade stocks from the Indian market</CardDescription>
                  <div className="mt-2">
                    <Input
                      placeholder="Search stocks by name or symbol..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border-b">
                          <div>
                            <Skeleton className="h-5 w-40 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <div className="text-right">
                            <Skeleton className="h-5 w-24 mb-1" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredStocks.slice(0, 20).map((stock) => (
                        <div
                          key={stock.symbol}
                          className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                          onClick={() => handleSelectStock(stock.symbol)}
                        >
                          <div>
                            <div className="font-medium">{stock.name}</div>
                            <div className="text-sm text-muted-foreground">{stock.symbol}</div>
                          </div>
                          <div className="text-right">
                            {marketData[stock.symbol] ? (
                              <>
                                <div className="font-medium">{formatCurrency(marketData[stock.symbol].price)}</div>
                                <div
                                  className={`text-sm flex items-center justify-end ${
                                    marketData[stock.symbol].change > 0
                                      ? "text-green-500"
                                      : marketData[stock.symbol].change < 0
                                        ? "text-red-500"
                                        : "text-muted-foreground"
                                  }`}
                                >
                                  {marketData[stock.symbol].change > 0 ? (
                                    <ArrowUp className="h-3 w-3 mr-1" />
                                  ) : marketData[stock.symbol].change < 0 ? (
                                    <ArrowDown className="h-3 w-3 mr-1" />
                                  ) : null}
                                  {marketData[stock.symbol].change > 0 ? "+" : ""}
                                  {marketData[stock.symbol].change.toFixed(2)} (
                                  {marketData[stock.symbol].changePercent.toFixed(2)}%)
                                </div>
                              </>
                            ) : (
                              <div className="text-sm text-muted-foreground">Loading...</div>
                            )}
                          </div>
                        </div>
                      ))}

                      {filteredStocks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No stocks found matching "{searchTerm}"
                        </div>
                      )}

                      {filteredStocks.length > 20 && (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          Showing 20 of {filteredStocks.length} stocks. Please refine your search to see more results.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={fetchAllMarketData}>
                    Refresh Data
                  </Button>
                  <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</div>
                </CardFooter>
              </Card>

              {/* Selected Stock Details */}
              {selectedStock && stockData && (
                <Card className="mt-4">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{stockData.name}</CardTitle>
                        <CardDescription>{selectedStock}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatCurrency(stockPrice)}</div>
                        <div
                          className={`flex items-center justify-end ${
                            stockData.change > 0
                              ? "text-green-500"
                              : stockData.change < 0
                                ? "text-red-500"
                                : "text-muted-foreground"
                          }`}
                        >
                          {stockData.change > 0 ? (
                            <ArrowUp className="h-4 w-4 mr-1" />
                          ) : stockData.change < 0 ? (
                            <ArrowDown className="h-4 w-4 mr-1" />
                          ) : null}
                          {stockData.change > 0 ? "+" : ""}
                          {stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Today's High</div>
                        <div className="font-medium">{formatCurrency(stockData.high)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Today's Low</div>
                        <div className="font-medium">{formatCurrency(stockData.low)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Volume</div>
                        <div className="font-medium">{stockData.volume.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Your Position</div>
                        <div className="font-medium">
                          {portfolio.find((item) => item.symbol === selectedStock)?.quantity || 0} shares
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>Buy</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Buy {stockData.name}</DialogTitle>
                          <DialogDescription>Current price: {formatCurrency(stockPrice)}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Quantity</label>
                            <Input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Total Cost</label>
                            <div className="text-xl font-bold">{formatCurrency(stockPrice * quantity)}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Available: {formatCurrency(balance)}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setBuyDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleBuyStock} disabled={quantity <= 0 || stockPrice * quantity > balance}>
                            Buy {quantity} {quantity === 1 ? "share" : "shares"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="secondary">Sell</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Sell {stockData.name}</DialogTitle>
                          <DialogDescription>Current price: {formatCurrency(stockPrice)}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Quantity</label>
                            <Input
                              type="number"
                              min="1"
                              max={portfolio.find((item) => item.symbol === selectedStock)?.quantity || 0}
                              value={quantity}
                              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                              Available: {portfolio.find((item) => item.symbol === selectedStock)?.quantity || 0} shares
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Total Value</label>
                            <div className="text-xl font-bold">{formatCurrency(stockPrice * quantity)}</div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSellDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSellStock}
                            disabled={
                              quantity <= 0 ||
                              !portfolio.find((item) => item.symbol === selectedStock) ||
                              quantity > (portfolio.find((item) => item.symbol === selectedStock)?.quantity || 0)
                            }
                          >
                            Sell {quantity} {quantity === 1 ? "share" : "shares"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      onClick={() => handleAddToWatchlist(selectedStock, stockData.name)}
                      disabled={watchlist.some((item) => item.symbol === selectedStock)}
                    >
                      {watchlist.some((item) => item.symbol === selectedStock) ? "In Watchlist" : "Add to Watchlist"}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio">
              <Card>
                <CardHeader>
                  <CardTitle>Your Portfolio</CardTitle>
                  <CardDescription>
                    {portfolio.length > 0
                      ? `You own ${portfolio.length} ${portfolio.length === 1 ? "stock" : "stocks"} with a total value of ${formatCurrency(portfolioValue)}`
                      : "You don't own any stocks yet. Start trading to build your portfolio."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {portfolio.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stock</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Avg. Buy Price</TableHead>
                          <TableHead>Current Price</TableHead>
                          <TableHead>Current Value</TableHead>
                          <TableHead>Profit/Loss</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {portfolio.map((item) => (
                          <TableRow key={item.symbol}>
                            <TableCell>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.symbol}</div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.averageBuyPrice)}</TableCell>
                            <TableCell>{formatCurrency(item.currentPrice)}</TableCell>
                            <TableCell>{formatCurrency(item.currentValue)}</TableCell>
                            <TableCell>
                              <div
                                className={`flex items-center ${
                                  item.profitLoss > 0
                                    ? "text-green-500"
                                    : item.profitLoss < 0
                                      ? "text-red-500"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {item.profitLoss > 0 ? (
                                  <ArrowUp className="h-4 w-4 mr-1" />
                                ) : item.profitLoss < 0 ? (
                                  <ArrowDown className="h-4 w-4 mr-1" />
                                ) : null}
                                {formatCurrency(item.profitLoss)} ({item.profitLossPercentage.toFixed(2)}%)
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleSelectStock(item.symbol)
                                  document.getElementById("market-tab")?.click()
                                }}
                              >
                                Trade
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Stocks in Portfolio</h3>
                      <p className="text-muted-foreground mb-4">
                        Your portfolio is empty. Start by buying some stocks from the Market tab.
                      </p>
                      <Button onClick={() => document.getElementById("market-tab")?.click()}>Go to Market</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Watchlist Tab */}
            <TabsContent value="watchlist">
              <Card>
                <CardHeader>
                  <CardTitle>Your Watchlist</CardTitle>
                  <CardDescription>
                    {watchlist.length > 0
                      ? `You are watching ${watchlist.length} ${watchlist.length === 1 ? "stock" : "stocks"}`
                      : "Your watchlist is empty. Add stocks to track their performance."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {watchlist.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stock</TableHead>
                          <TableHead>Current Price</TableHead>
                          <TableHead>Change</TableHead>
                          <TableHead>Added On</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {watchlist.map((item) => (
                          <TableRow key={item.symbol}>
                            <TableCell>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">{item.symbol}</div>
                            </TableCell>
                            <TableCell>{formatCurrency(item.currentPrice)}</TableCell>
                            <TableCell>
                              <div
                                className={`flex items-center ${
                                  item.change > 0
                                    ? "text-green-500"
                                    : item.change < 0
                                      ? "text-red-500"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {item.change > 0 ? (
                                  <ArrowUp className="h-4 w-4 mr-1" />
                                ) : item.change < 0 ? (
                                  <ArrowDown className="h-4 w-4 mr-1" />
                                ) : null}
                                {item.change > 0 ? "+" : ""}
                                {item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="text-sm">{formatDate(item.addedAt)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    handleSelectStock(item.symbol)
                                    document.getElementById("market-tab")?.click()
                                  }}
                                >
                                  Trade
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFromWatchlist(item.symbol)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Stocks in Watchlist</h3>
                      <p className="text-muted-foreground mb-4">
                        Your watchlist is empty. Add stocks from the Market tab to track their performance.
                      </p>
                      <Button onClick={() => document.getElementById("market-tab")?.click()}>Go to Market</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    {transactions.length > 0
                      ? `You have made ${transactions.length} ${transactions.length === 1 ? "transaction" : "transactions"}`
                      : "You haven't made any transactions yet."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                            <TableCell>
                              <Badge variant={transaction.type === "buy" ? "default" : "secondary"}>
                                {transaction.type === "buy" ? "BUY" : "SELL"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{transaction.name}</div>
                              <div className="text-sm text-muted-foreground">{transaction.symbol}</div>
                            </TableCell>
                            <TableCell>{transaction.quantity}</TableCell>
                            <TableCell>{formatCurrency(transaction.price)}</TableCell>
                            <TableCell>
                              <span className={transaction.type === "buy" ? "text-red-500" : "text-green-500"}>
                                {transaction.type === "buy" ? "-" : "+"}
                                {formatCurrency(transaction.total)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Transaction History</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't made any transactions yet. Start by buying some stocks from the Market tab.
                      </p>
                      <Button onClick={() => document.getElementById("market-tab")?.click()}>Go to Market</Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleResetAccount}>
                    Reset Practice Account
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}

