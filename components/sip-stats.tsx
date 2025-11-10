"use client"

import { useState, useEffect } from "react"
import { useAccount } from "@/lib/stellar-wallet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar, DollarSign, Target, Loader2 } from "lucide-react"

export function SIPStats() {
  const [stats, setStats] = useState({
    activeSIPs: 0,
    totalInvested: "0",
    nextExecution: "None",
    nextExecutionCount: 0,
    averageProgress: 0
  })
  const [loading, setLoading] = useState(true)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (isConnected && address) {
      fetchSIPStats()
    } else {
      setLoading(false)
    }
  }, [isConnected, address])

  const fetchSIPStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sips?userAddress=${address}`)
      const result = await response.json()
      
      if (result.success) {
        const sips = result.data
        const activeSIPs = sips.filter((sip: any) => sip.status === 'Active').length
        
        // Calculate total invested
        const totalInvested = sips.reduce((sum: number, sip: any) => {
          return sum + parseFloat(sip.total_deposits || 0)
        }, 0)

        // Find next execution
        let nextExecution = "None"
        let nextExecutionCount = 0
        if (activeSIPs > 0) {
          const activeSIPsList = sips.filter((sip: any) => sip.status === 'Active')
          const nextExecutions = activeSIPsList
            .map((sip: any) => new Date(sip.next_execution))
            .sort((a: Date, b: Date) => a.getTime() - b.getTime())
          
          if (nextExecutions.length > 0) {
            const nextDate = nextExecutions[0]
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(today.getDate() + 1)
            
            if (nextDate.toDateString() === today.toDateString()) {
              nextExecution = "Today"
            } else if (nextDate.toDateString() === tomorrow.toDateString()) {
              nextExecution = "Tomorrow"
            } else {
              nextExecution = nextDate.toLocaleDateString()
            }
            
            // Count how many SIPs execute on the next date
            nextExecutionCount = activeSIPsList.filter((sip: any) => 
              new Date(sip.next_execution).toDateString() === nextDate.toDateString()
            ).length
          }
        }

        // Calculate average progress (based on execution count)
        const averageProgress = activeSIPs > 0 
          ? Math.round(sips.reduce((sum: number, sip: any) => sum + (sip.execution_count || 0), 0) / activeSIPs * 10)
          : 0

        setStats({
          activeSIPs,
          totalInvested: totalInvested.toFixed(2),
          nextExecution,
          nextExecutionCount,
          averageProgress: Math.min(averageProgress, 100)
        })
      }
    } catch (error) {
      console.error("Failed to fetch SIP stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statsData = [
    {
      title: "Active SIPs",
      value: loading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.activeSIPs.toString(),
      icon: TrendingUp,
      description: "Currently running",
    },
    {
      title: "Total Invested",
      value: loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${stats.totalInvested} Tokens`,
      icon: DollarSign,
      description: "Across all SIPs",
    },
    {
      title: "Next Execution",
      value: loading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.nextExecution,
      icon: Calendar,
      description: stats.nextExecutionCount > 0 ? `${stats.nextExecutionCount} SIPs scheduled` : "No executions scheduled",
    },
    {
      title: "Avg Progress",
      value: loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${stats.averageProgress}%`,
      icon: Target,
      description: "Based on executions",
    },
  ]

  if (!isConnected) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Connect Wallet</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Connect to view stats</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

