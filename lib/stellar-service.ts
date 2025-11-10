// Stellar Service - Real blockchain integration using Stellar SDK
import * as StellarSDK from '@stellar/stellar-sdk'
import { Server as SorobanServer, Api as SorobanApi, assembleTransaction } from '@stellar/stellar-sdk/rpc'
import { Horizon } from '@stellar/stellar-sdk'

const CONTRACT_ID = process.env.NEXT_PUBLIC_SIP_MANAGER_CONTRACT || process.env.NEXT_PUBLIC_CONTRACT_ID || 'CDBBFOFXMETCQ7PXZRXWBAXFPQMXEDFNJIVPRYCT2HWYG2NVSZMIHEXN'
const RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC || 'https://rpc-futurenet.stellar.org:443'
const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-futurenet.stellar.org'
const NETWORK_PASSPHRASE = StellarSDK.Networks.FUTURENET

class StellarService {
  private sorobanServer: SorobanServer
  private horizonServer: Horizon.Server

  constructor() {
    try {
      // Initialize Soroban RPC server for contracts
      this.sorobanServer = new SorobanServer(RPC_URL)
      // Initialize Horizon server for account data
      this.horizonServer = new Horizon.Server(HORIZON_URL)
      console.log('✅ Stellar Service initialized')
      console.log('📝 Contract:', CONTRACT_ID)
      console.log('🌐 RPC:', RPC_URL)
      console.log('🌐 Horizon:', HORIZON_URL)
    } catch (error) {
      console.error('❌ Failed to initialize Stellar Service:', error)
      throw error
    }
  }

  // Get user's SIPs from blockchain
  async getUserSIPs(userAddress: string): Promise<number[]> {
    console.log('📊 Getting SIPs for:', userAddress)
    try {
      const contract = new StellarSDK.Contract(CONTRACT_ID)
      
      // Create a dummy account for simulation
      const dummyAccount = new StellarSDK.Account(
        'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        '0'
      )
      
      const operation = contract.call(
        'get_user_sips',
        StellarSDK.nativeToScVal(userAddress, { type: 'address' })
      )

      const tx = new StellarSDK.TransactionBuilder(dummyAccount, {
        fee: '1000000',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build()

      const simulation = await this.sorobanServer.simulateTransaction(tx)
      
      if (simulation && 'result' in simulation && simulation.result) {
        const result = (simulation as any).result?.retval
        if (result) {
          const sipIds = StellarSDK.scValToNative(result)
          console.log('✅ Found SIPs:', sipIds)
          return Array.isArray(sipIds) ? sipIds : []
        }
      }
      
      console.log('⚠️ No SIPs found')
      return []
    } catch (error) {
      console.error('❌ Error getting SIPs:', error)
      return []
    }
  }

  // Get SIP details
  async getSIPDetails(sipId: number) {
    console.log('📋 Getting SIP details for:', sipId)
    try {
      const contract = new StellarSDK.Contract(CONTRACT_ID)
      
      // Create a dummy account for simulation (we don't need a real one for read-only calls)
      const dummyAccount = new StellarSDK.Account(
        'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        '0'
      )
      
      const operation = contract.call(
        'get_sip',
        StellarSDK.nativeToScVal(sipId, { type: 'u32' })
      )

      const tx = new StellarSDK.TransactionBuilder(dummyAccount, {
        fee: '1000000',
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build()

      const simulation = await this.sorobanServer.simulateTransaction(tx)
      
      if (simulation && 'result' in simulation && simulation.result) {
        const result = (simulation as any).result?.retval
        if (result) {
          const rawDetails = StellarSDK.scValToNative(result)
          console.log('✅ Raw SIP details:', rawDetails)
          
          // Parse the Soroban struct
          // Contract returns: Sip { user, token, amount, frequency, start_time, last_executed, total_deposits, execution_count, max_executions, status, penalty_bps }
          const details = {
            user: rawDetails.user,
            token: rawDetails.token,
            amount: Number(rawDetails.amount) / 10000000, // Convert from stroops to XLM
            frequency: rawDetails.frequency, // This is an enum
            start_time: Number(rawDetails.start_time),
            last_executed: Number(rawDetails.last_executed),
            total_deposits: Number(rawDetails.total_deposits) / 10000000,
            execution_count: rawDetails.execution_count,
            max_executions: rawDetails.max_executions,
            status: rawDetails.status, // This is an enum
            penalty_bps: rawDetails.penalty_bps
          }
          
          console.log('✅ Parsed SIP details:', details)
          return details
        }
      }
      
      return null
    } catch (error) {
      console.error('❌ Error getting SIP details:', error)
      return null
    }
  }

  // Get portfolio data
  async getPortfolioData(userAddress: string) {
    console.log('💼 Getting portfolio for:', userAddress)
    try {
      // Get real account balance
      const balanceData = await this.getAccountBalance(userAddress)
      
      // Get user's SIPs
      const sipIds = await this.getUserSIPs(userAddress)
      
      // Calculate total invested from SIPs
      let totalInvested = 0
      for (const sipId of sipIds) {
        const sipDetails = await this.getSIPDetails(sipId)
        if (sipDetails && sipDetails.amount) {
          totalInvested += parseFloat(sipDetails.amount) || 0
        }
      }
      
      const totalValue = balanceData.xlm
      // Only calculate return if there are investments
      const totalReturn = totalInvested > 0 ? (totalValue - totalInvested) : 0
      const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0
      
      console.log('✅ Portfolio data:', {
        totalValue,
        totalInvested,
        totalReturn,
        activeSIPs: sipIds.length
      })
      
      return {
        totalValue,
        totalInvested,
        totalReturn,
        returnPercentage,
        activeSIPs: sipIds.length,
        totalLocked: 0,
        breakdown: {
          sips: totalInvested,
          yield: totalReturn,
          locked: 0
        }
      }
    } catch (error) {
      console.error('❌ Error getting portfolio:', error)
      return {
        totalValue: 0,
        totalInvested: 0,
        totalReturn: 0,
        returnPercentage: 0,
        activeSIPs: 0,
        totalLocked: 0,
        breakdown: {
          sips: 0,
          yield: 0,
          locked: 0
        }
      }
    }
  }

  // Get account balance
  async getAccountBalance(address: string) {
    console.log('💰 Getting balance for:', address)
    try {
      const account = await this.horizonServer.loadAccount(address)
      const balances = account.balances.map((balance: any) => {
        if (balance.asset_type === 'native') {
          return {
            asset: 'XLM',
            balance: balance.balance
          }
        }
        return {
          asset: `${balance.asset_code}:${balance.asset_issuer}`,
          balance: balance.balance
        }
      })
      
      const xlmBalance = balances.find((b: any) => b.asset === 'XLM')
      
      console.log('✅ Account balances:', balances)
      return {
        xlm: xlmBalance ? parseFloat(xlmBalance.balance) : 0,
        balances
      }
    } catch (error) {
      console.error('❌ Error getting balance:', error)
      return {
        xlm: 0,
        balances: []
      }
    }
  }

  // Build transaction for creating SIP
  async buildCreateSIPTransaction(userAddress: string, sipData: any): Promise<string> {
    console.log('🔨 Building SIP transaction for:', userAddress, sipData)
    try {
      const account = await this.horizonServer.loadAccount(userAddress)
      const contract = new StellarSDK.Contract(CONTRACT_ID)
      
      // Convert addresses using nativeToScVal
      const userAddrScVal = StellarSDK.nativeToScVal(userAddress, { type: 'address' })
      const tokenAddrScVal = StellarSDK.nativeToScVal(userAddress, { type: 'address' }) // Using user address as token placeholder
      
      // Map frequency to enum index (0=Daily, 1=Weekly, 2=Monthly)
      const frequencyMap: any = {
        'daily': 0,
        'weekly': 1, 
        'monthly': 2
      }
      const freqIndex = frequencyMap[sipData.frequency.toLowerCase()] ?? 2
      
      // Amount in stroops (1 XLM = 10,000,000 stroops)
      const amountStroops = BigInt(Math.floor(parseFloat(sipData.amount) * 10000000))
      
      // Build enum ScVal manually - Soroban simple enums are Vec with single u32 discriminant
      const frequencyScVal = StellarSDK.xdr.ScVal.scvVec([
        StellarSDK.xdr.ScVal.scvSymbol(
          ['Daily', 'Weekly', 'Monthly'][freqIndex]
        )
      ])
      
      // Convert SIP data to ScVals matching contract signature:
      // create_sip(user: Address, token: Address, amount: u64, frequency: Frequency, max_executions: u32, penalty_bps: u32)
      const operation = contract.call(
        'create_sip',
        userAddrScVal,
        tokenAddrScVal,
        StellarSDK.nativeToScVal(amountStroops, { type: 'u64' }),
        frequencyScVal,
        StellarSDK.nativeToScVal(parseInt(sipData.duration) || 12, { type: 'u32' }),
        StellarSDK.nativeToScVal(Math.floor(parseFloat(sipData.penalty) * 100), { type: 'u32' })
      )

      let tx = new StellarSDK.TransactionBuilder(account, {
        fee: '100000', // Base fee, will be updated after simulation
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(operation)
        .setTimeout(300)
        .build()

      // Simulate to get proper resource fees
      console.log('🔄 Simulating transaction...')
      const simulation = await this.sorobanServer.simulateTransaction(tx)
      
      if (SorobanApi.isSimulationSuccess(simulation)) {
        // Assemble the transaction with simulation results
        tx = assembleTransaction(tx, simulation).build()
        console.log('✅ Transaction built and simulated successfully')
        return tx.toXDR()
      } else {
        console.error('❌ Simulation failed:', simulation)
        throw new Error('Transaction simulation failed')
      }
    } catch (error) {
      console.error('❌ Error building transaction:', error)
      throw error
    }
  }

  // Submit signed transaction
  async submitTransaction(signedXDR: string) {
    console.log('📤 Submitting transaction')
    try {
      const tx = StellarSDK.TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE)
      const response = await this.sorobanServer.sendTransaction(tx as any)
      
      console.log('✅ Transaction submitted:', response)
      
      // Log detailed error if status is ERROR
      if (response.status === 'ERROR') {
        console.error('❌ TRANSACTION ERROR DETAILS:')
        console.error('Error Result:', JSON.stringify(response.errorResult, null, 2))
        if (response.errorResult) {
          try {
            const errorXdr = response.errorResult as any
            console.error('Error XDR:', errorXdr)
          } catch (e) {
            console.error('Could not parse error')
          }
        }
      }
      
      if (response.status === 'PENDING') {
        // Wait for transaction to be confirmed
        let getResponse = await this.sorobanServer.getTransaction(response.hash)
        let attempts = 0
        
        while (getResponse.status === 'NOT_FOUND' && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          getResponse = await this.sorobanServer.getTransaction(response.hash)
          attempts++
        }
        
        if (getResponse.status === 'SUCCESS') {
          console.log('✅ Transaction confirmed!')
          return {
            success: true,
            hash: response.hash,
            result: getResponse
          }
        }
      }
      
      return {
        success: false,
        error: 'Transaction failed or timed out'
      }
    } catch (error: any) {
      console.error('❌ Error submitting transaction:', error)
      return {
        success: false,
        error: error.message || 'Transaction submission failed'
      }
    }
  }
}

export const stellarService = new StellarService()
