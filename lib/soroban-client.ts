'use client'

import * as StellarSdk from '@stellar/stellar-sdk'
import { getNetworkConfig, CONTRACT_IDS, xlmToStroops } from './stellar-config'
import { getPublicKey, signTransaction } from './stellar-wallet'

// Initialize Soroban server
export const getSorobanServer = () => {
  const config = getNetworkConfig()
  return new StellarSdk.SorobanRpc.Server(config.rpcUrl, {
    allowHttp: config.rpcUrl.startsWith('http://'),
  })
}

// Initialize Horizon server
export const getHorizonServer = () => {
  const config = getNetworkConfig()
  return new StellarSdk.Horizon.Server(config.horizonUrl, {
    allowHttp: config.horizonUrl.startsWith('http://'),
  })
}

// Build and submit transaction
export const buildAndSubmitTransaction = async (
  contractId: string,
  method: string,
  args: StellarSdk.xdr.ScVal[]
): Promise<any> => {
  const publicKey = await getPublicKey()
  if (!publicKey) {
    throw new Error('Wallet not connected')
  }

  const server = getSorobanServer()
  const config = getNetworkConfig()
  
  // Load account
  const sourceAccount = await server.getAccount(publicKey)
  
  // Build contract call operation
  const contract = new StellarSdk.Contract(contractId)
  const operation = contract.call(method, ...args)

  // Build transaction
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build()

  // Simulate transaction
  const simulated = await server.simulateTransaction(transaction)
  
  if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`)
  }

  // Prepare transaction
  const prepared = StellarSdk.SorobanRpc.assembleTransaction(
    transaction,
    simulated
  ).build()

  // Sign transaction
  const signedXdr = await signTransaction(prepared.toXDR())
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase
  )

  // Submit transaction
  const result = await server.sendTransaction(signedTx as StellarSdk.Transaction)
  
  // Wait for confirmation
  let status = await server.getTransaction(result.hash)
  while (status.status === 'NOT_FOUND' || status.status === 'PENDING') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    status = await server.getTransaction(result.hash)
  }

  if (status.status === 'SUCCESS') {
    return status.returnValue
  } else {
    throw new Error(`Transaction failed: ${status.status}`)
  }
}

// SIP Manager Contract Methods
export const sipManagerContract = {
  createSip: async (params: {
    token: string
    amount: number
    frequency: 'Daily' | 'Weekly' | 'Monthly'
    maxExecutions: number
    penaltyBps: number
  }) => {
    const publicKey = await getPublicKey()
    if (!publicKey) throw new Error('Wallet not connected')

    const args = [
      StellarSdk.nativeToScVal(publicKey, { type: 'address' }), // user
      StellarSdk.nativeToScVal(params.token, { type: 'address' }), // token
      StellarSdk.nativeToScVal(params.amount, { type: 'u64' }), // amount
      StellarSdk.nativeToScVal({ tag: params.frequency, values: undefined }, { type: 'symbol' }), // frequency
      StellarSdk.nativeToScVal(params.maxExecutions, { type: 'u32' }), // max_executions
      StellarSdk.nativeToScVal(params.penaltyBps, { type: 'u32' }), // penalty_bps
    ]

    return buildAndSubmitTransaction(CONTRACT_IDS.sipManager, 'create_sip', args)
  },

  executeSip: async (sipId: number) => {
    const args = [StellarSdk.nativeToScVal(sipId, { type: 'u32' })]
    return buildAndSubmitTransaction(CONTRACT_IDS.sipManager, 'execute_sip', args)
  },

  pauseSip: async (sipId: number) => {
    const args = [StellarSdk.nativeToScVal(sipId, { type: 'u32' })]
    return buildAndSubmitTransaction(CONTRACT_IDS.sipManager, 'pause_sip', args)
  },

  resumeSip: async (sipId: number) => {
    const args = [StellarSdk.nativeToScVal(sipId, { type: 'u32' })]
    return buildAndSubmitTransaction(CONTRACT_IDS.sipManager, 'resume_sip', args)
  },

  cancelSip: async (sipId: number) => {
    const args = [StellarSdk.nativeToScVal(sipId, { type: 'u32' })]
    return buildAndSubmitTransaction(CONTRACT_IDS.sipManager, 'cancel_sip', args)
  },

  getSip: async (sipId: number) => {
    const args = [StellarSdk.nativeToScVal(sipId, { type: 'u32' })]
    return buildAndSubmitTransaction(CONTRACT_IDS.sipManager, 'get_sip', args)
  },
}

// Yield Router Contract Methods
export const yieldRouterContract = {
  registerPool: async (params: {
    poolAddress: string
    initialApy: number
    riskScore: number
    maxCapacity: number
  }) => {
    const publicKey = await getPublicKey()
    if (!publicKey) throw new Error('Wallet not connected')

    const args = [
      StellarSdk.nativeToScVal(publicKey, { type: 'address' }), // admin
      StellarSdk.nativeToScVal(params.poolAddress, { type: 'address' }), // pool_address
      StellarSdk.nativeToScVal(params.initialApy, { type: 'i128' }), // initial_apy
      StellarSdk.nativeToScVal(params.riskScore, { type: 'u32' }), // risk_score
      StellarSdk.nativeToScVal(params.maxCapacity, { type: 'u64' }), // max_capacity
    ]

    return buildAndSubmitTransaction(CONTRACT_IDS.yieldRouter, 'register_pool', args)
  },

  deposit: async (params: {
    token: string
    amount: number
    maxRisk: number
  }) => {
    const publicKey = await getPublicKey()
    if (!publicKey) throw new Error('Wallet not connected')

    const args = [
      StellarSdk.nativeToScVal(publicKey, { type: 'address' }), // user
      StellarSdk.nativeToScVal(params.token, { type: 'address' }), // token
      StellarSdk.nativeToScVal(params.amount, { type: 'u64' }), // amount
      StellarSdk.nativeToScVal(params.maxRisk, { type: 'u32' }), // max_risk
    ]

    return buildAndSubmitTransaction(CONTRACT_IDS.yieldRouter, 'deposit', args)
  },

  rebalance: async (maxRisk: number) => {
    const publicKey = await getPublicKey()
    if (!publicKey) throw new Error('Wallet not connected')

    const args = [
      StellarSdk.nativeToScVal(publicKey, { type: 'address' }), // user
      StellarSdk.nativeToScVal(maxRisk, { type: 'u32' }), // max_risk
    ]

    return buildAndSubmitTransaction(CONTRACT_IDS.yieldRouter, 'rebalance', args)
  },

  harvestYield: async () => {
    const publicKey = await getPublicKey()
    if (!publicKey) throw new Error('Wallet not connected')

    const args = [StellarSdk.nativeToScVal(publicKey, { type: 'address' })]
    return buildAndSubmitTransaction(CONTRACT_IDS.yieldRouter, 'harvest_yield', args)
  },

  getOptimalPools: async (maxRisk: number, limit: number) => {
    const args = [
      StellarSdk.nativeToScVal(maxRisk, { type: 'u32' }),
      StellarSdk.nativeToScVal(limit, { type: 'u32' }),
    ]
    return buildAndSubmitTransaction(CONTRACT_IDS.yieldRouter, 'get_optimal_pools', args)
  },
}

// Lock Vault Contract Methods
export const lockVaultContract = {
  lockFunds: async (params: {
    amount: number
    unlockTime: number
    reason: string
  }) => {
    const publicKey = await getPublicKey()
    if (!publicKey) throw new Error('Wallet not connected')

    const args = [
      StellarSdk.nativeToScVal(publicKey, { type: 'address' }), // user
      StellarSdk.nativeToScVal(params.amount, { type: 'u64' }), // amount
      StellarSdk.nativeToScVal(params.unlockTime, { type: 'u64' }), // unlock_time
      StellarSdk.nativeToScVal(params.reason, { type: 'symbol' }), // reason
    ]

    return buildAndSubmitTransaction(CONTRACT_IDS.lockVault, 'lock_funds', args)
  },

  withdrawFunds: async (lockId: number) => {
    const args = [StellarSdk.nativeToScVal(lockId, { type: 'u32' })]
    return buildAndSubmitTransaction(CONTRACT_IDS.lockVault, 'withdraw_funds', args)
  },

  createEmergencyProposal: async (lockId: number) => {
    const publicKey = await getPublicKey()
    if (!publicKey) throw new Error('Wallet not connected')

    const args = [
      StellarSdk.nativeToScVal(publicKey, { type: 'address' }), // proposer
      StellarSdk.nativeToScVal(lockId, { type: 'u32' }), // lock_id
    ]

    return buildAndSubmitTransaction(CONTRACT_IDS.lockVault, 'create_emergency_proposal', args)
  },

  approveEmergency: async (proposalId: number) => {
    const publicKey = await getPublicKey()
    if (!publicKey) throw new Error('Wallet not connected')

    const args = [
      StellarSdk.nativeToScVal(proposalId, { type: 'u32' }), // proposal_id
      StellarSdk.nativeToScVal(publicKey, { type: 'address' }), // governor
    ]

    return buildAndSubmitTransaction(CONTRACT_IDS.lockVault, 'approve_emergency', args)
  },

  executeEmergencyUnlock: async (proposalId: number) => {
    const args = [StellarSdk.nativeToScVal(proposalId, { type: 'u32' })]
    return buildAndSubmitTransaction(CONTRACT_IDS.lockVault, 'execute_emergency_unlock', args)
  },

  getLock: async (lockId: number) => {
    const args = [StellarSdk.nativeToScVal(lockId, { type: 'u32' })]
    return buildAndSubmitTransaction(CONTRACT_IDS.lockVault, 'get_lock', args)
  },
}

// Get account balance
export const getAccountBalance = async (publicKey?: string): Promise<string> => {
  const address = publicKey || (await getPublicKey())
  if (!address) throw new Error('No public key provided')

  const server = getHorizonServer()
  const account = await server.loadAccount(address)
  
  const xlmBalance = account.balances.find(
    (balance: any) => balance.asset_type === 'native'
  )
  
  return xlmBalance?.balance || '0'
}

// Fund account (testnet only)
export const fundAccount = async (publicKey?: string): Promise<void> => {
  const address = publicKey || (await getPublicKey())
  if (!address) throw new Error('No public key provided')

  const config = getNetworkConfig()
  if (!config.isTestnet) {
    throw new Error('Funding only available on testnet')
  }

  const response = await fetch(`${config.horizonUrl}/friendbot?addr=${address}`)
  if (!response.ok) {
    throw new Error('Failed to fund account')
  }
}
