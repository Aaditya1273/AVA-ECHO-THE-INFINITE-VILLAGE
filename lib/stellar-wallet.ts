'use client'

import { useState, useEffect } from 'react'
import { 
  isConnected, 
  isAllowed, 
  requestAccess,
  getAddress,
  signTransaction as freighterSignTransaction,
  getNetwork
} from '@stellar/freighter-api'
import { getNetworkConfig } from './stellar-config'

// Cache for wallet connection state
let cachedAddress: string | null = null
let cachedConnectionStatus: boolean | null = null
let lastCheckTime = 0
const CACHE_DURATION = 5000 // 5 seconds

// Initialize wallet (no-op for Freighter, it's just a browser extension)
export const initWalletKit = () => {
  // Freighter doesn't need initialization
  return true
}

// Check if Freighter is installed
export const isFreighterInstalled = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  
  try {
    const result = await isConnected()
    return !result.error
  } catch (error) {
    console.error('Freighter not detected:', error)
    return false
  }
}

// Connect wallet
export const connectWallet = async (): Promise<string> => {
  const installed = await isFreighterInstalled()
  
  if (!installed) {
    throw new Error('Freighter wallet is not installed. Please install it from https://www.freighter.app/')
  }

  try {
    // Request access (this will prompt user to approve)
    const result = await requestAccess()
    
    if (result.error) {
      throw new Error(result.error.message || 'Failed to connect')
    }
    
    // Update cache and localStorage
    cachedAddress = result.address
    lastCheckTime = Date.now()
    if (typeof window !== 'undefined') {
      localStorage.setItem('stellar_wallet_address', result.address)
    }
    
    console.log('Connected to Freighter:', result.address)
    return result.address
  } catch (error: any) {
    console.error('Failed to connect wallet:', error)
    
    // More specific error messages
    if (error?.message?.includes('User declined') || error?.message?.includes('rejected')) {
      throw new Error('Connection rejected. Please approve the connection in Freighter.')
    }
    
    throw new Error(error?.message || 'Failed to connect wallet. Please make sure Freighter is unlocked and try again.')
  }
}

// Disconnect wallet (Freighter doesn't have explicit disconnect)
export const disconnectWallet = () => {
  // Clear cache and localStorage
  cachedAddress = null
  cachedConnectionStatus = null
  lastCheckTime = 0
  if (typeof window !== 'undefined') {
    localStorage.removeItem('stellar_wallet_address')
  }
  // Freighter manages its own connection state
  console.log('Wallet disconnected (local state cleared)')
}

// Get current public key (from localStorage to avoid popups)
export const getPublicKey = async (): Promise<string | null> => {
  // Return cached value if still valid
  const now = Date.now()
  if (cachedAddress && (now - lastCheckTime) < CACHE_DURATION) {
    return cachedAddress
  }

  // Check localStorage first (set during connect)
  if (typeof window !== 'undefined') {
    const storedAddress = localStorage.getItem('stellar_wallet_address')
    if (storedAddress) {
      cachedAddress = storedAddress
      lastCheckTime = now
      return storedAddress
    }
  }

  // If no stored address, return null (don't check wallet to avoid popup)
  cachedAddress = null
  lastCheckTime = now
  return null
}

// Sign transaction
export const signTransaction = async (xdr: string): Promise<string> => {
  const installed = await isFreighterInstalled()
  if (!installed) {
    throw new Error('Freighter wallet is not installed')
  }

  try {
    const config = getNetworkConfig()
    const result = await freighterSignTransaction(xdr, {
      networkPassphrase: config.networkPassphrase,
    })
    
    if (result.error) {
      throw new Error(result.error.message || 'Failed to sign transaction')
    }
    
    return result.signedTxXdr
  } catch (error: any) {
    console.error('Failed to sign transaction:', error)
    throw new Error(error?.message || 'Failed to sign transaction')
  }
}

// Check if wallet is connected
export const isWalletConnected = async (): Promise<boolean> => {
  const installed = await isFreighterInstalled()
  if (!installed) {
    return false
  }

  try {
    const result = await isAllowed()
    return !result.error && result.isAllowed
  } catch {
    return false
  }
}

// Get network info
export const getNetworkInfo = () => {
  return getNetworkConfig()
}

// Hook-like function to mimic useAccount from Wagmi (for compatibility)
export const useAccount = () => {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    const publicKey = await getPublicKey()
    if (publicKey) {
      setAddress(publicKey)
      setIsConnected(true)
    }
  }

  return { address, isConnected }
}

// Hook-like function to mimic useDisconnect from Wagmi (for compatibility)
export const useDisconnect = () => {
  const disconnect = () => {
    disconnectWallet()
  }

  return { disconnect }
}
