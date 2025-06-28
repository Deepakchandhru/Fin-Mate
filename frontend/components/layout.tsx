"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Home, BookOpen, TrendingUp, BarChart, MessageSquare, Newspaper } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false) // Ensure hydration

  useEffect(() => {
    // Ensure the component is hydrated before accessing localStorage
    setIsHydrated(true)

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth") // Redirect to login/signup if not authenticated
    } else {
      setIsLoggedIn(true)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    router.push("/auth") // Redirect to login/signup page
  }

  // Prevent rendering until hydration is complete
  if (!isHydrated) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 fixed w-full z-10 top-0 left-0 shadow-sm">
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
                        ? "border-primary text-gray-900 dark:text-gray-100"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/expenses"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === "/expenses"
                        ? "border-primary text-gray-900 dark:text-gray-100"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    Expenses
                  </Link>
                  <Link
                    href="/stock"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === "/stock"
                        ? "border-primary text-gray-900 dark:text-gray-100"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Stocks
                  </Link>
                  <Link
                    href="/news"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === "/news"
                        ? "border-primary text-gray-900 dark:text-gray-100"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <Newspaper className="mr-2 h-4 w-4" />
                    News
                  </Link>
                  <Link
                    href="/chat"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === "/chat"
                        ? "border-primary text-gray-900 dark:text-gray-100"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                  </Link>
                  <Link
                    href="/terminologies"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === "/terminologies"
                        ? "border-primary text-gray-900 dark:text-gray-100"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Terminologies
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">
                Live Market
              </span>
              <ModeToggle />
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Logout
                </button>
              ) : (
                <Link href="/auth" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Login / Signup
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {isLoggedIn && (
              <>
                <Link
                  href="/"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    pathname === "/"
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/expenses"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    pathname === "/expenses"
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  Expenses
                </Link>
                <Link
                  href="/stock"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    pathname === "/stock"
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  Stocks
                </Link>
                <Link
                  href="/news"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    pathname === "/news"
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  News
                </Link>
                <Link
                  href="/chat"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    pathname === "/chat"
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  Chat
                </Link>
                <Link
                  href="/terminologies"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    pathname === "/terminologies"
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  Terminologies
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="pt-16 flex-grow">{children}</div>
    </div>
  )
}