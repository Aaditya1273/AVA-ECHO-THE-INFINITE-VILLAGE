import { type NextRequest, NextResponse } from "next/server"
import { stellarService } from "@/lib/stellar-service"

// Fallback pool data for when blockchain is not available
const FALLBACK_POOLS = [
  {
    id: 1,
    name: "Stellar-USDC Liquidity Pool",
    protocol: "StellarSwap",
    apy: 12.8,
    tvl: 2450000,
    riskScore: 3,
    verified: true,
    tokens: ["XLM", "USDC"],
    contractAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS || "0xA0b86a33E6441e6e80D0c4C6C7527d72e1d00000",
  },
  {
    id: 2,
    name: "USDC Lending Pool",
    protocol: "StellarLend",
    apy: 8.5,
    tvl: 5200000,
    riskScore: 2,
    verified: true,
    tokens: ["USDC"],
    contractAddress: "0x2345678901234567890123456789012345678901",
  },
  {
    id: 3,
    name: "ETH Staking Pool",
    protocol: "StellarStake",
    apy: 9.2,
    tvl: 1800000,
    riskScore: 4,
    verified: true,
    tokens: ["ETH"],
    contractAddress: process.env.NEXT_PUBLIC_ETH_ADDRESS || "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  {
    id: 4,
    name: "XLM Native Staking",
    protocol: "Stellar Network",
    apy: 15.5,
    tvl: 8900000,
    riskScore: 1,
    verified: true,
    tokens: ["XLM"],
    contractAddress: process.env.NEXT_PUBLIC_SOM_ADDRESS || "0x1234567890123456789012345678901234567890",
  }
]



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get("userAddress")
    const token = searchParams.get("token")
    const minApy = Number.parseFloat(searchParams.get("minApy") || "0")
    const maxRisk = Number.parseInt(searchParams.get("maxRisk") || "10")
    const sortBy = searchParams.get("sortBy") || "apy"

    // Get user balance
    let balance = "0.00"
    let totalYield = "0.00"
    if (userAddress) {
      try {
        const balanceData = await stellarService.getAccountBalance(userAddress)
        balance = balanceData.xlm.toFixed(2)
      } catch (error) {
        console.error("Error getting balance:", error)
      }
    }

    let pools = []

    try {
      // Try to get real data from blockchain
      // TODO: Implement getYieldPools in stellar-service
      pools = FALLBACK_POOLS
    } catch (error) {
      console.log("Blockchain not available, using fallback data")
      pools = FALLBACK_POOLS
    }

    // If no pools from blockchain, use fallback
    if (pools.length === 0) {
      pools = FALLBACK_POOLS
    }

    // Apply filters
    let filteredPools = [...pools]

    // Filter by token
    if (token) {
      filteredPools = filteredPools.filter((pool: any) =>
        pool.tokens.some((t: string) => t.toUpperCase() === token.toUpperCase())
      )
    }

    // Filter by minimum APY
    if (minApy > 0) {
      filteredPools = filteredPools.filter((pool: any) => pool.apy >= minApy)
    }

    // Filter by maximum risk score
    if (maxRisk < 10) {
      filteredPools = filteredPools.filter((pool: any) => pool.riskScore <= maxRisk)
    }

    // Sort pools
    filteredPools.sort((a: any, b: any) => {
      switch (sortBy) {
        case "apy":
          return b.apy - a.apy
        case "tvl":
          return b.tvl - a.tvl
        case "risk":
          return a.riskScore - b.riskScore
        default:
          return b.apy - a.apy
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        pools: filteredPools,
        balance,
        totalYield
      },
      total: filteredPools.length,
      filters: {
        token,
        minApy,
        maxRisk,
        sortBy,
      },
    })
  } catch (error) {
    console.error("Error fetching yield pools:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch yield pools" }, { status: 500 })
  }
}


