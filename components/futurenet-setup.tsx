"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Copy, Check } from "lucide-react"
import { useState } from "react"
import { useAccount } from "@/lib/stellar-wallet"

export function FuturenetSetup() {
  const [copied, setCopied] = useState(false)
  const { isConnected } = useAccount()
  
  // Don't show if already connected
  if (isConnected) return null
  
  const futurenetConfig = {
    name: "Futurenet",
    rpcUrl: "https://rpc-futurenet.stellar.org:443",
    networkPassphrase: "Test SDF Future Network ; October 2022"
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-orange-500/50 bg-orange-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <CardTitle>Futurenet Setup Required</CardTitle>
        </div>
        <CardDescription>
          Add Futurenet as a custom network in Freighter to use this app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Steps:</p>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>Open Freighter wallet</li>
            <li>Go to Settings → Network</li>
            <li>Click "Add custom network"</li>
            <li>Enter the details below:</li>
          </ol>
        </div>

        <div className="space-y-3 bg-muted p-4 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Network Name:</p>
            <div className="flex items-center gap-2">
              <code className="text-sm flex-1 bg-background px-2 py-1 rounded">
                {futurenetConfig.name}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(futurenetConfig.name)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">RPC URL:</p>
            <div className="flex items-center gap-2">
              <code className="text-sm flex-1 bg-background px-2 py-1 rounded break-all">
                {futurenetConfig.rpcUrl}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(futurenetConfig.rpcUrl)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Network Passphrase:</p>
            <div className="flex items-center gap-2">
              <code className="text-sm flex-1 bg-background px-2 py-1 rounded break-all">
                {futurenetConfig.networkPassphrase}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(futurenetConfig.networkPassphrase)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            💡 <strong>Get Futurenet XLM:</strong> After adding the network, visit{" "}
            <a
              href="https://friendbot-futurenet.stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Futurenet Friendbot
            </a>{" "}
            to get test XLM
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
