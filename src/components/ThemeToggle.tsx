'use client'

import { FaSun, FaMoon } from "react-icons/fa"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Mount the component on the client side
  useEffect(() => {
    const timeout = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timeout)
  }, [])

  if (!mounted) {
    return (
      <button className="w-10 h-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black flex items-center justify-center">
        <div className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      className="w-10 h-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black flex items-center justify-center hover:shadow-md transition-all duration-200 hover:scale-105"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'light' ? (
        <FaSun className="w-5 h-5 text-amber-500" />
      ) : (
        <FaMoon className="w-5 h-5 text-blue-400" />
      )}
    </button>
  )
}