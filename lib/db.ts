import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

// JSON file database for hackathon demo (simpler than SQLite setup)
const dbPath = join(process.cwd(), 'hackathon-db.json')

// Initialize with empty data structure
const defaultData = {
  users: [],
  sips: [],
  yield_history: [],
  vault_locks: [],
  analytics: [],
  chat_history: []
}

// Read database
function readDB() {
  if (!existsSync(dbPath)) {
    writeFileSync(dbPath, JSON.stringify(defaultData, null, 2))
    return defaultData
  }
  return JSON.parse(readFileSync(dbPath, 'utf8'))
}

// Write database
function writeDB(data: any) {
  writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

// Initialize database with demo data
export function initializeDatabase() {
  const data = readDB()
  
  // Check if already initialized
  if (data.users.length > 0) {
    console.log('✅ Database already initialized')
    return
  }

  // Insert demo data
  const demoUser = '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87'
  
  data.users.push({
    id: 1,
    wallet_address: demoUser,
    created_at: new Date().toISOString(),
    preferences: {},
    notification_settings: {}
  })

  // Demo SIPs
  data.sips.push(
    {
      id: 1,
      sip_id: 1,
      user_address: demoUser,
      token_address: '0xUSDC',
      token_symbol: 'USDC',
      amount: '500',
      frequency: 'WEEKLY',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      total_deposits: '2000',
      execution_count: 4,
      blockchain_tx_hash: '0xabc123'
    },
    {
      id: 2,
      sip_id: 2,
      user_address: demoUser,
      token_address: '0xETH',
      token_symbol: 'ETH',
      amount: '0.1',
      frequency: 'DAILY',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      total_deposits: '2.1',
      execution_count: 21,
      blockchain_tx_hash: '0xdef456'
    }
  )

  // Demo yield history
  data.yield_history.push({
    id: 1,
    user_address: demoUser,
    token_address: '0xUSDC',
    pool_id: 1,
    amount: '47.23',
    apy: 11.2,
    timestamp: new Date().toISOString(),
    tx_hash: '0xyield1'
  })

  // Demo vault lock
  data.vault_locks.push({
    id: 1,
    lock_id: 1,
    user_address: demoUser,
    token_address: '0xUSDC',
    amount: '25000',
    lock_duration: 2592000,
    reason: 'Emergency fund protection',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    unlock_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    tx_hash: '0xlock1'
  })

  writeDB(data)
  console.log('✅ Hackathon database initialized with demo data')
  console.log('📁 Database file: hackathon-db.json')
  console.log('🔗 Real data stored on Stellar blockchain')
}

// Database operations using JSON file
export const dbOperations = {
  // User operations
  createUser: (walletAddress: string) => {
    const data = readDB()
    const existingUser = data.users.find((u: any) => u.wallet_address === walletAddress)
    if (!existingUser) {
      const newUser = {
        id: data.users.length + 1,
        wallet_address: walletAddress,
        created_at: new Date().toISOString(),
        preferences: {},
        notification_settings: {}
      }
      data.users.push(newUser)
      writeDB(data)
      return newUser
    }
    return existingUser
  },

  getUser: (walletAddress: string) => {
    const data = readDB()
    return data.users.find((u: any) => u.wallet_address === walletAddress)
  },

  // SIP operations
  createSIP: (sipData: {
    sipId: number
    userAddress: string
    tokenAddress: string
    tokenSymbol: string
    amount: string
    frequency: string
    txHash: string
  }) => {
    const data = readDB()
    const newSIP = {
      id: data.sips.length + 1,
      sip_id: sipData.sipId,
      user_address: sipData.userAddress,
      token_address: sipData.tokenAddress,
      token_symbol: sipData.tokenSymbol,
      amount: sipData.amount,
      frequency: sipData.frequency,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      total_deposits: '0',
      execution_count: 0,
      blockchain_tx_hash: sipData.txHash
    }
    data.sips.push(newSIP)
    writeDB(data)
    return newSIP
  },

  getUserSIPs: (userAddress: string) => {
    const data = readDB()
    return data.sips.filter((s: any) => s.user_address === userAddress)
  },

  // Yield operations
  recordYield: (yieldData: {
    userAddress: string
    tokenAddress: string
    poolId: number
    amount: string
    apy: number
    txHash: string
  }) => {
    const data = readDB()
    const newYield = {
      id: data.yield_history.length + 1,
      user_address: yieldData.userAddress,
      token_address: yieldData.tokenAddress,
      pool_id: yieldData.poolId,
      amount: yieldData.amount,
      apy: yieldData.apy,
      timestamp: new Date().toISOString(),
      tx_hash: yieldData.txHash
    }
    data.yield_history.push(newYield)
    writeDB(data)
    return newYield
  },

  getUserYieldHistory: (userAddress: string) => {
    const data = readDB()
    return data.yield_history
      .filter((y: any) => y.user_address === userAddress)
      .slice(-50)
      .reverse()
  },

  // Vault operations
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
    const data = readDB()
    const newLock = {
      id: data.vault_locks.length + 1,
      lock_id: lockData.lockId,
      user_address: lockData.userAddress,
      token_address: lockData.tokenAddress,
      amount: lockData.amount,
      lock_duration: lockData.duration,
      reason: lockData.reason,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      unlock_time: lockData.unlockTime,
      tx_hash: lockData.txHash
    }
    data.vault_locks.push(newLock)
    writeDB(data)
    return newLock
  },

  getUserVaultLocks: (userAddress: string) => {
    const data = readDB()
    return data.vault_locks.filter((l: any) => l.user_address === userAddress)
  },

  // Analytics
  recordEvent: (eventType: string, userAddress: string | null, eventData: any) => {
    const data = readDB()
    const newEvent = {
      id: data.analytics.length + 1,
      event_type: eventType,
      user_address: userAddress,
      data: JSON.stringify(eventData),
      timestamp: new Date().toISOString()
    }
    data.analytics.push(newEvent)
    writeDB(data)
    return newEvent
  },

  // Chat history
  saveChatInteraction: (userAddress: string, message: string, response: string, command?: string) => {
    const data = readDB()
    const newChat = {
      id: data.chat_history.length + 1,
      user_address: userAddress,
      message,
      response,
      command: command || null,
      timestamp: new Date().toISOString()
    }
    data.chat_history.push(newChat)
    writeDB(data)
    return newChat
  },

  getChatHistory: (userAddress: string, limit = 20) => {
    const data = readDB()
    return data.chat_history
      .filter((c: any) => c.user_address === userAddress)
      .slice(-limit)
      .reverse()
  },

  // Get all data for demo
  getAllData: () => {
    return readDB()
  }
}

// Export the database operations as default
export default dbOperations
