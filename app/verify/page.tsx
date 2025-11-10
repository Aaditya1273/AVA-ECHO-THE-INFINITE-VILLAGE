"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyPage() {
  const [txHash, setTxHash] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const verifyTransaction = async () => {
    if (!txHash) return
    
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch(`https://horizon-futurenet.stellar.org/transactions/${txHash}`)
      
      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        setError("Transaction not found on Stellar Futurenet")
      }
    } catch (err) {
      setError("Failed to verify transaction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Transaction Verification</h1>
          <p className="text-muted-foreground">Verify Stellar blockchain transactions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verify Transaction Hash</CardTitle>
            <CardDescription>
              Enter a transaction hash to verify it on Stellar Futurenet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="txHash">Transaction Hash</Label>
              <Input
                id="txHash"
                placeholder="e.g., 135b658b0a7cc6ef4d5e6d0e5191a9bfa1b9a4ca4d5947035f07cd1ff9590d7d"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
              />
            </div>

            <Button onClick={verifyTransaction} disabled={loading || !txHash}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Transaction
            </Button>

            {error && (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="space-y-4 mt-6">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Transaction Verified on Stellar Futurenet!</span>
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-medium">Hash:</span>
                    <span className="col-span-2 font-mono text-xs break-all">{result.hash}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-medium">Ledger:</span>
                    <span className="col-span-2">{result.ledger}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-medium">Created:</span>
                    <span className="col-span-2">{new Date(result.created_at).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-medium">Source:</span>
                    <span className="col-span-2 font-mono text-xs break-all">{result.source_account}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-medium">Successful:</span>
                    <span className="col-span-2">
                      {result.successful ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-red-600">✗ No</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://stellar.expert/explorer/futurenet/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Stellar Expert
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://lab.stellar.org/xdr/view?input=${encodeURIComponent(result.envelope_xdr)}&type=TransactionEnvelope&network=futurenet`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View in Stellar Lab
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-xs font-mono break-all">
                    {JSON.stringify(result, null, 2)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract Verification</CardTitle>
            <CardDescription>Verify deployed smart contracts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium">Contract ID:</span>
                <span className="col-span-2 font-mono text-xs break-all">
                  {process.env.NEXT_PUBLIC_SIP_MANAGER_CONTRACT}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-medium">Network:</span>
                <span className="col-span-2">Stellar Futurenet</span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://lab.stellar.org/smart-contracts/contract-explorer?network=futurenet&contractId=${process.env.NEXT_PUBLIC_SIP_MANAGER_CONTRACT}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Contract in Stellar Lab
                <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
