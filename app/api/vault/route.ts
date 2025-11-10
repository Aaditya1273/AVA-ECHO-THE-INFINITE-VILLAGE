import { type NextRequest, NextResponse } from "next/server"
import { blockchainService } from "@/lib/blockchain-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get("userAddress")

    if (!userAddress) {
      return NextResponse.json({ success: false, error: "User address required" }, { status: 400 })
    }

    // Get real vault data from blockchain
    const blockchainLocks = await blockchainService.getUserLocks(userAddress)
    
    // Also get locks from temporary storage (for demo purposes)
    const tempLocks = JSON.parse((global as any).tempLockStorage || '[]')
    const userTempLocks = tempLocks.map((lock: any) => ({
      id: lock.id,
      token: lock.tokenAddress,
      amount: lock.amount,
      unlockTime: Math.floor(lock.unlockTime / 1000), // Convert to seconds
      status: Date.now() < lock.unlockTime ? 'LOCKED' : 'UNLOCKED'
    }))
    
    // Combine blockchain and temporary locks
    const allLocks = [...blockchainLocks, ...userTempLocks]
    
    // Calculate total locked value
    const totalLocked = allLocks.reduce((sum, lock) => sum + parseFloat(lock.amount), 0)

    const vaultData = {
      totalLocked,
      locks: allLocks.map(lock => ({
        id: lock.id,
        token: lock.token === process.env.NEXT_PUBLIC_USDC_ADDRESS ? 'USDC' : 
               lock.token === process.env.NEXT_PUBLIC_ETH_ADDRESS ? 'ETH' : 'XLM',
        amount: lock.amount,
        unlockTime: lock.unlockTime,
        status: lock.status
      })),
      governance: {
        requiredSignatures: 3,
        totalSigners: 5,
        emergencyProtocol: "Active",
        governanceDelay: "48 hours"
      }
    }

    return NextResponse.json({
      success: true,
      data: vaultData,
    })
  } catch (error) {
    console.error("Error fetching vault data:", error)
    
    // Return empty vault if blockchain fails
    return NextResponse.json({
      success: true,
      data: {
        totalLocked: 0,
        locks: [],
        governance: {
          requiredSignatures: 3,
          totalSigners: 5,
          emergencyProtocol: "Active",
          governanceDelay: "48 hours"
        }
      },
    })
  }
}
