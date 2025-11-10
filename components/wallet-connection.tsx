"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WalletState {
  isConnected: boolean
  address?: string
  balance?: {
    XLM: string
    usdc: string
    eth: string
  }
  chainId?: number
  chainName?: string
}

export function WalletConnection() {
  const [wallet, setWallet] = useState<WalletState>({ isConnected: false })
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  // Simulate wallet connection
  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      // Simulate MetaMask/WalletConnect connection
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setWallet({
        isConnected: true,
        address: "0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
        balance: {
          XLM: "25,000.00",
          usdc: "15,420.50",
          eth: "8.75",
        },
        chainId: 50312,
        chainName: "Stellar Testnet",
      })

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Stellar network",
      })
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWallet({ isConnected: false })
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!wallet.isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>Connect your wallet to start using Sphira DeFi platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={connectWallet} disabled={isConnecting} className="w-full" size="lg">
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Supports MetaMask, WalletConnect, and other Web3 wallets</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Wallet Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Wallet className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">Wallet Connected</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {formatAddress(wallet.address!)}
                  <Badge variant="outline" className="text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                    {wallet.chainName}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={copyAddress}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Explorer
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Wallet Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={disconnectWallet} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{wallet.balance?.XLM}</p>
              <p className="text-sm text-muted-foreground">XLM</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{wallet.balance?.usdc}</p>
              <p className="text-sm text-muted-foreground">USDC</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{wallet.balance?.eth}</p>
              <p className="text-sm text-muted-foreground">ETH</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-auto p-4 bg-transparent">
          <div className="text-center">
            <Wallet className="h-5 w-5 mx-auto mb-2" />
            <p className="text-sm font-medium">Add Funds</p>
          </div>
        </Button>
        <Button variant="outline" className="h-auto p-4 bg-transparent">
          <div className="text-center">
            <ExternalLink className="h-5 w-5 mx-auto mb-2" />
            <p className="text-sm font-medium">Bridge Assets</p>
          </div>
        </Button>
      </div>
    </div>
  )
}

