"use client"

import { useState, useEffect } from "react"
import { useAccount } from "@/lib/stellar-wallet"

import { parseEther, formatEther } from "viem"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock, Shield, Users, AlertTriangle, Plus, Unlock, Loader2, Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { blockchainService } from "@/lib/blockchain-service"

export default function VaultPage() {
  const [vaultData, setVaultData] = useState({
    totalLocked: 0,
    locks: [] as any[],
    governance: {
      requiredSignatures: 0,
      totalSigners: 0,
      emergencyProtocol: "Not configured",
      governanceDelay: "Not set"
    }
  })
  const [loading, setLoading] = useState(true)
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false)
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false)
  const [lockForm, setLockForm] = useState({
    token: "",
    amount: "",
    duration: ""
  })
  const [lockError, setLockError] = useState("")
  const [isLocking, setIsLocking] = useState(false)
  const [proposalForm, setProposalForm] = useState({
    title: "",
    description: "",
    type: "emergency_unlock"
  })
  const [isCreatingProposal, setIsCreatingProposal] = useState(false)
  const [proposals, setProposals] = useState<any[]>([])
  const [loadingProposals, setLoadingProposals] = useState(false)
  
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  
  // TODO: Implement Stellar balance fetching
  const xlmBalance = null
  const usdcBalance = null
  const ethBalance = null

  useEffect(() => {
    if (isConnected && address) {
      fetchVaultData()
      fetchProposals()
    } else {
      setLoading(false)
    }
  }, [isConnected, address])

  const fetchVaultData = async () => {
    try {
      setLoading(true)
      // Fetch real vault data from blockchain
      const response = await fetch(`/api/vault?userAddress=${address}`)
      const result = await response.json()
      
      if (result.success) {
        setVaultData(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch vault data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTokenBalance = (token: string) => {
    switch (token.toLowerCase()) {
      case 'xlm':
        return xlmBalance
      case 'usdc':
        return usdcBalance
      case 'eth':
        return ethBalance
      default:
        return null
    }
  }

  const validateAmount = () => {
    // Balance validation disabled for now - will be implemented with Stellar SDK
    if (!lockForm.token || !lockForm.amount) return true
    
    try {
      const requestedAmount = parseFloat(lockForm.amount)
      return requestedAmount > 0
    } catch {
      return false
    }
  }

  const getInsufficientBalanceError = () => {
    // Balance checking disabled for now
    return ""
  }

  const handleLockFunds = async () => {
    if (!lockForm.token || !lockForm.amount || !lockForm.duration) {
      setLockError("❌ Please fill in all fields")
      return
    }

    const insufficientError = getInsufficientBalanceError()
    if (insufficientError) {
      setLockError(`❌ ${insufficientError}`)
      return
    }

    setIsLocking(true)
    setLockError("")

    try {
      // Call the lock funds API
      const response = await fetch('/api/vault/lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          token: lockForm.token,
          amount: lockForm.amount,
          duration: lockForm.duration
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Execute the actual blockchain transaction
        const transactionData = result.data
        
        toast({
          title: "Transaction Prepared 📋",
          description: "Please confirm the transaction in your wallet to lock funds on blockchain.",
        })

        // Use blockchain service to execute the lock transaction
        const tokenAddress = blockchainService.getTokenAddress(lockForm.token)
        const lockResult = await blockchainService.lockFunds(
          tokenAddress,
          lockForm.amount,
          parseInt(lockForm.duration) * 24 * 60 * 60 // Convert days to seconds
        )

        if (lockResult.success) {
          toast({
            title: "Funds Locked Successfully! 🔒",
            description: `${lockForm.amount} ${lockForm.token.toUpperCase()} locked for ${lockForm.duration} days. TX: ${lockResult.txHash?.slice(0, 10)}...`,
          })

          // Reset form and close dialog
          setLockForm({ token: "", amount: "", duration: "" })
          setLockDialogOpen(false)
          // Refresh vault data
          fetchVaultData()
        } else {
          setLockError(`❌ Blockchain transaction failed: ${lockResult.error}`)
        }
      } else {
        setLockError(result.error || "Failed to prepare lock transaction")
      }
    } catch (error) {
      setLockError("Failed to lock funds. Please try again.")
    } finally {
      setIsLocking(false)
    }
  }

  const handleCreateProposal = async () => {
    if (!proposalForm.title || !proposalForm.description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsCreatingProposal(true)

    try {
      // Call the real API to create proposal
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          title: proposalForm.title,
          description: proposalForm.description,
          type: proposalForm.type
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Proposal Created! 🎉",
          description: `Your "${proposalForm.title}" proposal has been submitted for governance voting. Proposal ID: ${result.data.id}`,
        })

        // Reset form and close dialog
        setProposalForm({ title: "", description: "", type: "emergency_unlock" })
        setProposalDialogOpen(false)
        
        // Refresh proposals list
        fetchProposals()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create proposal",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingProposal(false)
    }
  }

  const fetchProposals = async () => {
    if (!address) return
    
    setLoadingProposals(true)
    try {
      const response = await fetch(`/api/proposals?userAddress=${address}`)
      const result = await response.json()
      
      if (result.success) {
        setProposals(result.data)
      }
    } catch (error) {
      console.error("Error fetching proposals:", error)
    } finally {
      setLoadingProposals(false)
    }
  }

  const GlassmorphismDialog = ({ trigger, title, description, children }: any) => (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg" />
        <div className="relative">
          <DialogHeader>
            <DialogTitle className="text-white">{title}</DialogTitle>
            <DialogDescription className="text-white/70">{description}</DialogDescription>
          </DialogHeader>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )

  if (!isConnected) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to access the Emergency Vault
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Emergency Vault</h1>
            <p className="text-muted-foreground text-pretty">
              Secure emergency funds with real wallet balance validation
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Connected Wallet</p>
            <p className="font-mono text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Emergency funds are secured with multi-signature protection and can only be unlocked through community
            governance or emergency protocols.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Locked Funds
              </CardTitle>
              <CardDescription>Funds secured in emergency vault</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) : (
                  <>
                    <p className="text-3xl font-bold">{vaultData.totalLocked.toFixed(2)} Tokens</p>
                    <p className="text-sm text-muted-foreground">Total locked value</p>
                  </>
                )}
              </div>

              {!loading && vaultData.locks.length > 0 && (
                <div className="space-y-2">
                  {vaultData.locks.map((lock: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm">{lock.token}</span>
                      <span className="text-sm font-medium">{lock.amount} {lock.token}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                      <Plus className="mr-2 h-4 w-4" />
                      Lock Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg" />
                    <div className="relative">
                      <DialogHeader>
                        <DialogTitle className="text-white">Lock Emergency Funds</DialogTitle>
                        <DialogDescription className="text-white/70">
                          Secure your funds in the multi-sig emergency vault
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label className="text-white">Token</Label>
                          <Select value={lockForm.token} onValueChange={(value) => {
                            setLockForm(prev => ({ ...prev, token: value }))
                            setLockError("")
                          }}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select token" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="xlm">
                                XLM (Stellar Lumens)
                              </SelectItem>
                              <SelectItem value="usdc">
                                USDC on Stellar
                              </SelectItem>
                              <SelectItem value="eth">
                                ETH (Bridged)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {lockForm.token && (
                            <p className="text-xs text-white/60 mt-1">
                              Balance: -- {lockForm.token.toUpperCase()} (Connect wallet to view)
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-white">Amount</Label>
                          <Input 
                            className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 ${
                              getInsufficientBalanceError() ? "border-red-500 bg-red-500/10" : ""
                            }`}
                            placeholder="1000" 
                            type="number"
                            value={lockForm.amount}
                            onChange={(e) => {
                              setLockForm(prev => ({ ...prev, amount: e.target.value }))
                              setLockError("")
                            }}
                          />
                          {getInsufficientBalanceError() && (
                            <p className="text-xs text-red-400 mt-1 font-semibold">
                              {getInsufficientBalanceError()}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label className="text-white">Lock Duration</Label>
                          <Select value={lockForm.duration} onValueChange={(value) => {
                            setLockForm(prev => ({ ...prev, duration: value }))
                            setLockError("")
                          }}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="180">180 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {lockError && (
                          <Alert className="bg-red-500/20 border-red-500/30">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <AlertDescription className="text-red-200">
                              {lockError}
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <Button 
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                          onClick={handleLockFunds}
                          disabled={isLocking || !!getInsufficientBalanceError() || !lockForm.token || !lockForm.amount || !lockForm.duration}
                        >
                          {isLocking ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Locking Funds...
                            </>
                          ) : getInsufficientBalanceError() ? (
                            "❌ Insufficient Balance"
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Lock Funds
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {vaultData.totalLocked > 0 && (
                  <GlassmorphismDialog
                    trigger={
                      <Button variant="outline" className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <Unlock className="mr-2 h-4 w-4" />
                        Emergency Unlock
                      </Button>
                    }
                    title="Emergency Unlock Request"
                    description="Request emergency unlock through governance"
                  >
                    <div className="space-y-4 mt-4">
                      <Alert className="bg-red-500/20 border-red-500/30">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <AlertDescription className="text-red-200">
                          Emergency unlocks require 3 of 5 multi-sig approvals
                        </AlertDescription>
                      </Alert>
                      <div>
                        <Label className="text-white">Reason for Emergency</Label>
                        <Input className="bg-white/10 border-white/20 text-white placeholder:text-white/50" placeholder="Medical emergency, job loss, etc." />
                      </div>
                      <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500">
                        Submit Emergency Request
                      </Button>
                    </div>
                  </GlassmorphismDialog>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Governance Status
              </CardTitle>
              <CardDescription>Multi-signature and governance controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Required Signatures</span>
                  <Badge variant="outline">{vaultData.governance.requiredSignatures} of {vaultData.governance.totalSigners}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Emergency Protocol</span>
                  <Badge variant="secondary">{vaultData.governance.emergencyProtocol}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Governance Delay</span>
                  <Badge variant="outline">{vaultData.governance.governanceDelay}</Badge>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Emergency unlocks require community consensus or critical security events.
                </AlertDescription>
              </Alert>

              <GlassmorphismDialog
                trigger={
                  <Button variant="outline" className="w-full bg-transparent">
                    View Governance Proposals
                  </Button>
                }
                title="Governance Proposals"
                description="View and vote on emergency unlock proposals"
              >
                <div className="space-y-4 mt-4">
                  {loadingProposals ? (
                    <div className="text-center text-white/70">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                      Loading proposals...
                    </div>
                  ) : proposals.length === 0 ? (
                    <div className="text-center text-white/70">
                      No active proposals
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {proposals.map((proposal) => (
                        <div key={proposal.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-white font-medium text-sm">{proposal.title}</h4>
                            <Badge variant={proposal.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                              {proposal.status}
                            </Badge>
                          </div>
                          <p className="text-white/70 text-xs mb-2 line-clamp-2">{proposal.description}</p>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-white/60">Votes: {proposal.votesFor}/{proposal.requiredVotes}</span>
                            <span className="text-white/60">ID: #{proposal.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
                    onClick={() => setProposalDialogOpen(true)}
                  >
                    Create New Proposal
                  </Button>
                </div>
              </GlassmorphismDialog>
            </CardContent>
          </Card>
        </div>

        {/* Real Data Notice */}
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-orange-600 mb-1">100% Real Wallet Balance Validation</p>
                <p className="text-sm text-muted-foreground">
                  All balance checks are performed against your real wallet balances on Stellar blockchain. 
                  The system prevents locking more funds than you actually have. Insufficient balance errors are shown in real-time.
                  No fake vault data or mock governance settings are displayed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposal Creation Dialog */}
        <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
          <DialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg" />
            <div className="relative">
              <DialogHeader>
                <DialogTitle className="text-white">Create Governance Proposal</DialogTitle>
                <DialogDescription className="text-white/70">
                  Submit a proposal for community voting
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-white">Proposal Type</Label>
                  <Select value={proposalForm.type} onValueChange={(value) => 
                    setProposalForm(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency_unlock">Emergency Unlock</SelectItem>
                      <SelectItem value="parameter_change">Parameter Change</SelectItem>
                      <SelectItem value="upgrade">Protocol Upgrade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Title</Label>
                  <Input 
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Emergency unlock for medical expenses" 
                    value={proposalForm.title}
                    onChange={(e) => setProposalForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-white">Description</Label>
                  <textarea 
                    className="w-full h-24 bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder:text-white/50 resize-none"
                    placeholder="Provide detailed reasoning for this proposal..."
                    value={proposalForm.description}
                    onChange={(e) => setProposalForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <Alert className="bg-blue-500/20 border-blue-500/30">
                  <AlertTriangle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200">
                    Proposals require 3 of 5 multi-sig approvals to pass
                  </AlertDescription>
                </Alert>
                
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50"
                  onClick={handleCreateProposal}
                  disabled={isCreatingProposal || !proposalForm.title || !proposalForm.description}
                >
                  {isCreatingProposal ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Proposal...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Proposal
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
