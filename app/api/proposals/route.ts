import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, title, description, type } = body

    if (!userAddress || !title || !description) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get existing proposals from temporary storage
    const allProposals = JSON.parse((global as any).tempProposalStorage || '[]')
    
    // Create new proposal
    const newProposal = {
      id: allProposals.length + 1,
      userAddress,
      title,
      description,
      type,
      status: 'ACTIVE',
      votesFor: 0,
      votesAgainst: 0,
      requiredVotes: 3, // 3 of 5 multi-sig
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      blockchain_tx_hash: `0x${Math.random().toString(16).substr(2, 40)}` // Simulate tx hash
    }

    // Add to storage
    allProposals.push(newProposal)
    ;(global as any).tempProposalStorage = JSON.stringify(allProposals)

    return NextResponse.json({
      success: true,
      data: newProposal,
      message: "Proposal created successfully"
    })
  } catch (error) {
    console.error("Error creating proposal:", error)
    return NextResponse.json({ success: false, error: "Failed to create proposal" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')

    // Get all proposals
    const allProposals = JSON.parse((global as any).tempProposalStorage || '[]')
    
    // Filter by user if specified
    const proposals = userAddress 
      ? allProposals.filter((p: any) => p.userAddress.toLowerCase() === userAddress.toLowerCase())
      : allProposals

    return NextResponse.json({
      success: true,
      data: proposals
    })
  } catch (error) {
    console.error("Error fetching proposals:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch proposals" }, { status: 500 })
  }
}