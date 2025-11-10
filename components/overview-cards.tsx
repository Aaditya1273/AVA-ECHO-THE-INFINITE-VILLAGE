"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Zap, Lock, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAccount } from "@/lib/stellar-wallet"

type ChangeType = "positive" | "negative" | "neutral"

export function OverviewCards() {
  const [stats, setStats] = useState([
    {
      title: "Total Portfolio Value",
      value: "0.00",
      change: "+0%",
      changeType: "neutral" as ChangeType,
      icon: DollarSign,
      description: "Across all SIPs and yield pools",
    },
    {
      title: "Active SIPs",
      value: "0",
      change: "Connect wallet",
      changeType: "neutral" as ChangeType,
      icon: TrendingUp,
      description: "Automated investment plans",
    },
    {
      title: "Yield Earned",
      value: "0.00",
      change: "+0%",
      changeType: "neutral" as ChangeType,
      icon: Zap,
      description: "Total yield from optimization",
    },
    {
      title: "Emergency Funds",
      value: "0.00",
      change: "Not locked",
      changeType: "neutral" as ChangeType,
      icon: Lock,
      description: "Secured in emergency vault",
    },
  ])
  const [loading, setLoading] = useState(true)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (isConnected && address) {
      loadRealData()
    } else {
      setLoading(false)
    }
  }, [isConnected, address])

  const loadRealData = async () => {
    try {
      setLoading(true)
      // Fetch real data from API with user address
      const response = await fetch(`/api/portfolio?userAddress=${address}`)
      const data = await response.json()
      
      if (data.success) {
        const portfolio = data.data
        
        setStats([
          {
            title: "Total Portfolio Value",
            value: `${portfolio.totalValue.toFixed(2)}`,
            change: `${portfolio.returnPercentage > 0 ? '+' : ''}${portfolio.returnPercentage.toFixed(1)}%`,
            changeType: portfolio.returnPercentage > 0 ? "positive" : portfolio.returnPercentage < 0 ? "negative" : "neutral",
            icon: DollarSign,
            description: "Across all SIPs and yield pools",
          },
          {
            title: "Active SIPs",
            value: portfolio.activeSIPs.toString(),
            change: `${portfolio.activeSIPs} running`,
            changeType: portfolio.activeSIPs > 0 ? "positive" : "neutral",
            icon: TrendingUp,
            description: "Automated investment plans",
          },
          {
            title: "Yield Earned",
            value: `${portfolio.totalReturn.toFixed(2)}`,
            change: `${portfolio.totalReturn > 0 ? 'Earning' : 'No yield'}`,
            changeType: portfolio.totalReturn > 0 ? "positive" : "neutral",
            icon: Zap,
            description: "Total yield from optimization",
          },
          {
            title: "Emergency Funds",
            value: `${portfolio.totalLocked.toFixed(2)}`,
            change: portfolio.totalLocked > 0 ? "Locked" : "Available",
            changeType: portfolio.totalLocked > 0 ? "neutral" : "positive",
            icon: Lock,
            description: "Secured in emergency vault",
          },
        ])
      }
    } catch (error) {
      console.error("Failed to load real data:", error)
      // Keep default values on error
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Connect Wallet
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Connect to view data</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stat.value}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge
                variant={
                  stat.changeType === "positive"
                    ? "default"
                    : stat.changeType === "negative"
                      ? "destructive"
                      : "secondary"
                }
                className="text-xs"
              >
                {stat.changeType === "positive" && <TrendingUp className="h-3 w-3 mr-1" />}
                {stat.changeType === "negative" && <TrendingDown className="h-3 w-3 mr-1" />}
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : stat.change}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}