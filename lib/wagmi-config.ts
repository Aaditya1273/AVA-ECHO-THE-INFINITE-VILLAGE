'use client'

// DEPRECATED: This file is kept for backward compatibility
// New Stellar configuration is in stellar-config.ts

import { getNetworkConfig, getCurrentNetwork } from './stellar-config'

// Export Stellar network config for components that still import this
export const config = {
  network: getCurrentNetwork(),
  ...getNetworkConfig(),
}

// Re-export Stellar utilities
export { getNetworkConfig, getCurrentNetwork } from './stellar-config'
export { connectWallet, disconnectWallet, getPublicKey, isWalletConnected } from './stellar-wallet'
