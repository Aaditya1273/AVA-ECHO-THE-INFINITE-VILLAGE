"use client"

import { useState, useEffect } from "react"
import { useAccount } from "@/lib/stellar-wallet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowUpRight, ArrowDownRight, Zap, Lock, TrendingUp, Loader2 } from "lucide-react"

export function RecentActivity() {
  const { address, isConnected } = useAccount()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }

      try {
        // Fetch real activity data from API
        const response = await fetch(`/api/activity?userAddress=${address}`)
        const result = await response.json()
        
        if (result.success) {
          setActivities(result.data || [])
        }
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [address, isConnected])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest transactions and automated actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading activity...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isConnected ? "Start investing to see your activity here" : "Connect your wallet to see your activity"}
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-muted">
                    <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <Badge variant={activity.badgeVariant} className="text-xs">
                      {activity.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium">{activity.amount}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
