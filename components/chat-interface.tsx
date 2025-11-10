"use client"

import { useState, useRef, useEffect } from "react"
import { useAccount } from "@/lib/stellar-wallet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Send, Bot, User, Zap, TrendingUp, Lock, Wallet, HelpCircle, Sparkles, MessageSquare, Copy, ThumbsUp, ThumbsDown } from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  command?: string
  data?: any
}

interface ChatInterfaceProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [mounted, setMounted] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { address, isConnected } = useAccount()

  // Initialize welcome message on client side only
  useEffect(() => {
    setMounted(true)
    setMessages([{
      id: "welcome",
      type: "bot",
      content: "👋 Hello! I'm your Sphira AI Assistant, powered by advanced blockchain intelligence.\n\nI can help you with:\n• Creating and managing SIPs\n• Portfolio optimization\n• Yield farming strategies\n• Emergency fund management\n• Real-time market insights\n\nTry asking me something like \"How do I create a SIP?\" or use commands like `/portfolio` to get started!",
      timestamp: new Date(),
    }])
  }, [])

  const quickCommands = [
    { command: "/portfolio", label: "Portfolio", icon: TrendingUp },
    { command: "/balance", label: "Balance", icon: Wallet },
    { command: "/yield", label: "Yield", icon: Zap },
    { command: "/help", label: "Help", icon: HelpCircle },
  ]

  const suggestions = [
    "How do I create a SIP?",
    "What's my portfolio performance?",
    "Show me the best yield opportunities",
    "How does the emergency vault work?",
    "What tokens can I invest in?",
    "Explain yield optimization",
  ]

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages, isTyping])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsTyping(true)

    try {
      // Call the real API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          userId: address || 'anonymous'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Simulate typing delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const botResponse: Message = {
          id: Date.now().toString(),
          type: "bot",
          content: data.data.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botResponse])
      } else {
        throw new Error('API call failed')
      }
    } catch (error) {
      console.error('Chat API error:', error)
      const errorResponse: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: "I'm having trouble connecting right now. Please check your connection and try again! 🔄",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const handleQuickCommand = (command: string) => {
    setInput(command)
    handleSendMessage()
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const formatMessage = (content: string) => {
    // Simple formatting for better readability
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded">$1</code>')
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-2rem)] bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-purple-200 dark:border-purple-800">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                <Sparkles className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Sphira AI Assistant
            </h2>
            <p className="text-sm text-muted-foreground">
              {isConnected ? `Connected as ${address?.slice(0, 6)}...${address?.slice(-4)}` : "AI-powered DeFi companion"}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Online
        </Badge>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div key={message.id} className={`flex items-start space-x-4 ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
              <Avatar className={`h-8 w-8 ${message.type === "user" ? "bg-blue-500" : ""}`}>
                <AvatarFallback className={message.type === "user" ? "bg-blue-500 text-white" : "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"}>
                  {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex-1 max-w-3xl ${message.type === "user" ? "text-right" : ""}`}>
                <div className={`inline-block p-4 rounded-2xl ${
                  message.type === "user" 
                    ? "bg-blue-500 text-white ml-auto" 
                    : "bg-muted/50 border"
                }`}>
                  <div 
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                </div>
                
                <div className={`flex items-center mt-2 space-x-2 text-xs text-muted-foreground ${message.type === "user" ? "justify-end" : ""}`}>
                  <span>{mounted ? message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}</span>
                  {message.type === "bot" && (
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyMessage(message.content)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted/50 border rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200" />
                  </div>
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Quick Commands */}
        <div className="px-6 py-3 border-b">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Quick actions:</span>
            {quickCommands.map((cmd) => (
              <Button
                key={cmd.command}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                onClick={() => handleQuickCommand(cmd.command)}
              >
                <cmd.icon className="h-3 w-3 mr-1" />
                {cmd.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Suggestions (show when no messages from user) */}
        {messages.length === 1 && (
          <div className="px-6 py-4 border-b">
            <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestions.map((suggestion, index) => (
                <Card 
                  key={index}
                  className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <p className="text-sm">{suggestion}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6">
          <div className="flex items-end space-x-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about DeFi, SIPs, yield farming, or use commands like /portfolio..."
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                className="min-h-[48px] pr-12 resize-none rounded-xl border-2 focus:border-purple-300 dark:focus:border-purple-700"
                disabled={isTyping}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  disabled={!input.trim() || isTyping}
                  className="h-8 w-8 p-0 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2 max-w-4xl mx-auto">
            Sphira AI can make mistakes. Consider checking important information and always verify transactions.
          </p>
        </div>
      </div>
    </div>
  )
}

