import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get("userAddress")

    if (!userAddress) {
      return NextResponse.json({ success: false, error: "User address required" }, { status: 400 })
    }

    // Get real yield history from temporary storage
    const allYieldHistory = JSON.parse((global as any).tempYieldStorage || '[]')
    
    // Filter by user address
    const userYieldHistory = allYieldHistory.filter((entry: any) => 
      entry.userAddress.toLowerCase() === userAddress.toLowerCase()
    )

    return NextResponse.json({
      success: true,
      data: userYieldHistory
    })
  } catch (error) {
    console.error("Error fetching yield history:", error)
    return NextResponse.json({ 
      success: true, 
      data: [] // Return empty array instead of error for better UX
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, apy, earned, date } = body

    if (!userAddress || !apy || !earned) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get existing yield history
    const allYieldHistory = JSON.parse((global as any).tempYieldStorage || '[]')
    
    // Add new yield entry
    const newEntry = {
      id: allYieldHistory.length + 1,
      userAddress,
      apy: parseFloat(apy),
      earned: parseFloat(earned),
      date: date || new Date().toISOString(),
      timestamp: Date.now()
    }

    allYieldHistory.push(newEntry)
    ;(global as any).tempYieldStorage = JSON.stringify(allYieldHistory)

    return NextResponse.json({
      success: true,
      data: newEntry,
      message: "Yield entry recorded successfully"
    })
  } catch (error) {
    console.error("Error recording yield entry:", error)
    return NextResponse.json({ success: false, error: "Failed to record yield entry" }, { status: 500 })
  }
}