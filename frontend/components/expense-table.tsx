"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search } from "lucide-react"

interface Expense {
  id: number
  date: string
  category: string
  amount: number
  description: string
}

interface ExpenseTableProps {
  expenses: Expense[]
}

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Expense
    direction: "ascending" | "descending"
  } | null>(null)

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter((expense) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      expense.category.toLowerCase().includes(searchLower) ||
      expense.description.toLowerCase().includes(searchLower) ||
      expense.date.includes(searchTerm) ||
      expense.amount.toString().includes(searchTerm)
    )
  })

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (!sortConfig) return 0

    const { key, direction } = sortConfig

    if (a[key] < b[key]) {
      return direction === "ascending" ? -1 : 1
    }
    if (a[key] > b[key]) {
      return direction === "ascending" ? 1 : -1
    }
    return 0
  })

  // Handle sort request
  const requestSort = (key: keyof Expense) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => requestSort("date")}>
                Date
                {sortConfig?.key === "date" && <span>{sortConfig.direction === "ascending" ? " ↑" : " ↓"}</span>}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("category")}>
                Category
                {sortConfig?.key === "category" && <span>{sortConfig.direction === "ascending" ? " ↑" : " ↓"}</span>}
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => requestSort("amount")}>
                Amount
                {sortConfig?.key === "amount" && <span>{sortConfig.direction === "ascending" ? " ↑" : " ↓"}</span>}
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpenses.length > 0 ? (
              sortedExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No expenses found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
