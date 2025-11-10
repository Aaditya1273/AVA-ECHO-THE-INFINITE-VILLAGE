"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useState, useEffect } from "react"
import { useAccount } from "@/lib/stellar-wallet"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Wallet, AlertTriangle } from "lucide-react"

export function YieldHistory() {
  const { address, isConnected } = useAccount()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasRealData, setHasRealData] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      loadRealYieldData()
    } else {
      setLoading(false)
    }
  }, [address, isConnected])

  const loadRealYieldData = async () => {
    try {
      setLoading(true)
      
      // Fetch real yield history from API
      const response = await fetch(`/api/yield?userAddress=${address}`)
      const result = await response.json()
      
      if (result.success && result.data.length > 0) {
        // Process real yield data into chart format
        const yieldData = result.data.map((entry: any) => ({
          date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          apy: parseFloat(entry.apy) || 0,
          earned: parseFloat(entry.earned) || 0
        }))
        
        setData(yieldData)
        setHasRealData(true)
      } else {
        // No real yield data found
        setData([])
        setHasRealData(false)
      }
    } catch (error) {
      console.error("Failed to load real yield data:", error)
      setData([])
      setHasRealData(false)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <Card className="bg-gradient-to-br from-card/50 to-muted/20 backdrop-blur-sm border-0">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Connect Wallet Required</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Connect your wallet to view real yield performance data from Stellar blockchain
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
            Yield Performance History
          </CardTitle>
          <CardDescription>Loading real yield data from blockchain...</CardDescription>
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
              Yield Performance History
            </CardTitle>
            <CardDescription>Track your yield optimization performance over time</CardDescription>
          </div>
          <Badge 
            variant={hasRealData ? "default" : "outline"} 
            className={hasRealData ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted/50"}
          >
            {hasRealData ? "Real Data" : "No Yield History"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!hasRealData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No Yield History Available</h3>
              <p className="text-muted-foreground max-w-md">
                Start using yield optimization to track your performance. Real blockchain data will appear here once you have active positions.
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-500/20 max-w-md">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-green-600">100% Real Blockchain Data</p>
                  <p className="text-muted-foreground">
                    All yield data is fetched directly from Stellar blockchain contracts. No mock or fake data is displayed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={{
              apy: {
                label: "APY %",
                color: "hsl(var(--chart-1))",
              },
              earned: {
                label: "Yield Earned ($)",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="apy"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-chart-1)", strokeWidth: 2, r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="earned"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-chart-2)", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}


