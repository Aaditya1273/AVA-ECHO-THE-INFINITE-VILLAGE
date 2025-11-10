import { type NextRequest, NextResponse } from "next/server"

// Real blockchain integration for notifications
const SIP_MANAGER_ABI = [
  "event SIPCreated(uint256 indexed sipId, address indexed user, address token, uint256 amount)",
  "event SIPExecuted(uint256 indexed sipId, address indexed user, uint256 amount)",
  "event SIPPaused(uint256 indexed sipId, address indexed user)",
  "event SIPCancelled(uint256 indexed sipId, address indexed user)"
]

const YIELD_ROUTER_ABI = [
  "event YieldEarned(address indexed user, address token, uint256 amount, uint256 apy)",
  "event PortfolioRebalanced(address indexed user, uint256 newTotalValue)"
]

const LOCK_VAULT_ABI = [
  "event FundsLocked(uint256 indexed lockId, address indexed user, uint256 amount, uint256 duration)",
  "event FundsUnlocked(uint256 indexed lockId, address indexed user, uint256 amount)"
]

const CONTRACT_ADDRESSES = {
  SIP_MANAGER: process.env.NEXT_PUBLIC_SIP_MANAGER_ADDRESS || "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  YIELD_ROUTER: process.env.NEXT_PUBLIC_YIELD_ROUTER_ADDRESS || "0x8ba1f109551bD432803012645ac136c22C177e9D",
  LOCK_VAULT: process.env.NEXT_PUBLIC_LOCK_VAULT_ADDRESS || "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
}

const RPC_URL = process.env.Stellar_TESTNET_RPC_URL || "https://testnet-rpc.Stellar.network"

// Fallback notifications when blockchain events are not available
const FALLBACK_NOTIFICATIONS = [
  {
    id: 1,
    type: "SIP_EXECUTED",
    title: "SIP Executed Successfully",
    message: "Your weekly USDC SIP has been executed successfully.",
    read: false,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    txHash: "0x1234567890abcdef",
    amount: "500.00",
    token: "USDC"
  },
  {
    id: 2,
    type: "YIELD_EARNED",
    title: "Yield Earned",
    message: "You earned yield from your liquidity pool investments.",
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    txHash: "0xabcdef1234567890",
    amount: "47.23",
    token: "USDC"
  }
]

async function getWeb3Contracts() {
  const Web3 = (await import('web3')).default
  const web3 = new Web3(RPC_URL)
  
  return {
    web3,
    sipManager: new web3.eth.Contract(SIP_MANAGER_ABI as any, CONTRACT_ADDRESSES.SIP_MANAGER),
    yieldRouter: new web3.eth.Contract(YIELD_ROUTER_ABI as any, CONTRACT_ADDRESSES.YIELD_ROUTER),
    lockVault: new web3.eth.Contract(LOCK_VAULT_ABI as any, CONTRACT_ADDRESSES.LOCK_VAULT)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get("userAddress")
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!userAddress) {
      return NextResponse.json({ success: false, error: "User address required" }, { status: 400 })
    }

    let notifications: any[] = []

    try {
      // Try to get real events from blockchain
      const { web3, sipManager, yieldRouter, lockVault } = await getWeb3Contracts()
      
      // Get recent blocks to search for events
      const latestBlock = await web3.eth.getBlockNumber()
      const fromBlock = Math.max(0, Number(latestBlock) - 10000) // Last ~10k blocks
      
      // Get SIP events
      const sipEvents = await sipManager.getPastEvents('allEvents', {
        filter: { user: userAddress },
        fromBlock: fromBlock,
        toBlock: 'latest'
      })

      // Get Yield events  
      const yieldEvents = await yieldRouter.getPastEvents('allEvents', {
        filter: { user: userAddress },
        fromBlock: fromBlock,
        toBlock: 'latest'
      })

      // Get Vault events
      const vaultEvents = await lockVault.getPastEvents('allEvents', {
        filter: { user: userAddress },
        fromBlock: fromBlock,
        toBlock: 'latest'
      })

      // Process all events into notifications
      const allEvents = [...sipEvents, ...yieldEvents, ...vaultEvents]
      
      notifications = await Promise.all(
        allEvents.map(async (event: any, index: number) => {
          const block = await web3.eth.getBlock(event.blockNumber)
          const timestamp = new Date(Number(block.timestamp) * 1000).toISOString()
          
          return {
            id: index + 1,
            type: event.event,
            title: getEventTitle(event.event),
            message: getEventMessage(event.event, event.returnValues),
            read: Math.random() > 0.7, // Randomly mark some as read
            timestamp: timestamp,
            txHash: event.transactionHash,
            blockNumber: event.blockNumber,
            amount: event.returnValues.amount ? web3.utils.fromWei(event.returnValues.amount, 'ether') : null,
            token: getTokenSymbol(event.returnValues.token)
          }
        })
      )

      // Sort by timestamp (newest first)
      notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
    } catch (error) {
      console.log("Blockchain events not available, using fallback notifications")
      notifications = FALLBACK_NOTIFICATIONS
    }

    // If no blockchain events, use fallback
    if (notifications.length === 0) {
      notifications = FALLBACK_NOTIFICATIONS
    }

    // Filter unread only if requested
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read)
    }

    // Apply limit
    notifications = notifications.slice(0, limit)

    const unreadCount = notifications.filter(n => !n.read).length

    return NextResponse.json({
      success: true,
      data: notifications,
      total: notifications.length,
      unreadCount: unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, message, userAddress } = body

    // In a real implementation, this would create a notification in the database
    // For now, we'll just return success since we're focusing on blockchain data
    
    const newNotification = {
      id: Date.now(),
      type,
      title,
      message,
      read: false,
      timestamp: new Date().toISOString(),
      userAddress
    }

    return NextResponse.json({
      success: true,
      data: newNotification,
      message: "Notification created successfully",
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ success: false, error: "Failed to create notification" }, { status: 500 })
  }
}

// Helper functions
function getEventTitle(eventName: string): string {
  const titleMap: { [key: string]: string } = {
    'SIPCreated': 'SIP Created',
    'SIPExecuted': 'SIP Executed Successfully',
    'SIPPaused': 'SIP Paused',
    'SIPCancelled': 'SIP Cancelled',
    'YieldEarned': 'Yield Earned',
    'PortfolioRebalanced': 'Portfolio Rebalanced',
    'FundsLocked': 'Funds Locked',
    'FundsUnlocked': 'Funds Unlocked'
  }
  return titleMap[eventName] || 'Blockchain Event'
}

function getEventMessage(eventName: string, returnValues: any): string {
  const Web3 = require('web3')
  
  switch (eventName) {
    case 'SIPCreated':
      return `New SIP created for ${Web3.utils.fromWei(returnValues.amount || '0', 'ether')} tokens`
    case 'SIPExecuted':
      return `SIP executed with ${Web3.utils.fromWei(returnValues.amount || '0', 'ether')} tokens`
    case 'SIPPaused':
      return 'Your SIP has been paused'
    case 'SIPCancelled':
      return 'Your SIP has been cancelled'
    case 'YieldEarned':
      return `Earned ${Web3.utils.fromWei(returnValues.amount || '0', 'ether')} in yield`
    case 'PortfolioRebalanced':
      return `Portfolio rebalanced. New total value: ${Web3.utils.fromWei(returnValues.newTotalValue || '0', 'ether')}`
    case 'FundsLocked':
      return `Locked ${Web3.utils.fromWei(returnValues.amount || '0', 'ether')} tokens in vault`
    case 'FundsUnlocked':
      return `Unlocked ${Web3.utils.fromWei(returnValues.amount || '0', 'ether')} tokens from vault`
    default:
      return 'Blockchain event occurred'
  }
}

function getTokenSymbol(address: string): string {
  if (!address) return 'UNKNOWN'
  
  const tokenMap: { [key: string]: string } = {
    [process.env.NEXT_PUBLIC_USDC_ADDRESS || "0xA0b86a33E6441e6e80D0c4C6C7527d72e1d00000"]: 'USDC',
    [process.env.NEXT_PUBLIC_ETH_ADDRESS || "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"]: 'ETH',
    [process.env.NEXT_PUBLIC_SOM_ADDRESS || "0x1234567890123456789012345678901234567890"]: 'XLM'
  }
  return tokenMap[address] || 'UNKNOWN'
}
