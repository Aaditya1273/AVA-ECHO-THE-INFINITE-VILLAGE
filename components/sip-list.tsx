"use client"

import { useState, useEffect } from "react"
import { useAccount } from "@/lib/stellar-wallet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MoreHorizontal, Play, Pause, Square, TrendingUp, Calendar, DollarSign, Wallet, Loader2, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateSIPDialog } from "@/components/create-sip-dialog"

export function SIPList() {
  const [sips, setSips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [sipToCancel, setSipToCancel] = useState<any>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (isConnected && address) {
      fetchSIPs()
    } else {
      setLoading(false)
    }

    // Listen for SIP creation events
    const handleSIPCreated = () => {
      if (isConnected && address) {
        fetchSIPs()
      }
    }

    window.addEventListener('sipCreated', handleSIPCreated)
    return () => window.removeEventListener('sipCreated', handleSIPCreated)
  }, [isConnected, address])

  const fetchSIPs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sips?userAddress=${address}`)
      const result = await response.json()
      
      if (result.success) {
        setSips(result.data)
      } else {
        setError(result.error || "Failed to fetch SIPs")
      }
    } catch (error) {
      setError("Failed to load SIPs")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSIP = async () => {
    if (!sipToCancel) return

    setIsCancelling(true)
    try {
      const response = await fetch(`/api/sips/${sipToCancel.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          sipId: sipToCancel.id
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Remove SIP from local state
        setSips(prev => prev.filter(sip => sip.id !== sipToCancel.id))
        setCancelDialogOpen(false)
        setSipToCancel(null)
      } else {
        setError(result.error || "Failed to cancel SIP")
      }
    } catch (error) {
      setError("Failed to cancel SIP. Please try again.")
    } finally {
      setIsCancelling(false)
    }
  }

  const openCancelDialog = (sip: any) => {
    setSipToCancel(sip)
    setCancelDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Paused":
        return "secondary"
      case "Completed":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <Play className="h-3 w-3" />
      case "Paused":
        return <Pause className="h-3 w-3" />
      case "Completed":
        return <Square className="h-3 w-3" />
      default:
        return <Pause className="h-3 w-3" />
    }
  }

  if (!isConnected) {
    return (
      <Alert>
        <Wallet className="h-4 w-4" />
        <AlertDescription>
          Please connect your wallet to view your SIPs
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading your SIPs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (sips.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-card/80 to-muted/20 backdrop-blur-xl border-0 shadow-xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center mb-6">
            <TrendingUp className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">No SIPs Found</h3>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            You haven't created any SIPs yet. Create your first SIP to start automated investing on Stellar blockchain.
          </p>
          <CreateSIPDialog />
          <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-600 font-medium text-center">✨ Start Your DeFi Journey</p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Systematic Investment Plans help you invest regularly with real balance validation
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sips.map((sip) => (
        <Card key={sip.id} className="relative bg-gradient-to-br from-card/80 to-muted/20 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg">{sip.token_symbol} SIP #{sip.id}</CardTitle>
                <Badge variant={getStatusColor(sip.status)} className="text-xs">
                  {getStatusIcon(sip.status)}
                  <span className="ml-1">{sip.status}</span>
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit SIP</DropdownMenuItem>
                  <DropdownMenuItem>Pause SIP</DropdownMenuItem>
                  <DropdownMenuItem>View History</DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => openCancelDialog(sip)}
                  >
                    Cancel SIP
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription>
              {sip.amount} {sip.token_symbol} • {sip.frequency} • {sip.apy_target}% Target APY
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Deposits</span>
                <span className="font-medium">
                  {sip.total_deposits} {sip.token_symbol}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Executions: {sip.execution_count}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <span>Per Investment</span>
                </div>
                <p className="font-semibold">{sip.amount} {sip.token_symbol}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>Target APY</span>
                </div>
                <p className="font-semibold text-primary">{sip.apy_target}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Next: {new Date(sip.next_execution).toLocaleDateString()}</span>
              </div>
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Cancel SIP Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-card/80 backdrop-blur-xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Cancel SIP
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to cancel this SIP? This action cannot be undone.
            </p>
            {sipToCancel && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SIP Name:</span>
                    <span className="font-medium">{sipToCancel.token_symbol} SIP #{sipToCancel.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">{sipToCancel.amount} {sipToCancel.token_symbol}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium">{sipToCancel.frequency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{sipToCancel.status}</span>
                  </div>
                </div>
              </div>
            )}
            <Alert className="bg-red-500/20 border-red-500/30">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                Cancelling this SIP will stop all future investments. Any penalty fees may apply.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setCancelDialogOpen(false)}
                disabled={isCancelling}
              >
                Keep SIP
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600"
                onClick={handleCancelSIP}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel SIP"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


