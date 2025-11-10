"use client"

import { useState, useEffect } from "react"
import { useAccount } from "@/lib/stellar-wallet"
import { signTransaction } from "@/lib/stellar-wallet"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, AlertTriangle, Wallet } from "lucide-react"
import { formatEther, parseEther } from "viem"

export function CreateSIPDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    token: "",
    amount: "",
    frequency: "",
    duration: "",
    penalty: "2",
    reason: ""
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  
  const { address, isConnected } = useAccount()
  
  // TODO: Implement Stellar balance fetching
  // For now, we'll skip balance checks
  const xlmBalance = null
  const usdcBalance = null
  const ethBalance = null
  
  // Placeholder for future Stellar balance implementation
  /*
  const { data: xlmBalance } = useStellarBalance({
    address: address,
  })
  */

  const getTokenBalance = (token: string) => {
    // Balance checking disabled for now
    return null
  }

  const validateAmount = () => {
    // Balance validation disabled for now - will be implemented with Stellar SDK
    if (!formData.token || !formData.amount) return true
    
    try {
      const requestedAmount = parseFloat(formData.amount)
      return requestedAmount > 0
    } catch {
      return false
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleCreateSIP = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first")
      return
    }

    if (!formData.name || !formData.token || !formData.amount || !formData.frequency) {
      setError("Please fill in all required fields")
      return
    }

    if (!validateAmount()) {
      setError(`Invalid amount. Please enter a valid positive number.`)
      return
    }

    setIsCreating(true)
    setError("")

    try {
      // Step 1: Get transaction XDR from API
      const prepareResponse = await fetch('/api/sips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          token: formData.token,
          amount: formData.amount,
          frequency: formData.frequency,
          userAddress: address,
          duration: formData.duration,
          penalty: formData.penalty,
          reason: formData.reason
        }),
      })

      const prepareResult = await prepareResponse.json()

      if (!prepareResult.success || !prepareResult.requiresSignature) {
        setError(prepareResult.error || "Failed to prepare transaction")
        return
      }

      // Step 2: Sign transaction with Freighter wallet
      const signedXDR = await signTransaction(prepareResult.transactionXDR)

      // Step 3: Submit signed transaction
      const submitResponse = await fetch('/api/sips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          token: formData.token,
          amount: formData.amount,
          frequency: formData.frequency,
          userAddress: address,
          duration: formData.duration,
          penalty: formData.penalty,
          reason: formData.reason,
          signedXDR: signedXDR
        }),
      })

      const result = await submitResponse.json()

      if (result.success) {
        // Log transaction hash
        console.log('🎉 SIP CREATED SUCCESSFULLY!')
        console.log('📝 Transaction Hash:', result.data.transactionHash)
        console.log('🔗 View on Stellar Expert:', `https://stellar.expert/explorer/futurenet/tx/${result.data.transactionHash}`)
        
        // Reset form and close dialog
        setFormData({
          name: "",
          token: "",
          amount: "",
          frequency: "",
          duration: "",
          penalty: "2",
          reason: ""
        })
        setOpen(false)
        // Dispatch custom event to refresh SIP list
        window.dispatchEvent(new CustomEvent('sipCreated', { detail: result.data }))
        
        // Show success message with transaction hash
        alert(`✅ SIP Created Successfully!\n\nTransaction Hash: ${result.data.transactionHash}\n\nView on Stellar Expert:\nhttps://stellar.expert/explorer/futurenet/tx/${result.data.transactionHash}`)
      } else {
        setError(result.error || "Failed to create SIP")
      }
    } catch (error) {
      setError("Failed to create SIP. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const isAmountValid = validateAmount()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Create SIP
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-xl border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Create New SIP</DialogTitle>
          <DialogDescription>Set up a systematic investment plan to automate your DeFi investments.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!isConnected && (
            <Alert>
              <Wallet className="h-4 w-4" />
              <AlertDescription>
                Please connect your wallet to create a SIP
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="name">SIP Name *</Label>
            <Input 
              id="name" 
              placeholder="e.g., USDC Growth Plan" 
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="token">Token *</Label>
              <Select value={formData.token} onValueChange={(value) => handleInputChange("token", value)}>
                <SelectTrigger>
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
              {formData.token && (
                <p className="text-xs text-muted-foreground">
                  Balance: -- {formData.token.toUpperCase()} (Balance checking coming soon)
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="500" 
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className={!isAmountValid ? "border-red-500" : ""}
              />
              {formData.amount && !isAmountValid && (
                <p className="text-xs text-red-500">Insufficient balance</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select value={formData.frequency} onValueChange={(value) => handleInputChange("frequency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (months)</Label>
              <Input 
                id="duration" 
                type="number" 
                placeholder="12" 
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="penalty">Early Withdrawal Penalty (%)</Label>
            <Input 
              id="penalty" 
              type="number" 
              placeholder="2" 
              min="0" 
              max="10" 
              value={formData.penalty}
              onChange={(e) => handleInputChange("penalty", e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="reason">Investment Goal</Label>
            <Textarea 
              id="reason" 
              placeholder="Describe your investment goal..." 
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleCreateSIP}
            disabled={!isConnected || isCreating || !isAmountValid || !formData.name || !formData.token || !formData.amount || !formData.frequency}
          >
            {isCreating ? "Creating..." : "Create SIP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


