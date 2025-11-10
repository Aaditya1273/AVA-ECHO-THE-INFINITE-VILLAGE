/**
 * 🚀 QUICK DEPLOYMENT SCRIPT FOR PRODUCTION LAUNCH
 * Deploys all contracts to Somnia testnet for immediate use
 */

const hre = require("hardhat")

async function main() {
  console.log("🚀 SPHIRA PRODUCTION DEPLOYMENT STARTING...")
  console.log("=" .repeat(50))

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners()
  console.log("Deploying with account:", deployer.address)
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "SOM")

  // Deploy SIPManager
  console.log("\n📋 Deploying SIPManager...")
  const SIPManager = await hre.ethers.getContractFactory("SIPManager")
  const sipManager = await SIPManager.deploy()
  await sipManager.deployed()
  console.log("✅ SIPManager deployed to:", sipManager.address)

  // Deploy YieldRouter
  console.log("\n💰 Deploying YieldRouter...")
  const YieldRouter = await hre.ethers.getContractFactory("YieldRouter")
  const yieldRouter = await YieldRouter.deploy()
  await yieldRouter.deployed()
  console.log("✅ YieldRouter deployed to:", yieldRouter.address)

  // Deploy LockVault
  console.log("\n🔒 Deploying LockVault...")
  const LockVault = await hre.ethers.getContractFactory("LockVault")
  const lockVault = await LockVault.deploy()
  await lockVault.deployed()
  console.log("✅ LockVault deployed to:", lockVault.address)

  // Update environment variables
  console.log("\n🔧 ENVIRONMENT VARIABLES TO UPDATE:")
  console.log("=" .repeat(50))
  console.log(`NEXT_PUBLIC_SIP_MANAGER_ADDRESS=${sipManager.address}`)
  console.log(`NEXT_PUBLIC_YIELD_ROUTER_ADDRESS=${yieldRouter.address}`)
  console.log(`NEXT_PUBLIC_LOCK_VAULT_ADDRESS=${lockVault.address}`)

  console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!")
  console.log("=" .repeat(50))
  console.log("Next steps:")
  console.log("1. Update .env.local with the addresses above")
  console.log("2. Restart your Next.js development server")
  console.log("3. Your DeFi platform is now connected to real blockchain!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  })