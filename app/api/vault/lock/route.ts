import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, token, amount, duration } = body

    // Validate required fields
    if (!userAddress || !token || !amount || !duration) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get token address
    const getTokenAddress = (symbol: string): string => {
      const addressMap: { [key: string]: string } = {
        'USDC': process.env.NEXT_PUBLIC_USDC_ADDRESS || '0xA0b86a33E6441e6e80D0c4C6C7527d72e1d00000',
        'ETH': process.env.NEXT_PUBLIC_ETH_ADDRESS || '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        'XLM': process.env.NEXT_PUBLIC_SOM_ADDRESS || '0x1234567890123456789012345678901234567890'
      }
      return addressMap[symbol.toUpperCase()] || addressMap['USDC']
    }

    // Calculate duration in seconds
    const durationInSeconds = parseInt(duration) * 24 * 60 * 60 // days to seconds

    // Return transaction data for frontend to execute
    const transactionData = {
      contractAddress: process.env.NEXT_PUBLIC_LOCK_VAULT_ADDRESS,
      method: 'lockFunds',
      params: {
        token: getTokenAddress(token),
        amount: amount,
        duration: durationInSeconds,
        reason: `Emergency fund lock for ${duration} days`
      }
    }

    return NextResponse.json({
      success: true,
      data: transactionData,
      message: "Lock transaction prepared. Execute via wallet.",
    })
  } catch (error) {
    console.error("Error preparing lock transaction:", error)
    return NextResponse.json({ success: false, error: "Failed to prepare lock transaction" }, { status: 500 })
  }
}
