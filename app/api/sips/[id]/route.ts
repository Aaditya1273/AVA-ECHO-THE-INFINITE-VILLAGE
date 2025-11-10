import { type NextRequest, NextResponse } from "next/server"
import { blockchainService } from "@/lib/blockchain-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sipId = Number.parseInt(params.id)
    
    if (isNaN(sipId)) {
      return NextResponse.json({ success: false, error: "Invalid SIP ID" }, { status: 400 })
    }

    // Get SIP data from blockchain
    const sipData = await blockchainService.getSIP(sipId)

    return NextResponse.json({
      success: true,
      data: sipData,
    })
  } catch (error) {
    console.error("Error fetching SIP from blockchain:", error)
    return NextResponse.json({ success: false, error: "SIP not found on blockchain" }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sipId = Number.parseInt(params.id)
    const body = await request.json()
    const { status, amount, frequency } = body

    if (isNaN(sipId)) {
      return NextResponse.json({ success: false, error: "Invalid SIP ID" }, { status: 400 })
    }

    // Prepare transaction data for frontend to execute
    let transactionData: any = {
      contractAddress: process.env.NEXT_PUBLIC_SIP_MANAGER_ADDRESS,
      sipId: sipId
    }

    if (status === 'PAUSED') {
      transactionData.method = 'pauseSIP'
      transactionData.params = { sipId }
    } else if (status === 'CANCELLED') {
      transactionData.method = 'cancelSIP'
      transactionData.params = { sipId }
    } else if (amount || frequency) {
      // Map frequency strings to numbers
      const frequencyMap: { [key: string]: number } = {
        'DAILY': 0,
        'WEEKLY': 1,
        'MONTHLY': 2
      }

      transactionData.method = 'updateSIP'
      transactionData.params = {
        sipId,
        newAmount: amount || '0',
        newFrequency: frequency ? frequencyMap[frequency.toUpperCase()] : 1
      }
    }

    return NextResponse.json({
      success: true,
      data: transactionData,
      message: "SIP update transaction prepared. Execute via wallet.",
    })
  } catch (error) {
    console.error("Error preparing SIP update:", error)
    return NextResponse.json({ success: false, error: "Failed to prepare SIP update" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sipId = Number.parseInt(params.id)
    const body = await request.json()
    const { userAddress } = body

    if (isNaN(sipId)) {
      return NextResponse.json({ success: false, error: "Invalid SIP ID" }, { status: 400 })
    }

    if (!userAddress) {
      return NextResponse.json({ success: false, error: "User address required" }, { status: 400 })
    }

    // Remove SIP from temporary storage (in production, this would interact with blockchain)
    const allSIPs = JSON.parse((global as any).tempSIPStorage || '{}')
    const userSIPs = allSIPs[userAddress] || []
    
    const sipIndex = userSIPs.findIndex((sip: any) => sip.id === sipId)
    if (sipIndex === -1) {
      return NextResponse.json({ success: false, error: "SIP not found" }, { status: 404 })
    }

    // Remove the SIP
    userSIPs.splice(sipIndex, 1)
    allSIPs[userAddress] = userSIPs
    ;(global as any).tempSIPStorage = JSON.stringify(allSIPs)

    return NextResponse.json({
      success: true,
      message: "SIP cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling SIP:", error)
    return NextResponse.json({ success: false, error: "Failed to cancel SIP" }, { status: 500 })
  }
}