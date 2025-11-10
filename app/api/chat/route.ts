import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

interface ChatMessage {
  message: string
  userId?: string
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env["GEMINI_API-KEY"] || "")

export async function POST(request: NextRequest) {
  try {
    const body: ChatMessage = await request.json()
    const { message, userId = "user1" } = body

    // Process with Gemini AI
    const response = await processWithGeminiAI(message, userId)

    return NextResponse.json({
      success: true,
      data: {
        response,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error processing chat message:", error)
    return NextResponse.json({ success: false, error: "Failed to process message" }, { status: 500 })
  }
}

async function processWithGeminiAI(message: string, userId: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `You are Sphira AI Assistant, an expert DeFi platform assistant for the Sphira platform built on Stellar blockchain. 

CONTEXT: Sphira is a comprehensive DeFi platform that offers:
- SIP (Systematic Investment Plans) for crypto
- Yield optimization strategies
- Emergency vault for secure fund locking
- Portfolio management and analytics
- Built on Stellar network with Soroban smart contracts
- Ultra-low fees (~$0.00001 per transaction)
- Sub-second transaction finality

USER MESSAGE: "${message}"

INSTRUCTIONS:
- Be helpful, professional, and knowledgeable about DeFi
- Focus on Sphira platform features
- If user asks about specific commands, explain them clearly
- For general questions, provide informative DeFi/crypto advice
- Keep responses concise but informative
- Always relate back to how Sphira can help them
- Don't mention wallet connection requirements

AVAILABLE FEATURES:
- /startSIP - Create systematic investment plans (e.g., "/startSIP 10 XLM weekly")
- /portfolio - View portfolio analytics  
- /yield - Optimize yield strategies across Stellar pools
- /lockFunds - Secure emergency funds with multi-sig vault
- /balance - Check XLM and asset balances
- /history - Transaction history on Stellar network

Respond naturally and helpfully:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Gemini AI error:", error)
    // Fallback to basic responses if AI fails
    return processBasicCommand(message)
  }
}

function processBasicCommand(message: string): string {
  const command = message.toLowerCase().trim()

  if (command.includes("sip") || command.includes("investment")) {
    return "💰 Start your crypto SIP journey with Sphira! Create systematic investment plans to build wealth over time. Try '/startSIP 100 USDC weekly' to get started."
  }

  if (command.includes("portfolio") || command.includes("balance")) {
    return "📊 Track your DeFi portfolio with Sphira's advanced analytics. Monitor your investments, yields, and performance across the Stellar blockchain."
  }

  if (command.includes("yield") || command.includes("farming")) {
    return "⚡ Maximize your returns with Sphira's yield optimization! We find the best pools and strategies to grow your crypto assets."
  }

  if (command.includes("help")) {
    return `🚀 Welcome to Sphira AI Assistant! 

I can help you with:
• Creating SIPs (/startSIP)
• Portfolio tracking (/portfolio) 
• Yield optimization (/yield)
• Emergency funds (/lockFunds)
• Balance checking (/balance)
• Transaction history (/history)

Ask me anything about DeFi or use these commands!`
  }

  return "👋 Hi! I'm your Sphira AI Assistant. I can help you with DeFi investments, SIPs, yield farming, and portfolio management on Stellar blockchain. What would you like to know?"
}

