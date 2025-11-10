"use client"

import { useState, useEffect } from "react"
import { walletManager, type WalletState } from "@/lib/wallet"

export function useWallet() {
  const [state, setState] = useState<WalletState>({ isConnected: false })
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Subscribe to wallet state changes
    const unsubscribe = walletManager.onStateChange(setState)

    // Get initial state
    setState(walletManager.getState())

    return unsubscribe
  }, [])

  const connect = async () => {
    setIsConnecting(true)
    try {
      await walletManager.connectWallet()
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    walletManager.disconnect()
  }

  const sendTransaction = async (to: string, value: string, data?: string) => {
    return walletManager.sendTransaction(to, value, data)
  }

  const signMessage = async (message: string) => {
    return walletManager.signMessage(message)
  }

  return {
    ...state,
    isConnecting,
    connect,
    disconnect,
    sendTransaction,
    signMessage,
  }
}
