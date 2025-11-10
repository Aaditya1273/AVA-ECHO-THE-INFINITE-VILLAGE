// Database initialization script for hackathon demo
// Run with: node scripts/init-db.js

const fs = require('fs')
const path = require('path')

// Simple SQLite database setup for hackathon
const dbPath = path.join(process.cwd(), 'sphira_hackathon.db')

// For hackathon, we'll use a simple JSON file as our "database"
const initDatabase = () => {
  const demoData = {
    users: [
      {
        id: 1,
        wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
        created_at: new Date().toISOString(),
        preferences: {},
        notification_settings: {}
      }
    ],
    sips: [
      {
        id: 1,
        sip_id: 1,
        user_address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
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
        user_address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
        token_address: '0xETH',
        token_symbol: 'ETH',
        amount: '0.1',
        frequency: 'DAILY',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        total_deposits: '2.1',
        execution_count: 21,
        blockchain_tx_hash: '0xdef456'
      },
      {
        id: 3,
        sip_id: 3,
        user_address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
        token_address: '0xSOM',
        token_symbol: 'SOM',
        amount: '1000',
        frequency: 'MONTHLY',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        total_deposits: '3000',
        execution_count: 3,
        blockchain_tx_hash: '0xghi789'
      }
    ],
    yield_history: [
      {
        id: 1,
        user_address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
        token_address: '0xUSDC',
        pool_id: 1,
        amount: '47.23',
        apy: 11.2,
        timestamp: new Date().toISOString(),
        tx_hash: '0xyield1'
      },
      {
        id: 2,
        user_address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
        token_address: '0xETH',
        pool_id: 2,
        amount: '0.025',
        apy: 8.7,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        tx_hash: '0xyield2'
      }
    ],
    vault_locks: [
      {
        id: 1,
        lock_id: 1,
        user_address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
        token_address: '0xUSDC',
        amount: '25000',
        lock_duration: 2592000, // 30 days
        reason: 'Emergency fund protection',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        unlock_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        tx_hash: '0xlock1'
      }
    ],
    analytics: [
      {
        id: 1,
        event_type: 'sip_created',
        user_address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
        data: JSON.stringify({ amount: '500', token: 'USDC' }),
        timestamp: new Date().toISOString()
      }
    ],
    chat_history: [
      {
        id: 1,
        user_address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
        message: '/portfolio',
        response: 'Portfolio Summary: Total Value: $124,567.89',
        command: 'portfolio',
        timestamp: new Date().toISOString()
      }
    ]
  }

  // Write to JSON file for hackathon demo
  fs.writeFileSync('hackathon-db.json', JSON.stringify(demoData, null, 2))
  console.log('✅ Hackathon database initialized with demo data')
  console.log('📁 Database file: hackathon-db.json')
  console.log('🔗 Real data stored on Somnia blockchain')
}

initDatabase()