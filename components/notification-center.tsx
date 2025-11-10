"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, Check, AlertTriangle, Info, Zap, Shield } from "lucide-react"
import { useApi } from "@/lib/api"
import { getPublicKey } from "@/lib/stellar-wallet"

interface Notification {
  id: number
  type: string
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: "normal" | "high" | "urgent"
  data?: any
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const api = useApi()

  // Ensure component is mounted before making API calls
  useEffect(() => {
    setMounted(true)
    checkConnection()
  }, [])

  const checkConnection = async () => {
    const publicKey = await getPublicKey()
    if (publicKey) {
      setAddress(publicKey)
      setIsConnected(true)
    }
  }

  useEffect(() => {
    if (!mounted) return // Don't run until component is mounted
    
    if (isConnected && address) {
      loadNotifications()
      // Set up polling for new notifications only when wallet is connected
      const interval = setInterval(() => {
        // Double-check wallet is still connected before making API call
        if (isConnected && address) {
          loadNotifications()
        }
      }, 30000) // Poll every 30 seconds
      return () => clearInterval(interval)
    } else {
      // Clear notifications when wallet is not connected
      setNotifications([])
      setUnreadCount(0)
    }
  }, [address, isConnected, mounted])

  const loadNotifications = async () => {
    // Absolutely prevent API calls without wallet connection
    if (!mounted || !isConnected || !address) {
      return
    }

    try {
      const response = await api.notifications.list({ limit: 20, userAddress: address })
      if (response.success && response.data) {
        setNotifications(response.data as any)
        setUnreadCount((response as any).unreadCount || 0)
      } else {
        // Handle API error gracefully - just show empty notifications
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      // Silently handle notification loading errors
      setNotifications([])
      setUnreadCount(0)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await api.notifications.markRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      // Silently handle mark as read errors
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read)
      await Promise.all(unreadNotifications.map((n) => api.notifications.markRead(n.id)))
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      // Silently handle mark all as read errors
    }
  }

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === "urgent") return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (priority === "high") return <Zap className="h-4 w-4 text-yellow-500" />

    switch (type) {
      case "security_alert":
        return <Shield className="h-4 w-4 text-red-500" />
      case "yield_opportunity":
        return <Zap className="h-4 w-4 text-green-500" />
      case "sip_execution":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive"
      case "high":
        return "default"
      default:
        return "secondary"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  // Don't render notification center if wallet is not connected
  if (!mounted || !isConnected) {
    return (
      <Button variant="outline" size="sm" className="relative bg-transparent" disabled>
        <Bell className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-transparent">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">{unreadCount}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            {unreadCount > 0 && <CardDescription>{unreadCount} unread notifications</CardDescription>}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b hover:bg-muted/50 transition-colors ${
                        !notification.read ? "bg-muted/30" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.priority)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getPriorityColor(notification.priority) as any} className="text-xs">
                                {notification.priority}
                              </Badge>
                              {!notification.read && (
                                <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{formatTimestamp(notification.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
