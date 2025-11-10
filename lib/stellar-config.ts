'use client'

// Stellar Network Configuration
export const STELLAR_NETWORKS = {
  futurenet: {
    name: 'Futurenet',
    rpcUrl: 'https://rpc-futurenet.stellar.org:443',
    horizonUrl: 'https://horizon-futurenet.stellar.org',
    networkPassphrase: 'Test SDF Future Network ; October 2022',
    isTestnet: true,
  },
  testnet: {
    name: 'Testnet',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    isTestnet: true,
  },
  mainnet: {
    name: 'Mainnet',
    rpcUrl: 'https://soroban-rpc.mainnet.stellar.org',
    horizonUrl: 'https://horizon.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    isTestnet: false,
  },
} as const

export type StellarNetworkName = keyof typeof STELLAR_NETWORKS

// Get current network from environment
export const getCurrentNetwork = (): StellarNetworkName => {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK as StellarNetworkName
  return network || 'futurenet'
}

export const getNetworkConfig = (network?: StellarNetworkName) => {
  const networkName = network || getCurrentNetwork()
  return STELLAR_NETWORKS[networkName]
}

// Contract IDs (will be populated after deployment)
export const CONTRACT_IDS = {
  sipManager: process.env.NEXT_PUBLIC_SIP_MANAGER_CONTRACT || '',
  yieldRouter: process.env.NEXT_PUBLIC_YIELD_ROUTER_CONTRACT || '',
  lockVault: process.env.NEXT_PUBLIC_LOCK_VAULT_CONTRACT || '',
}

// Stroops conversion utilities
export const STROOPS_PER_XLM = 10_000_000

export const xlmToStroops = (xlm: number): bigint => {
  return BigInt(Math.floor(xlm * STROOPS_PER_XLM))
}

export const stroopsToXlm = (stroops: bigint): number => {
  return Number(stroops) / STROOPS_PER_XLM
}

export const formatXlm = (stroops: bigint, decimals: number = 7): string => {
  const xlm = stroopsToXlm(stroops)
  return xlm.toFixed(decimals)
}
