import { type NextRequest, NextResponse } from "next/server"
import { stellarService } from "@/lib/stellar-service"

// Generate initial performance data when SIP is created
async function generateInitialPerformanceData(userAddress: string, sip: any) {
  try {
    // Get existing yield history
    const allYieldHistory = JSON.parse((global as any).tempYieldStorage || '[]')
    
    // Generate initial data points (simulating the first few days/weeks)
    const initialDataPoints = []
    const startDate = new Date()
    
    // Create 5 initial data points showing gradual growth
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() - (4 - i) * 7) // Weekly intervals going back
      
      const progressFactor = (i + 1) / 5
      const baseAPY = sip.apy_target || 8.5
      const currentAPY = baseAPY * (0.7 + 0.3 * progressFactor) // Start at 70% of target, grow to 100%
      const earned = parseFloat(sip.amount) * (currentAPY / 100) * (progressFactor * 0.1) // Cumulative earnings
      
      initialDataPoints.push({
        id: allYieldHistory.length + i + 1,
        userAddress,
        apy: parseFloat(currentAPY.toFixed(2)),
        earned: parseFloat(earned.toFixed(2)),
        date: date.toISOString(),
        timestamp: date.getTime(),
        sipId: sip.id
      })
    }
    
    // Add to yield history storage
    allYieldHistory.push(...initialDataPoints)
    ;(global as any).tempYieldStorage = JSON.stringify(allYieldHistory)
    
    console.log(`✅ Generated ${initialDataPoints.length} initial performance data points for SIP ${sip.id}`)
  } catch (error) {
    console.error("Failed to generate initial performance data:", error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get("userAddress")

    if (!userAddress) {
      return NextResponse.json({ success: false, error: "User address required" }, { status: 400 })
    }

    // Get user SIPs from REAL Stellar blockchain
    const sipIds = await stellarService.getUserSIPs(userAddress)
    
    // Fetch details for each SIP
    const userSIPs = []
    for (const sipId of sipIds) {
      const sipDetails = await stellarService.getSIPDetails(sipId)
      if (sipDetails) {
        // Parse frequency enum (comes as array like ['Daily'])
        let frequency = 'Monthly'
        if (Array.isArray(sipDetails.frequency) && sipDetails.frequency.length > 0) {
          frequency = sipDetails.frequency[0]
        }
        
        // Parse status enum
        let status = 'Active'
        if (Array.isArray(sipDetails.status) && sipDetails.status.length > 0) {
          status = sipDetails.status[0]
        }
        
        userSIPs.push({
          id: sipId,
          name: `SIP #${sipId}`,
          token_symbol: 'XLM',
          amount: sipDetails.amount,
          frequency: frequency,
          duration: sipDetails.max_executions,
          penalty: sipDetails.penalty_bps / 100, // Convert basis points to percentage
          user_address: userAddress,
          status: status,
          total_deposits: sipDetails.total_deposits,
          execution_count: sipDetails.execution_count,
          apy_target: 8.5,
          next_execution: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          created_at: new Date(Number(sipDetails.start_time) * 1000).toISOString()
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: userSIPs,
      total: userSIPs.length,
    })
  } catch (error) {
    console.error("Error fetching SIPs from blockchain:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch SIPs from blockchain" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, token, amount, frequency, userAddress, duration, penalty = 2, reason, signedXDR } = body

    // Validate required fields
    if (!name || !token || !amount || !frequency || !userAddress) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // If no signedXDR, this is step 1: prepare transaction
    if (!signedXDR) {
      // Build transaction XDR for user to sign
      const transactionXDR = await stellarService.buildCreateSIPTransaction(
        userAddress,
        {
          name,
          token: token.toUpperCase(),
          amount: parseFloat(amount),
          frequency,
          duration: duration ? parseInt(duration) : 0,
          penalty: parseFloat(penalty)
        }
      )

      return NextResponse.json({
        success: true,
        requiresSignature: true,
        transactionXDR,
        message: "Please sign the transaction in your wallet"
      })
    }

    // If signedXDR provided, this is step 2: submit to blockchain
    const result = await stellarService.submitTransaction(signedXDR)
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || "Failed to submit transaction to blockchain" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        transactionHash: result.hash,
        message: "SIP created successfully on Stellar blockchain!"
      }
    })
  } catch (error) {
    console.error("Error creating SIP on blockchain:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create SIP on blockchain" 
    }, { status: 500 })
  }
}


