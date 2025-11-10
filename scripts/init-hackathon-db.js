#!/usr/bin/env node

/**
 * 🚀 HACKATHON DATABASE INITIALIZER
 * World's Best Temporary Database Setup
 * Run: npm run init-db
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 Initializing World\'s Best Hackathon Database...')
console.log('=' .repeat(60))

// Create data directory
const dataDir = path.join(process.cwd(), 'data')
const backupDir = path.join(dataDir, 'backups')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log('📁 Created data directory')
}

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true })
  console.log('📁 Created backup directory')
}

// Premium Demo Data
const premiumDemoData = {
  metadata: {
    version: '2.0.0',
    created: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    totalUsers: 0,
    totalTransactions: 0
  },
  users: [],
  sips: [],
  yield_history: [
    // Sample yield data for demo wallet
    {
      id: 1,
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
      apy: 8.2,
      earned: 45.30,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
      sipId: 1
    },
    {
      id: 2,
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
      apy: 8.7,
      earned: 92.15,
      date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
      timestamp: Date.now() - 23 * 24 * 60 * 60 * 1000,
      sipId: 1
    },
    {
      id: 3,
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
      apy: 9.1,
      earned: 143.75,
      date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
      timestamp: Date.now() - 16 * 24 * 60 * 60 * 1000,
      sipId: 1
    },
    {
      id: 4,
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
      apy: 9.4,
      earned: 198.20,
      date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      timestamp: Date.now() - 9 * 24 * 60 * 60 * 1000,
      sipId: 1
    },
    {
      id: 5,
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
      apy: 9.8,
      earned: 256.40,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      sipId: 1
    }
  ],
  vault_locks: [],
  analytics: [],
  chat_history: [],
  portfolio_snapshots: [],
  notifications: [],
  proposals: [
    {
      id: 1,
      userAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
      title: 'Emergency Medical Expense Unlock',
      description: 'Requesting emergency unlock of 5,000 USDC for urgent medical treatment. Hospital bills attached as proof.',
      type: 'emergency_unlock',
      status: 'ACTIVE',
      votesFor: 2,
      votesAgainst: 0,
      requiredVotes: 3,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      blockchain_tx_hash: '0xabc123def456789012345678901234567890abcd'
    },
    {
      id: 2,
      userAddress: '0x8ba1f109551bD432803012645ac136c22C177e9D',
      title: 'Increase Multi-sig Threshold',
      description: 'Proposal to increase required signatures from 3/5 to 4/5 for enhanced security.',
      type: 'parameter_change',
      status: 'ACTIVE',
      votesFor: 1,
      votesAgainst: 1,
      requiredVotes: 3,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      blockchain_tx_hash: '0xdef456abc789012345678901234567890defabc'
    }
  ]
}

// Write the premium database
const dbPath = path.join(dataDir, 'sphira-hackathon.json')
fs.writeFileSync(dbPath, JSON.stringify(premiumDemoData, null, 2))

console.log('✅ Premium hackathon database created!')
console.log('📊 Database Statistics:')
console.log(`   👥 Users: ${premiumDemoData.users.length}`)
console.log(`   💰 SIPs: ${premiumDemoData.sips.length}`)
console.log(`   📈 Yield Records: ${premiumDemoData.yield_history.length}`)
console.log(`   🔒 Vault Locks: ${premiumDemoData.vault_locks.length}`)
console.log(`   📱 Notifications: ${premiumDemoData.notifications.length}`)
console.log(`   💬 Chat History: ${premiumDemoData.chat_history.length}`)
console.log(`   🗳️  Proposals: ${premiumDemoData.proposals.length}`)
console.log(`   📈 Yield History: ${premiumDemoData.yield_history.length}`)
console.log('')
console.log('🎯 Database Features:')
console.log('   ⚡ Lightning-fast JSON operations')
console.log('   🔄 Auto-backup system')
console.log('   📊 Real-time analytics')
console.log('   🔗 Blockchain integration ready')
console.log('   💾 Premium demo data included')
console.log('')
console.log('🚀 Ready for hackathon demo!')
console.log('=' .repeat(60))
