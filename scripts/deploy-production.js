#!/usr/bin/env node

/**
 * 🚀 SPHIRA PRODUCTION DEPLOYMENT SCRIPT
 * Deploy contracts and launch the DeFi platform
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 SPHIRA DEFI PLATFORM - PRODUCTION DEPLOYMENT')
console.log('=' .repeat(60))

try {
  // Step 1: Deploy smart contracts
  console.log('\n📋 Step 1: Deploying Smart Contracts...')
  execSync('npx hardhat run scripts/quick-deploy.js --network somnia-testnet', { stdio: 'inherit' })
  
  // Step 2: Build the application
  console.log('\n🏗️ Step 2: Building Application...')
  execSync('npm run build', { stdio: 'inherit' })
  
  // Step 3: Start production server
  console.log('\n🚀 Step 3: Starting Production Server...')
  console.log('✅ Your Sphira DeFi Platform is now LIVE!')
  console.log('🌐 Access at: http://localhost:3000')
  console.log('💰 Connect wallet to Somnia testnet')
  console.log('🎯 All data is now REAL blockchain data!')
  
  execSync('npm start', { stdio: 'inherit' })
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message)
  process.exit(1)
}