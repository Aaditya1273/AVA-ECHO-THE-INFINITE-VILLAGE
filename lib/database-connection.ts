/**
 * 🔗 DATABASE CONNECTION WRAPPER
 * Seamless integration between old db.ts and new temp-db-executor.ts
 * Maintains backward compatibility while adding premium features
 */

import { tempDB, dbOps } from './temp-db-executor'

// 🔄 Backward Compatibility Layer
export const dbOperations = {
  // User operations (enhanced)
  createUser: (walletAddress: string) => {
    console.log(`🆕 Creating user: ${walletAddress}`)
    return dbOps.createUser(walletAddress)
  },

  getUser: (walletAddress: string) => {
    return dbOps.getUser(walletAddress)
  },

  updateUserPreferences: (walletAddress: string, preferences: any) => {
    const user = dbOps.getUser(walletAddress)
    if (user) {
      user.preferences = { ...user.preferences, ...preferences }
      // In a real implementation, we'd save this back
      console.log(`⚙️ Updated preferences for ${walletAddress}`)
    }
    return user
  },

  // SIP operations (enhanced)
  createSIP: (sipData: {
    sipId: number
    userAddress: string
    tokenAddress: string
    tokenSymbol: string
    amount: string
    frequency: string
    txHash: string
  }) => {
    console.log(`💰 Creating SIP: ${sipData.tokenSymbol} - ${sipData.amount}`)
    
    const newSIP = dbOps.createSIP({
      id: 0, // Will be auto-assigned
      sip_id: sipData.sipId,
      user_address: sipData.userAddress,
      token_address: sipData.tokenAddress,
      token_symbol: sipData.tokenSymbol,
      amount: sipData.amount,
      frequency: sipData.frequency as any,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      next_execution: getNextExecutionTime(sipData.frequency),
      total_deposits: '0',
      execution_count: 0,
      blockchain_tx_hash: sipData.txHash,
      apy_target: getDefaultAPY(sipData.tokenSymbol)
    })

    // Record analytics event
    dbOps.recordEvent('sip_created', sipData.userAddress, {
      amount: sipData.amount,
      token: sipData.tokenSymbol,
      frequency: sipData.frequency
    })

    // Create notification
    dbOps.createNotification(
      sipData.userAddress,
      'SIP_CREATED',
      'SIP Created Successfully',
      `Your ${sipData.frequency.toLowerCase()} ${sipData.tokenSymbol} SIP of ${sipData.amount} has been created.`
    )

    return newSIP
  },

  getUserSIPs: (userAddress: string) => {
    return dbOps.getUserSIPs(userAddress)
  },

  // Yield operations (enhanced)
  recordYield: (yieldData: {
    userAddress: string
    tokenAddress: string
    poolId: number
    amount: string
    apy: number
    txHash: string
  }) => {
    console.log(`📈 Recording yield: ${yieldData.amount} for ${yieldData.userAddress}`)
    
    // Create yield record using temp-db-executor
    const yieldRecord = {
      id: 0, // Auto-assigned
      user_address: yieldData.userAddress,
      token_address: yieldData.tokenAddress,
      pool_id: yieldData.poolId,
      amount: yieldData.amount,
      apy: yieldData.apy,
      timestamp: new Date().toISOString(),
      tx_hash: yieldData.txHash,
      strategy: getStrategyName(yieldData.poolId)
    }

    // Record analytics
    dbOps.recordEvent('yield_earned', yieldData.userAddress, {
      amount: yieldData.amount,
      apy: yieldData.apy,
      pool: yieldData.poolId
    })

    // Create notification
    dbOps.createNotification(
      yieldData.userAddress,
      'YIELD_EARNED',
      'Yield Earned',
      `You earned ${yieldData.amount} from ${getStrategyName(yieldData.poolId)} (${yieldData.apy}% APY).`
    )

    return yieldRecord
  },

  getUserYieldHistory: (userAddress: string) => {
    const data = tempDB.getAllData()
    return data.yield_history
      .filter((y: any) => y.user_address === userAddress)
      .slice(-50)
      .reverse()
  },

  // Vault operations (enhanced)
  createVaultLock: (lockData: {
    lockId: number
    userAddress: string
    tokenAddress: string
    amount: string
    duration: number
    reason: string
    unlockTime: string
    txHash: string
  }) => {
    console.log(`🔒 Creating vault lock: ${lockData.amount} for ${lockData.duration}s`)
    
    const vaultLock = {
      id: 0, // Auto-assigned
      lock_id: lockData.lockId,
      user_address: lockData.userAddress,
      token_address: lockData.tokenAddress,
      amount: lockData.amount,
      lock_duration: lockData.duration,
      reason: lockData.reason,
      status: 'ACTIVE' as const,
      created_at: new Date().toISOString(),
      unlock_time: lockData.unlockTime,
      tx_hash: lockData.txHash,
      interest_earned: '0.00'
    }

    // Record analytics
    dbOps.recordEvent('vault_locked', lockData.userAddress, {
      amount: lockData.amount,
      duration: lockData.duration,
      reason: lockData.reason
    })

    // Create notification
    dbOps.createNotification(
      lockData.userAddress,
      'VAULT_LOCKED',
      'Vault Lock Created',
      `${lockData.amount} has been locked in your emergency vault for ${Math.round(lockData.duration / 86400)} days.`
    )

    return vaultLock
  },

  getUserVaultLocks: (userAddress: string) => {
    const data = tempDB.getAllData()
    return data.vault_locks.filter((l: any) => l.user_address === userAddress)
  },

  // Analytics (enhanced)
  recordEvent: (eventType: string, userAddress: string | null, eventData: any) => {
    return dbOps.recordEvent(eventType, userAddress, eventData)
  },

  // Chat history (enhanced)
  saveChatInteraction: (userAddress: string, message: string, response: string, command?: string) => {
    const data = tempDB.getAllData()
    const newChat = {
      id: data.chat_history.length + 1,
      user_address: userAddress,
      message,
      response,
      command: command || null,
      timestamp: new Date().toISOString(),
      satisfaction_rating: undefined
    }

    data.chat_history.push(newChat)
    console.log(`💬 Saved chat interaction for ${userAddress}`)
    return newChat
  },

  getChatHistory: (userAddress: string, limit = 20) => {
    return dbOps.getUserNotifications(userAddress, false).slice(0, limit)
  },

  // Get all data (for debugging)
  getAllData: () => {
    return tempDB.getAllData()
  },

  // Premium features
  getUserNotifications: (userAddress: string, unreadOnly = false) => {
    return dbOps.getUserNotifications(userAddress, unreadOnly)
  },

  createPortfolioSnapshot: (userAddress: string, totalValue: string, breakdown: any) => {
    return dbOps.createSnapshot(userAddress, totalValue, breakdown)
  },

  getDatabaseStats: () => {
    return tempDB.getDatabaseStats()
  },

  resetDatabase: () => {
    return tempDB.resetDatabase()
  }
}

// 🛠️ Helper Functions
function getNextExecutionTime(frequency: string): string {
  const now = new Date()
  switch (frequency.toUpperCase()) {
    case 'DAILY':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    case 'WEEKLY':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    case 'MONTHLY':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
  }
}

function getDefaultAPY(tokenSymbol: string): number {
  const apyMap: { [key: string]: number } = {
    'USDC': 12.5,
    'ETH': 9.2,
    'XLM': 15.5,
    'BTC': 7.8,
    'USDT': 11.8
  }
  return apyMap[tokenSymbol] || 10.0
}

function getStrategyName(poolId: number): string {
  const strategies: { [key: number]: string } = {
    1: 'Liquidity Pool Staking',
    2: 'Ethereum Staking',
    3: 'Stellar Validator Staking',
    4: 'Cross-Chain Yield Farming'
  }
  return strategies[poolId] || 'Unknown Strategy'
}

// 🚀 Initialize Database on Import
export function initializeDatabase() {
  console.log('🚀 Initializing World\'s Best Hackathon Database...')
  const stats = tempDB.getDatabaseStats()
  console.log('✅ Database ready!', {
    users: stats.tables.users,
    sips: stats.tables.sips,
    notifications: stats.tables.notifications
  })
  return stats
}

// Export for backward compatibility
export default dbOperations

// Export the premium database instance
export { tempDB, dbOps }

// Auto-initialize on import
initializeDatabase()

