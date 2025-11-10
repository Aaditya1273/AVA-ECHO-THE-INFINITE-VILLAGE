"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const [theme, setTheme] = useState("system")

  useEffect(() => {
    // Load saved theme on mount
    const savedTheme = localStorage.getItem('sphira-theme') || 'system'
    setTheme(savedTheme)
    applyTheme(savedTheme)

    // Listen for theme changes from settings
    const handleThemeChange = (event: any) => {
      setTheme(event.detail)
    }

    window.addEventListener('themeChanged', handleThemeChange)
    return () => window.removeEventListener('themeChanged', handleThemeChange)
  }, [])

  const applyTheme = (newTheme: string) => {
    const root = document.documentElement
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else if (newTheme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      // System theme
      root.classList.remove('dark', 'light')
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (systemPrefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.add('light')
      }
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    applyTheme(newTheme)
    // Store in localStorage
    localStorage.setItem('sphira-theme', newTheme)
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }))
  }

  const getThemeIcon = () => {
    if (theme === 'dark') {
      return <Moon className="h-4 w-4" />
    } else if (theme === 'light') {
      return <Sun className="h-4 w-4" />
    } else {
      return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 hover:scale-105">
          {getThemeIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card/80 backdrop-blur-xl border-0 shadow-2xl">
        <DropdownMenuItem 
          onClick={() => handleThemeChange("light")}
          className={theme === 'light' ? 'bg-primary/20' : ''}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("dark")}
          className={theme === 'dark' ? 'bg-primary/20' : ''}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("system")}
          className={theme === 'system' ? 'bg-primary/20' : ''}
        >
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
