"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, BookOpen, TrendingUp, BarChart, Newspaper } from "lucide-react"
import { useEffect, useState } from "react"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true) // Ensure hydration
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)

    const handleStorageChange = () => {
      const token = localStorage.getItem("token")
      setIsLoggedIn(!!token)
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    router.push("/auth")
  }

  if (!isHydrated) {
    return null
  }

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-10 top-0 left-0 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary">Fin-Mate</span>
            </div>
            {isLoggedIn && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === "/"
                      ? "border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/expenses"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === "/expenses"
                      ? "border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Expenses
                </Link>
                <Link
                  href="/stock"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === "/stock"
                      ? "border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Stocks
                </Link>
                <Link
                  href="/news"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === "/news"
                      ? "border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Newspaper className="mr-2 h-4 w-4" />
                  News
                </Link>
                <Link
                  href="/terminologies"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === "/terminologies"
                      ? "border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Terminologies
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Login / Signup
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}