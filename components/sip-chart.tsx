"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useState, useEffect } from "react"
import { useAccount } from "@/lib/stellar-wallet"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Wallet } from "lucide-react"

export function SIPChart() {
  const { address, isConnected } = useAccount()
  const [data, setData] = useState([
    { month: "Jan", value: 0, yieldEarned: 0 },
    { month: "Feb", value: 0, yieldEarned: 0 },
    { month: "Mar", value: 0, yieldEarned: 0 },
    { month: "Apr", value: 0, yieldEarned: 0 },
    { month: "May", value: 0, yieldEarned: 0 },
    { month: "Jun", value: 0, yieldEarned: 0 },
  ])
  const [loading, setLoading] = useState(true)
  const [hasRealData, setHasRealData] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      loadRealSIPData()
    } else {
      setLoading(false)
    }
  }, [address, isConnected])

  const loadRealSIPData = async () => {
    try {
      setLoading(true)
      
      // Fetch real SIP data from API
      const response = await fetch(`/api/sips?userAddress=${address}`)
      const result = await response.json()
      
      if (result.success && result.data.length > 0) {
        // Process real SIP data into chart format
        const sipData = result.data
        const chartData = generateChartFromSIPs(sipData)
        setData(chartData)
        setHasRealData(true)
      } else {
        // No real SIPs found - show empty state
        setData([
          { month: "Jan", value: 0, yieldEarned: 0 },
          { month: "Feb", value: 0, yieldEarned: 0 },
          { month: "Mar", value: 0, yieldEarned: 0 },
          { month: "Apr", value: 0, yieldEarned: 0 },
          { month: "May", value: 0, yieldEarned: 0 },
          { month: "Jun", value: 0, yieldEarned: 0 },
        ])
        setHasRealData(false)
      }
    } catch (error) {
      console.error("Failed to load real SIP data:", error)
      setHasRealData(false)
    } finally {
      setLoading(false)
    }
  }

  const generateChartFromSIPs = (sips: any[]) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const currentDate = new Date()
    
    return months.map((month, index) => {
      // Calculate cumulative value based on real SIP executions
      let totalValue = 0
      let totalYield = 0
      
      sips.forEach(sip => {
        const sipStartDate = new Date(sip.created_at)
        const monthDate = new Date(currentDate.getFullYear(), index, 1)
        
        if (sipStartDate <= monthDate) {
          // Calculate how many executions would have happened by this month
          const monthsActive = Math.max(0, index - sipStartDate.getMonth())
          const executionsPerMonth = sip.frequency === 'DAILY' ? 30 : 
                                   sip.frequency === 'WEEKLY' ? 4 : 1
          
          const totalExecutions = Math.min(monthsActive * executionsPerMonth, sip.execution_count)
          totalValue += totalExecutions * parseFloat(sip.amount)
          totalYield += totalValue * (sip.apy_target / 100 / 12) // Monthly yield
        }
      })
      
      return {
        month,
        value: Math.round(totalValue),
        yieldEarned: Math.round(totalYield)
      }
    })
  }

  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-br from-card/50 to-muted/20 backdrop-blur-sm border-0">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Connect Wallet Required</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Connect your wallet to view real SIP performance data from blockchain
          </p>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Real Blockchain Data Only
          </Badge>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 animate-pulse" />
            SIP Performance
          </CardTitle>
          <CardDescription>Loading real SIP data from blockchain...</CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              SIP Performance
            </CardTitle>
            <CardDescription>Your systematic investment plan growth over time</CardDescription>
          </div>
          <Badge 
            variant={hasRealData ? "default" : "outline"} 
            className={hasRealData ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted/50"}
          >
            {hasRealData ? "Real Data" : "No SIPs Active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!hasRealData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <TrendingUp className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No SIP Data Available</h3>
              <p className="text-muted-foreground max-w-md">
                Create your first SIP to start tracking performance. Real blockchain data will appear here.
              </p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={{
              value: {
                label: "Portfolio Value",
                color: "hsl(var(--chart-1))",
              },
              yieldEarned: {
                label: "Yield Earned",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-chart-1)"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="yieldEarned"
                  stroke="var(--color-chart-2)"
                  fillOpacity={1}
                  fill="url(#colorYield)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
