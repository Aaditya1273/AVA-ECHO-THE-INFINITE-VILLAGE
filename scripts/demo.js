#!/usr/bin/env node

/**
 * Sphira DeFi Platform Demo Script
 *
 * This script demonstrates the key features of the Sphira platform:
 * 1. Portfolio overview
 * 2. SIP creation and management
 * 3. Yield optimization
 * 4. Chat commands
 * 5. Emergency fund locking
 */

const { ethers } = require("ethers")
const readline = require("readline")

// Demo configuration
const DEMO_CONFIG = {
  rpcUrl: "https://testnet-rpc.somnia.network",
  chainId: 2648,
  contracts: {
    sipManager: "0x1234567890123456789012345678901234567890",
    yieldRouter: "0x2345678901234567890123456789012345678901",
    lockVault: "0x3456789012345678901234567890123456789012",
  },
  tokens: {
    USDC: "0x4567890123456789012345678901234567890123",
    ETH: "0x5678901234567890123456789012345678901234",
    SOM: "0x6789012345678901234567890123456789012345",
  },
}

class SphiraDemo {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    this.provider = new ethers.JsonRpcProvider(DEMO_CONFIG.rpcUrl)
    this.wallet = null
    this.contracts = {}

    this.demoData = {
      portfolio: {
        totalValue: "10000.00",
        totalDeposited: "9500.00",
        totalYield: "500.00",
        yieldPercentage: 5.26,
        activeSips: 3,
        lockedFunds: "2000.00",
      },
      sips: [
        {
          id: "sip_001",
          amount: "100.00",
          token: "USDC",
          frequency: "weekly",
          status: "active",
          nextExecution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          totalDeposited: "400.00",
        },
        {
          id: "sip_002",
          amount: "50.00",
          token: "ETH",
          frequency: "monthly",
          status: "active",
          nextExecution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          totalDeposited: "200.00",
        },
      ],
      yieldPools: [
        {
          name: "USDC-SOM LP",
          protocol: "SomniaSwap",
          apy: 15.5,
          allocation: "40%",
          value: "4000.00",
        },
        {
          name: "ETH Staking",
          protocol: "Somnia Staking",
          apy: 8.2,
          allocation: "30%",
          value: "3000.00",
        },
        {
          name: "USDC Lending",
          protocol: "Somnia Lend",
          apy: 6.8,
          allocation: "30%",
          value: "3000.00",
        },
      ],
    }
  }

  async start() {
    console.log("\n🚀 Welcome to Sphira DeFi Platform Demo!")
    console.log("=====================================\n")

    await this.showMainMenu()
  }

  async showMainMenu() {
    console.log("📋 Main Menu:")
    console.log("1. Portfolio Overview")
    console.log("2. SIP Management")
    console.log("3. Yield Optimization")
    console.log("4. Chat Commands Demo")
    console.log("5. Emergency Fund Lock")
    console.log("6. Analytics Dashboard")
    console.log("7. Exit\n")

    const choice = await this.askQuestion("Select an option (1-7): ")

    switch (choice) {
      case "1":
        await this.showPortfolioOverview()
        break
      case "2":
        await this.showSIPManagement()
        break
      case "3":
        await this.showYieldOptimization()
        break
      case "4":
        await this.showChatCommands()
        break
      case "5":
        await this.showEmergencyFundLock()
        break
      case "6":
        await this.showAnalytics()
        break
      case "7":
        console.log("\n👋 Thank you for trying Sphira! Visit https://sphira.finance for more info.\n")
        this.rl.close()
        return
      default:
        console.log("❌ Invalid option. Please try again.\n")
        await this.showMainMenu()
    }
  }

  async showPortfolioOverview() {
    console.log("\n💼 Portfolio Overview")
    console.log("====================\n")

    const { portfolio } = this.demoData

    console.log(`📊 Total Portfolio Value: $${portfolio.totalValue}`)
    console.log(`💰 Total Deposited: $${portfolio.totalDeposited}`)
    console.log(`📈 Total Yield Earned: $${portfolio.totalYield} (${portfolio.yieldPercentage}%)`)
    console.log(`🔄 Active SIPs: ${portfolio.activeSips}`)
    console.log(`🔒 Locked Funds: $${portfolio.lockedFunds}\n`)

    console.log("💎 Token Breakdown:")
    console.log("├── USDC: $5,000.00 (50%)")
    console.log("├── ETH: $3,000.00 (30%)")
    console.log("└── SOM: $2,000.00 (20%)\n")

    console.log("📈 Performance (Last 30 Days):")
    console.log("├── Best Day: +$125.50 (Jan 15)")
    console.log("├── Worst Day: -$45.20 (Jan 8)")
    console.log("└── Average Daily: +$16.67\n")

    await this.askQuestion("Press Enter to continue...")
    await this.showMainMenu()
  }

  async showSIPManagement() {
    console.log("\n🔄 SIP Management")
    console.log("=================\n")

    console.log("📋 Active SIPs:")
    this.demoData.sips.forEach((sip, index) => {
      console.log(`${index + 1}. ${sip.amount} ${sip.token} - ${sip.frequency}`)
      console.log(`   Status: ${sip.status}`)
      console.log(`   Next: ${sip.nextExecution.toLocaleDateString()}`)
      console.log(`   Total Deposited: $${sip.totalDeposited}\n`)
    })

    console.log("🛠️ SIP Actions:")
    console.log("1. Create New SIP")
    console.log("2. Modify Existing SIP")
    console.log("3. Cancel SIP")
    console.log("4. Back to Main Menu\n")

    const choice = await this.askQuestion("Select action (1-4): ")

    switch (choice) {
      case "1":
        await this.createNewSIP()
        break
      case "2":
        await this.modifySIP()
        break
      case "3":
        await this.cancelSIP()
        break
      case "4":
        await this.showMainMenu()
        break
      default:
        console.log("❌ Invalid option.\n")
        await this.showSIPManagement()
    }
  }

  async createNewSIP() {
    console.log("\n✨ Create New SIP")
    console.log("==================\n")

    const amount = await this.askQuestion("Enter amount: $")
    const token = await this.askQuestion("Enter token (USDC/ETH/SOM): ")
    const frequency = await this.askQuestion("Enter frequency (daily/weekly/monthly): ")
    const duration = await this.askQuestion("Enter duration (number of periods): ")

    console.log("\n📋 SIP Summary:")
    console.log(`Amount: $${amount} ${token}`)
    console.log(`Frequency: ${frequency}`)
    console.log(`Duration: ${duration} periods`)
    console.log(`Total Investment: $${Number.parseFloat(amount) * Number.parseInt(duration)}\n`)

    const confirm = await this.askQuestion("Confirm creation? (y/n): ")

    if (confirm.toLowerCase() === "y") {
      console.log("\n⏳ Creating SIP...")
      await this.simulateTransaction()
      console.log("✅ SIP created successfully!")
      console.log(`📄 Transaction Hash: 0x${Math.random().toString(16).substr(2, 64)}`)
      console.log(`🆔 SIP ID: sip_${Math.random().toString(36).substr(2, 9)}\n`)
    } else {
      console.log("❌ SIP creation cancelled.\n")
    }

    await this.askQuestion("Press Enter to continue...")
    await this.showSIPManagement()
  }

  async modifySIP() {
    console.log("\n✏️ Modify SIP")
    console.log("==============\n")

    console.log("Select SIP to modify:")
    this.demoData.sips.forEach((sip, index) => {
      console.log(`${index + 1}. ${sip.amount} ${sip.token} - ${sip.frequency}`)
    })

    const sipIndex = await this.askQuestion("\nSelect SIP (1-2): ")
    const selectedSip = this.demoData.sips[Number.parseInt(sipIndex) - 1]

    if (!selectedSip) {
      console.log("❌ Invalid SIP selection.\n")
      await this.showSIPManagement()
      return
    }

    console.log(`\n📝 Modifying SIP: ${selectedSip.id}`)
    console.log("What would you like to change?")
    console.log("1. Amount")
    console.log("2. Frequency")
    console.log("3. Both\n")

    const changeType = await this.askQuestion("Select option (1-3): ")

    if (changeType === "1" || changeType === "3") {
      const newAmount = await this.askQuestion(`New amount (current: $${selectedSip.amount}): $`)
      selectedSip.amount = newAmount
    }

    if (changeType === "2" || changeType === "3") {
      const newFrequency = await this.askQuestion(`New frequency (current: ${selectedSip.frequency}): `)
      selectedSip.frequency = newFrequency
    }

    console.log("\n⏳ Updating SIP...")
    await this.simulateTransaction()
    console.log("✅ SIP updated successfully!\n")

    await this.askQuestion("Press Enter to continue...")
    await this.showSIPManagement()
  }

  async cancelSIP() {
    console.log("\n🗑️ Cancel SIP")
    console.log("==============\n")

    console.log("Select SIP to cancel:")
    this.demoData.sips.forEach((sip, index) => {
      console.log(`${index + 1}. ${sip.amount} ${sip.token} - ${sip.frequency}`)
    })

    const sipIndex = await this.askQuestion("\nSelect SIP (1-2): ")
    const selectedSip = this.demoData.sips[Number.parseInt(sipIndex) - 1]

    if (!selectedSip) {
      console.log("❌ Invalid SIP selection.\n")
      await this.showSIPManagement()
      return
    }

    console.log(`\n⚠️ Warning: Cancelling SIP ${selectedSip.id}`)
    console.log("This action cannot be undone.")

    const confirm = await this.askQuestion("Are you sure? (y/n): ")

    if (confirm.toLowerCase() === "y") {
      console.log("\n⏳ Cancelling SIP...")
      await this.simulateTransaction()
      selectedSip.status = "cancelled"
      console.log("✅ SIP cancelled successfully!\n")
    } else {
      console.log("❌ Cancellation aborted.\n")
    }

    await this.askQuestion("Press Enter to continue...")
    await this.showSIPManagement()
  }

  async showYieldOptimization() {
    console.log("\n📈 Yield Optimization")
    console.log("=====================\n")

    console.log("🎯 Current Yield Strategy: Balanced")
    console.log("📊 Average APY: 12.8%")
    console.log("🔄 Last Rebalance: 2 hours ago\n")

    console.log("💰 Pool Allocations:")
    this.demoData.yieldPools.forEach((pool, index) => {
      console.log(`${index + 1}. ${pool.name} (${pool.protocol})`)
      console.log(`   APY: ${pool.apy}% | Allocation: ${pool.allocation} | Value: $${pool.value}`)
      console.log("")
    })

    console.log("🔧 Optimization Actions:")
    console.log("1. Rebalance Now")
    console.log("2. Change Strategy")
    console.log("3. View Pool Details")
    console.log("4. Back to Main Menu\n")

    const choice = await this.askQuestion("Select action (1-4): ")

    switch (choice) {
      case "1":
        await this.rebalancePortfolio()
        break
      case "2":
        await this.changeStrategy()
        break
      case "3":
        await this.viewPoolDetails()
        break
      case "4":
        await this.showMainMenu()
        break
      default:
        console.log("❌ Invalid option.\n")
        await this.showYieldOptimization()
    }
  }

  async rebalancePortfolio() {
    console.log("\n⚖️ Portfolio Rebalancing")
    console.log("========================\n")

    console.log("🔍 Analyzing current market conditions...")
    await this.simulateDelay(2000)

    console.log("📊 Optimization opportunities found:")
    console.log("├── Move 5% from USDC Lending (6.8% APY) to USDC-SOM LP (15.5% APY)")
    console.log("├── Increase ETH Staking allocation by 3%")
    console.log("└── Estimated APY improvement: +0.8%\n")

    const confirm = await this.askQuestion("Execute rebalancing? (y/n): ")

    if (confirm.toLowerCase() === "y") {
      console.log("\n⏳ Executing rebalancing...")
      await this.simulateTransaction()
      console.log("✅ Portfolio rebalanced successfully!")
      console.log("📈 New Average APY: 13.6%\n")
    } else {
      console.log("❌ Rebalancing cancelled.\n")
    }

    await this.askQuestion("Press Enter to continue...")
    await this.showYieldOptimization()
  }

  async changeStrategy() {
    console.log("\n🎯 Change Yield Strategy")
    console.log("========================\n")

    console.log("Available Strategies:")
    console.log("1. Conservative (Low Risk, 6-8% APY)")
    console.log("   └── 70% Stablecoins, 30% Blue-chip tokens")
    console.log("2. Balanced (Medium Risk, 10-15% APY) [CURRENT]")
    console.log("   └── 50% Stablecoins, 50% Growth tokens")
    console.log("3. Aggressive (High Risk, 15-25% APY)")
    console.log("   └── 30% Stablecoins, 70% High-yield pools\n")

    const strategy = await this.askQuestion("Select strategy (1-3): ")

    const strategies = ["Conservative", "Balanced", "Aggressive"]
    const selectedStrategy = strategies[Number.parseInt(strategy) - 1]

    if (selectedStrategy) {
      console.log(`\n⏳ Switching to ${selectedStrategy} strategy...`)
      await this.simulateTransaction()
      console.log(`✅ Strategy changed to ${selectedStrategy}!\n`)
    } else {
      console.log("❌ Invalid strategy selection.\n")
    }

    await this.askQuestion("Press Enter to continue...")
    await this.showYieldOptimization()
  }

  async viewPoolDetails() {
    console.log("\n🏊 Pool Details")
    console.log("===============\n")

    console.log("Select pool for detailed information:")
    this.demoData.yieldPools.forEach((pool, index) => {
      console.log(`${index + 1}. ${pool.name}`)
    })

    const poolIndex = await this.askQuestion("\nSelect pool (1-3): ")
    const selectedPool = this.demoData.yieldPools[Number.parseInt(poolIndex) - 1]

    if (selectedPool) {
      console.log(`\n📊 ${selectedPool.name} Details:`)
      console.log(`Protocol: ${selectedPool.protocol}`)
      console.log(`Current APY: ${selectedPool.apy}%`)
      console.log(`Your Allocation: ${selectedPool.allocation}`)
      console.log(`Your Value: $${selectedPool.value}`)
      console.log(`Total Value Locked: $2,500,000`)
      console.log(`Risk Level: Medium`)
      console.log(`Liquidity: High\n`)

      console.log("📈 7-Day Performance:")
      console.log("├── Highest APY: 16.2%")
      console.log("├── Lowest APY: 14.8%")
      console.log("└── Average APY: 15.5%\n")
    } else {
      console.log("❌ Invalid pool selection.\n")
    }

    await this.askQuestion("Press Enter to continue...")
    await this.showYieldOptimization()
  }

  async showChatCommands() {
    console.log("\n💬 Chat Commands Demo")
    console.log("=====================\n")

    console.log("🤖 Sphira AI Assistant is ready to help!")
    console.log("Try these commands:\n")

    console.log("Available Commands:")
    console.log("├── /startSIP <amount> <token> <frequency>")
    console.log("├── /portfolio")
    console.log("├── /yield")
    console.log("├── /lockFunds <amount> <token>")
    console.log("├── /sips")
    console.log("├── /cancel <sipId>")
    console.log("└── /help\n")

    while (true) {
      const command = await this.askQuestion('💬 Enter command (or "exit" to return): ')

      if (command.toLowerCase() === "exit") {
        break
      }

      await this.processCommand(command)
    }

    await this.showMainMenu()
  }

  async processCommand(command) {
    const parts = command.split(" ")
    const cmd = parts[0].toLowerCase()

    console.log("\n🤖 Sphira AI:")

    switch (cmd) {
      case "/startsip":
        if (parts.length >= 4) {
          const amount = parts[1]
          const token = parts[2]
          const frequency = parts[3]
          console.log(`✅ SIP created! ${amount} ${token} ${frequency} for 12 weeks.`)
          console.log(`📅 Next execution: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}`)
          console.log(`🆔 SIP ID: sip_${Math.random().toString(36).substr(2, 9)}`)
        } else {
          console.log("❌ Usage: /startSIP <amount> <token> <frequency>")
          console.log("📝 Example: /startSIP 100 USDC weekly")
        }
        break

      case "/portfolio":
        console.log("💼 Portfolio Summary:")
        console.log(`├── Total Value: $${this.demoData.portfolio.totalValue}`)
        console.log(
          `├── Total Yield: $${this.demoData.portfolio.totalYield} (${this.demoData.portfolio.yieldPercentage}%)`,
        )
        console.log(`├── Active SIPs: ${this.demoData.portfolio.activeSips}`)
        console.log(`└── Locked Funds: $${this.demoData.portfolio.lockedFunds}`)
        break

      case "/yield":
        console.log("📈 Yield Information:")
        console.log("├── Average APY: 12.8%")
        console.log("├── Best Pool: USDC-SOM LP (15.5% APY)")
        console.log("├── Total Earned: $500.00")
        console.log("└── Next Rebalance: In 22 hours")
        break

      case "/lockfunds":
        if (parts.length >= 3) {
          const amount = parts[1]
          const token = parts[2]
          console.log(`🔒 Emergency lock created for ${amount} ${token}`)
          console.log("🛡️ Funds are now protected and require multi-sig approval for unlock")
          console.log(`🆔 Lock ID: lock_${Math.random().toString(36).substr(2, 9)}`)
        } else {
          console.log("❌ Usage: /lockFunds <amount> <token>")
          console.log("📝 Example: /lockFunds 1000 USDC")
        }
        break

      case "/sips":
        console.log("🔄 Active SIPs:")
        this.demoData.sips.forEach((sip, index) => {
          console.log(`├── ${sip.id}: ${sip.amount} ${sip.token} ${sip.frequency}`)
        })
        break

      case "/help":
        console.log("🆘 Available Commands:")
        console.log("├── /startSIP - Create new SIP")
        console.log("├── /portfolio - View portfolio")
        console.log("├── /yield - Yield information")
        console.log("├── /lockFunds - Lock emergency funds")
        console.log("├── /sips - List all SIPs")
        console.log("└── /cancel - Cancel SIP")
        break

      default:
        console.log("❓ Unknown command. Type /help for available commands.")
    }

    console.log("")
  }

  async showEmergencyFundLock() {
    console.log("\n🔒 Emergency Fund Lock")
    console.log("======================\n")

    console.log("🛡️ Emergency Vault Status:")
    console.log(`├── Total Locked: $${this.demoData.portfolio.lockedFunds}`)
    console.log("├── Active Locks: 2")
    console.log("├── Multi-sig Members: 5")
    console.log("└── Required Signatures: 3\n")

    console.log("📋 Active Locks:")
    console.log("1. Lock #001: $1,000 USDC (Jan 15, 2025)")
    console.log("   └── Condition: Emergency market crash")
    console.log("2. Lock #002: $1,000 ETH (Jan 18, 2025)")
    console.log("   └── Condition: Protocol vulnerability\n")

    console.log("🔧 Lock Actions:")
    console.log("1. Create New Lock")
    console.log("2. Request Emergency Unlock")
    console.log("3. View Lock Details")
    console.log("4. Back to Main Menu\n")

    const choice = await this.askQuestion("Select action (1-4): ")

    switch (choice) {
      case "1":
        await this.createEmergencyLock()
        break
      case "2":
        await this.requestEmergencyUnlock()
        break
      case "3":
        await this.viewLockDetails()
        break
      case "4":
        await this.showMainMenu()
        break
      default:
        console.log("❌ Invalid option.\n")
        await this.showEmergencyFundLock()
    }
  }

  async createEmergencyLock() {
    console.log("\n🔐 Create Emergency Lock")
    console.log("========================\n")

    const amount = await this.askQuestion("Enter amount to lock: $")
    const token = await this.askQuestion("Enter token (USDC/ETH/SOM): ")
    const condition = await this.askQuestion("Enter unlock condition: ")

    console.log("\n📋 Lock Summary:")
    console.log(`Amount: $${amount} ${token}`)
    console.log(`Condition: ${condition}`)
    console.log("Multi-sig Required: 3/5 signatures\n")

    const confirm = await this.askQuestion("Create emergency lock? (y/n): ")

    if (confirm.toLowerCase() === "y") {
      console.log("\n⏳ Creating emergency lock...")
      await this.simulateTransaction()
      console.log("✅ Emergency lock created successfully!")
      console.log(`🆔 Lock ID: lock_${Math.random().toString(36).substr(2, 9)}`)
      console.log("🛡️ Funds are now protected and require multi-sig approval for unlock\n")
    } else {
      console.log("❌ Lock creation cancelled.\n")
    }

    await this.askQuestion("Press Enter to continue...")
    await this.showEmergencyFundLock()
  }

  async requestEmergencyUnlock() {
    console.log("\n🚨 Request Emergency Unlock")
    console.log("===========================\n")

    console.log("⚠️ WARNING: Emergency unlocks should only be requested in genuine emergencies.")
    console.log("This action will notify all multi-sig members for approval.\n")

    console.log("Select lock to unlock:")
    console.log("1. Lock #001: $1,000 USDC")
    console.log("2. Lock #002: $1,000 ETH\n")

    const lockChoice = await this.askQuestion("Select lock (1-2): ")
    const reason = await this.askQuestion("Enter emergency reason: ")

    console.log("\n📋 Unlock Request Summary:")
    console.log(`Lock: #00${lockChoice}`)
    console.log(`Reason: ${reason}`)
    console.log("Required Approvals: 3/5\n")

    const confirm = await this.askQuestion("Submit unlock request? (y/n): ")

    if (confirm.toLowerCase() === "y") {
      console.log("\n⏳ Submitting unlock request...")
      await this.simulateTransaction()
      console.log("✅ Emergency unlock request submitted!")
      console.log("📧 Multi-sig members have been notified")
      console.log("⏰ Estimated approval time: 2-24 hours\n")
    } else {
      console.log("❌ Unlock request cancelled.\n")
    }

    await this.askQuestion("Press Enter to continue...")
    await this.showEmergencyFundLock()
  }

  async viewLockDetails() {
    console.log("\n🔍 Lock Details")
    console.log("===============\n")

    console.log("Select lock to view:")
    console.log("1. Lock #001: $1,000 USDC")
    console.log("2. Lock #002: $1,000 ETH\n")

    const lockChoice = await this.askQuestion("Select lock (1-2): ")

    console.log(`\n📊 Lock #00${lockChoice} Details:`)
    console.log(`Amount: $1,000 ${lockChoice === "1" ? "USDC" : "ETH"}`)
    console.log(`Created: Jan ${lockChoice === "1" ? "15" : "18"}, 2025`)
    console.log(`Condition: ${lockChoice === "1" ? "Emergency market crash" : "Protocol vulnerability"}`)
    console.log("Status: Active")
    console.log("Multi-sig: 3/5 required")
    console.log("Unlock Requests: 0\n")

    console.log("🔐 Multi-sig Members:")
    console.log("├── 0x1234...5678 (Admin)")
    console.log("├── 0x2345...6789 (Community Rep)")
    console.log("├── 0x3456...7890 (Technical Lead)")
    console.log("├── 0x4567...8901 (Security Expert)")
    console.log("└── 0x5678...9012 (Community Rep)\n")

    await this.askQuestion("Press Enter to continue...")
    await this.showEmergencyFundLock()
  }

  async showAnalytics() {
    console.log("\n📊 Analytics Dashboard")
    console.log("======================\n")

    console.log("🌐 Platform Statistics:")
    console.log("├── Total Users: 1,250")
    console.log("├── Total SIPs: 3,500")
    console.log("├── Total Value Locked: $5,000,000")
    console.log("├── Average Yield: 12.5%")
    console.log("└── Active Pools: 15\n")

    console.log("📈 Your Performance:")
    console.log("├── Portfolio Rank: #127 (Top 10%)")
    console.log("├── Best Month: +$85.50 (December 2024)")
    console.log("├── Consistency Score: 8.5/10")
    console.log("└── Risk Score: Medium\n")

    console.log("🏆 Achievements:")
    console.log("├── ✅ First SIP Created")
    console.log("├── ✅ $1K Milestone")
    console.log("├── ✅ Yield Optimizer")
    console.log("├── ⏳ Emergency Preparedness (80%)")
    console.log("└── ⏳ Diamond Hands (60%)\n")

    console.log("📅 Recent Activity (Last 7 Days):")
    console.log("├── Jan 20: SIP executed (+$100 USDC)")
    console.log("├── Jan 19: Yield harvested (+$12.50)")
    console.log("├── Jan 18: Emergency lock created")
    console.log("├── Jan 17: Portfolio rebalanced")
    console.log("└── Jan 15: New SIP created\n")

    await this.askQuestion("Press Enter to continue...")
    await this.showMainMenu()
  }

  async simulateTransaction() {
    const steps = ["Preparing transaction...", "Signing...", "Broadcasting...", "Confirming..."]

    for (const step of steps) {
      process.stdout.write(`⏳ ${step}`)
      await this.simulateDelay(1000)
      process.stdout.write("\r✅ " + step + " Done!\n")
    }
  }

  async simulateDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer)
      })
    })
  }
}

// Start the demo
if (require.main === module) {
  const demo = new SphiraDemo()
  demo.start().catch(console.error)
}

module.exports = SphiraDemo
