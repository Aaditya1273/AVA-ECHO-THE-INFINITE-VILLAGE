#!/usr/bin/env node

/**
 * 🔍 DATABASE VIEWER
 * View the contents of your hackathon database
 * Run: node scripts/view-db.js
 */

const fs = require('fs')
const path = require('path')

const dbPath = path.join(process.cwd(), 'data', 'sphira-hackathon.json')

if (!fs.existsSync(dbPath)) {
  console.log('❌ Database not found. Run: npm run init-db')
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'))

console.log('🔍 SPHIRA HACKATHON DATABASE VIEWER')
console.log('=' .repeat(60))
console.log('')

// Metadata
console.log('📊 METADATA:')
console.log(`   Version: ${data.metadata.version}`)
console.log(`   Created: ${new Date(data.metadata.created).toLocaleString()}`)
console.log(`   Last Updated: ${new Date(data.metadata.lastUpdated).toLocaleString()}`)
console.log(`   Total Users: ${data.metadata.totalUsers}`)
console.log(`   Total Transactions: ${data.metadata.totalTransactions}`)
console.log('')

// Users
console.log('👥 USERS:')
data.users.forEach((user, i) => {
  console.log(`   ${i + 1}. ${user.wallet_address}`)
  console.log(`      💰 Total Invested: $${user.stats.total_invested}`)
  console.log(`      📈 Total Earned: $${user.stats.total_earned}`)
  console.log(`      🔄 Active SIPs: ${user.stats.active_sips}`)
  console.log(`      🔒 Vault Balance: $${user.stats.vault_balance}`)
  console.log(`      🎨 Theme: ${user.preferences.theme}`)
  console.log(`      💱 Currency: ${user.preferences.currency}`)
  console.log('')
})

// SIPs
console.log('💰 SYSTEMATIC INVESTMENT PLANS (SIPs):')
data.sips.forEach((sip, i) => {
  const nextExecution = new Date(sip.next_execution)
  const isUpcoming = nextExecution > new Date()
  console.log(`   ${i + 1}. ${sip.token_symbol} SIP - ${sip.frequency}`)
  console.log(`      💵 Amount: ${sip.amount} ${sip.token_symbol}`)
  console.log(`      📊 Status: ${sip.status}`)
  console.log(`      🎯 Target APY: ${sip.apy_target}%`)
  console.log(`      💸 Total Deposits: ${sip.total_deposits}`)
  console.log(`      🔄 Executions: ${sip.execution_count}`)
  console.log(`      ⏰ Next: ${nextExecution.toLocaleString()} ${isUpcoming ? '⏳' : '⚠️'}`)
  console.log('')
})

// Yield History
console.log('📈 YIELD HISTORY (Recent):')
data.yield_history.slice(-5).forEach((yield, i) => {
  console.log(`   ${i + 1}. ${yield.amount} from ${yield.strategy}`)
  console.log(`      📊 APY: ${yield.apy}%`)
  console.log(`      ⏰ ${new Date(yield.timestamp).toLocaleString()}`)
  console.log('')
})

// Vault Locks
console.log('🔒 EMERGENCY VAULT LOCKS:')
data.vault_locks.forEach((lock, i) => {
  const unlockTime = new Date(lock.unlock_time)
  const isLocked = unlockTime > new Date()
  const daysLeft = Math.ceil((unlockTime - new Date()) / (1000 * 60 * 60 * 24))
  
  console.log(`   ${i + 1}. $${lock.amount} - ${lock.reason}`)
  console.log(`      🔒 Status: ${lock.status}`)
  console.log(`      📅 Unlock: ${unlockTime.toLocaleString()}`)
  console.log(`      ⏰ ${isLocked ? `${daysLeft} days left` : 'UNLOCKED'} ${isLocked ? '🔒' : '🔓'}`)
  console.log(`      💰 Interest Earned: $${lock.interest_earned}`)
  console.log('')
})

// Notifications
console.log('📱 RECENT NOTIFICATIONS:')
data.notifications.slice(-5).forEach((notif, i) => {
  const isUnread = !notif.read
  console.log(`   ${i + 1}. ${notif.title} ${isUnread ? '🔴' : '✅'}`)
  console.log(`      📝 ${notif.message}`)
  console.log(`      🏷️ Type: ${notif.type}`)
  console.log(`      ⏰ ${new Date(notif.created_at).toLocaleString()}`)
  console.log('')
})

// Chat History
console.log('💬 RECENT CHAT INTERACTIONS:')
data.chat_history.slice(-3).forEach((chat, i) => {
  console.log(`   ${i + 1}. User: "${chat.message}"`)
  console.log(`      🤖 AI: "${chat.response}"`)
  if (chat.command) {
    console.log(`      🎯 Command: /${chat.command}`)
  }
  if (chat.satisfaction_rating) {
    console.log(`      ⭐ Rating: ${chat.satisfaction_rating}/5`)
  }
  console.log(`      ⏰ ${new Date(chat.timestamp).toLocaleString()}`)
  console.log('')
})

// Portfolio Snapshots
console.log('📊 PORTFOLIO SNAPSHOTS:')
data.portfolio_snapshots.slice(-2).forEach((snapshot, i) => {
  console.log(`   ${i + 1}. Total Value: $${snapshot.total_value}`)
  console.log(`      💰 SIPs: $${snapshot.breakdown.sips}`)
  console.log(`      📈 Yield: $${snapshot.breakdown.yield}`)
  console.log(`      🔒 Vault: $${snapshot.breakdown.vault}`)
  console.log(`      ⏰ ${new Date(snapshot.timestamp).toLocaleString()}`)
  console.log('')
})

console.log('🎯 DATABASE SUMMARY:')
console.log(`   📁 File Size: ${(JSON.stringify(data).length / 1024).toFixed(2)} KB`)
console.log(`   🏗️ Tables: ${Object.keys(data).length - 1} (excluding metadata)`)
console.log(`   📊 Total Records: ${Object.values(data).reduce((sum, table) => 
  Array.isArray(table) ? sum + table.length : sum, 0)}`)
console.log('')
console.log('🚀 Database is ready for your hackathon demo!')
console.log('=' .repeat(60))
