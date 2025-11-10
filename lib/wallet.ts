"use client"

// Wallet integration utilities for Stellar blockchain
export interface WalletProvider {
  isMetaMask?: boolean
  isWalletConnect?: boolean
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on: (event: string, handler: (...args: any[]) => void) => void
  removeListener: (event: string, handler: (...args: any[]) => void) => void
}

export interface WalletState {
  isConnected: boolean
  address?: string
  chainId?: number
  balance?: Record<string, string>
}

export class WalletManager {
  private provider: WalletProvider | null = null
  private state: WalletState = { isConnected: false }
  private listeners: Array<(state: WalletState) => void> = []

  // Stellar network configuration
  private StellarConfig = {
    chainId: "0xa58", // 2648 in hex
    chainName: "Stellar Mainnet",
    nativeCurrency: {
      name: "XLM",
      symbol: "XLM",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.Stellar.network"],
    blockExplorerUrls: ["https://explorer.Stellar.network"],
  }

  async connectWallet(): Promise<WalletState> {
    try {
      // Check if MetaMask is available
      if (typeof window !== "undefined" && (window as any).ethereum) {
        this.provider = (window as any).ethereum as WalletProvider

        // Request account access
        const accounts = await this.provider.request({
          method: "eth_requestAccounts",
        })

        if (accounts.length > 0) {
          const address = accounts[0]
          const chainId = await this.provider.request({ method: "eth_chainId" })

          // Switch to Stellar network if not already connected
          if (chainId !== this.StellarConfig.chainId) {
            await this.switchToStellar()
          }

          // Get balance
          const balance = await this.getBalance(address)

          this.state = {
            isConnected: true,
            address,
            chainId: Number.parseInt(chainId, 16),
            balance,
          }

          // Set up event listeners
          this.setupEventListeners()

          this.notifyListeners()
          return this.state
        }
      }

      throw new Error("No wallet provider found")
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    }
  }

  async switchToStellar(): Promise<void> {
    if (!this.provider) throw new Error("No wallet provider")

    try {
      await this.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: this.StellarConfig.chainId }],
      })
    } catch (switchError: any) {
      // If the chain doesn't exist, add it
      if (switchError.code === 4902) {
        await this.provider.request({
          method: "wallet_addEthereumChain",
          params: [this.StellarConfig],
        })
      } else {
        throw switchError
      }
    }
  }

  async getBalance(address: string): Promise<Record<string, string>> {
    if (!this.provider) throw new Error("No wallet provider")

    try {
      // Get native XLM balance
      const somBalance = await this.provider.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })

      // Convert from wei to XLM
      const somBalanceFormatted = (Number.parseInt(somBalance, 16) / 1e18).toFixed(2)

      // Get real token balances from contracts
      const tokenBalances: Record<string, string> = {
        XLM: somBalanceFormatted
      }

      // Token contract ABI for balance checking
      const ERC20_ABI = ["function balanceOf(address owner) view returns (uint256)"]
      
      // Get USDC balance
      try {
        const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS || "0xA0b86a33E6441e6e80D0c4C6C7527d72e1d00000"
        const usdcBalance = await this.provider.request({
          method: "eth_call",
          params: [{
            to: usdcAddress,
            data: "0x70a08231000000000000000000000000" + address.slice(2)
          }, "latest"]
        })
        tokenBalances.USDC = (Number.parseInt(usdcBalance, 16) / 1e6).toFixed(2) // USDC has 6 decimals
      } catch (error) {
        console.log("USDC balance not available")
        tokenBalances.USDC = "0.00"
      }

      // Get ETH balance (if different from XLM)
      try {
        const ethAddress = process.env.NEXT_PUBLIC_ETH_ADDRESS
        if (ethAddress && ethAddress !== "0x0000000000000000000000000000000000000000") {
          const ethBalance = await this.provider.request({
            method: "eth_call",
            params: [{
              to: ethAddress,
              data: "0x70a08231000000000000000000000000" + address.slice(2)
            }, "latest"]
          })
          tokenBalances.ETH = (Number.parseInt(ethBalance, 16) / 1e18).toFixed(4)
        } else {
          tokenBalances.ETH = somBalanceFormatted // Use XLM balance as ETH if no separate ETH token
        }
      } catch (error) {
        console.log("ETH balance not available")
        tokenBalances.ETH = "0.0000"
      }

      return tokenBalances
    } catch (error) {
      console.error("Failed to get balance:", error)
      return {}
    }
  }

  async sendTransaction(to: string, value: string, data?: string): Promise<string> {
    if (!this.provider || !this.state.address) {
      throw new Error("Wallet not connected")
    }

    try {
      const txHash = await this.provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: this.state.address,
            to,
            value: `0x${Number.parseInt(value).toString(16)}`,
            data: data || "0x",
          },
        ],
      })

      return txHash
    } catch (error) {
      console.error("Transaction failed:", error)
      throw error
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider || !this.state.address) {
      throw new Error("Wallet not connected")
    }

    try {
      const signature = await this.provider.request({
        method: "personal_sign",
        params: [message, this.state.address],
      })

      return signature
    } catch (error) {
      console.error("Message signing failed:", error)
      throw error
    }
  }

  disconnect(): void {
    this.provider = null
    this.state = { isConnected: false }
    this.notifyListeners()
  }

  getState(): WalletState {
    return this.state
  }

  onStateChange(listener: (state: WalletState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private setupEventListeners(): void {
    if (!this.provider) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect()
      } else {
        this.state.address = accounts[0]
        this.notifyListeners()
      }
    }

    const handleChainChanged = (chainId: string) => {
      this.state.chainId = Number.parseInt(chainId, 16)
      this.notifyListeners()
    }

    this.provider.on("accountsChanged", handleAccountsChanged)
    this.provider.on("chainChanged", handleChainChanged)
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state))
  }
}

// Singleton instance
export const walletManager = new WalletManager()

// Contract ABIs (simplified for production)
const SIP_MANAGER_ABI = [
  "function createSIP(address token, uint256 amount, uint8 frequency, uint256 maxExecutions, uint256 penalty) external returns (uint256)",
  "function executeSIP(uint256 sipId) external returns (bool)",
  "function getSIP(uint256 sipId) external view returns (tuple(address user, address token, uint256 amount, uint8 frequency, uint8 status, uint256 totalDeposits, uint256 executionCount))",
  "function getUserSIPs(address user) external view returns (uint256[])",
  "function pauseSIP(uint256 sipId) external",
  "function cancelSIP(uint256 sipId) external"
]

const YIELD_ROUTER_ABI = [
  "function deposit(address token, uint256 amount, uint8 maxRiskScore) external returns (bool)",
  "function rebalance(address token, uint8 maxRiskScore) external returns (bool)",
  "function getOptimalPools(address token, uint8 maxRiskScore) external view returns (address[])",
  "function getUserYield(address user, address token) external view returns (uint256)"
]

const LOCK_VAULT_ABI = [
  "function lockFunds(address token, uint256 amount, uint256 duration, string memory reason) external returns (uint256)",
  "function withdrawFunds(uint256 lockId) external returns (bool)",
  "function getLock(uint256 lockId) external view returns (tuple(address user, address token, uint256 amount, uint256 unlockTime, uint8 status))",
  "function getUserLocks(address user) external view returns (uint256[])"
]

// Contract addresses from environment
const CONTRACT_ADDRESSES = {
  SIP_MANAGER: process.env.NEXT_PUBLIC_SIP_MANAGER_ADDRESS || "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
  YIELD_ROUTER: process.env.NEXT_PUBLIC_YIELD_ROUTER_ADDRESS || "0x8ba1f109551bD432803012645ac136c22C177e9D",
  LOCK_VAULT: process.env.NEXT_PUBLIC_LOCK_VAULT_ADDRESS || "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
}

// Contract interaction utilities
export const contractUtils = {
  // SIP Manager contract interactions
  async createSIP(
    token: string,
    amount: string,
    frequency: number,
    maxExecutions: number,
    penalty: number,
  ): Promise<string> {
    if (!walletManager.getState().isConnected) {
      throw new Error("Wallet not connected")
    }

    try {
      const provider = (window as any).ethereum
      const Web3 = (await import('web3')).default
      const web3 = new Web3(provider)
      
      const contract = new web3.eth.Contract(SIP_MANAGER_ABI as any, CONTRACT_ADDRESSES.SIP_MANAGER)
      const accounts = await web3.eth.getAccounts()
      
      const tx = await contract.methods.createSIP(
        token,
        web3.utils.toWei(amount, 'ether'),
        frequency,
        maxExecutions,
        penalty
      ).send({ from: accounts[0] })
      
      return tx.transactionHash
    } catch (error) {
      console.error("Failed to create SIP:", error)
      throw error
    }
  },

  async executeSIP(sipId: number): Promise<string> {
    if (!walletManager.getState().isConnected) {
      throw new Error("Wallet not connected")
    }

    try {
      const provider = (window as any).ethereum
      const Web3 = (await import('web3')).default
      const web3 = new Web3(provider)
      
      const contract = new web3.eth.Contract(SIP_MANAGER_ABI as any, CONTRACT_ADDRESSES.SIP_MANAGER)
      const accounts = await web3.eth.getAccounts()
      
      const tx = await contract.methods.executeSIP(sipId).send({ from: accounts[0] })
      return tx.transactionHash
    } catch (error) {
      console.error("Failed to execute SIP:", error)
      throw error
    }
  },

  async getUserSIPs(userAddress: string): Promise<any[]> {
    try {
      const provider = (window as any).ethereum
      const Web3 = (await import('web3')).default
      const web3 = new Web3(provider)
      
      const contract = new web3.eth.Contract(SIP_MANAGER_ABI as any, CONTRACT_ADDRESSES.SIP_MANAGER)
      const sipIds = await contract.methods.getUserSIPs(userAddress).call()
      
      // Type guard to ensure sipIds is an array
      if (!Array.isArray(sipIds) || sipIds.length === 0) {
        return []
      }
      
      const sips = await Promise.all(
        sipIds.map(async (id: any) => {
          const sipResult = await contract.methods.getSIP(id).call()
          // Type guard to ensure sip is an object with required properties
          if (!sipResult || typeof sipResult !== 'object') {
            return null
          }
          const sip = sipResult as any
          return {
            id: id,
            user: sip.user || '',
            token: sip.token || '',
            amount: sip.amount ? web3.utils.fromWei(sip.amount, 'ether') : '0',
            frequency: sip.frequency || 0,
            status: sip.status || 0,
            totalDeposits: sip.totalDeposits ? web3.utils.fromWei(sip.totalDeposits, 'ether') : '0',
            executionCount: sip.executionCount || 0
          }
        })
      ).then(results => results.filter(sip => sip !== null))
      
      return sips
    } catch (error) {
      console.error("Failed to get user SIPs:", error)
      return []
    }
  },

  // Yield Router contract interactions
  async deposit(token: string, amount: string, maxRiskScore: number): Promise<string> {
    if (!walletManager.getState().isConnected) {
      throw new Error("Wallet not connected")
    }

    try {
      const provider = (window as any).ethereum
      const Web3 = (await import('web3')).default
      const web3 = new Web3(provider)
      
      const contract = new web3.eth.Contract(YIELD_ROUTER_ABI as any, CONTRACT_ADDRESSES.YIELD_ROUTER)
      const accounts = await web3.eth.getAccounts()
      
      const tx = await contract.methods.deposit(
        token,
        web3.utils.toWei(amount, 'ether'),
        maxRiskScore
      ).send({ from: accounts[0] })
      
      return tx.transactionHash
    } catch (error) {
      console.error("Failed to deposit:", error)
      throw error
    }
  },

  async rebalance(token: string, maxRiskScore: number): Promise<string> {
    if (!walletManager.getState().isConnected) {
      throw new Error("Wallet not connected")
    }

    try {
      const provider = (window as any).ethereum
      const Web3 = (await import('web3')).default
      const web3 = new Web3(provider)
      
      const contract = new web3.eth.Contract(YIELD_ROUTER_ABI as any, CONTRACT_ADDRESSES.YIELD_ROUTER)
      const accounts = await web3.eth.getAccounts()
      
      const tx = await contract.methods.rebalance(token, maxRiskScore).send({ from: accounts[0] })
      return tx.transactionHash
    } catch (error) {
      console.error("Failed to rebalance:", error)
      throw error
    }
  },

  // Lock Vault contract interactions
  async lockFunds(token: string, amount: string, duration: number, reason: string): Promise<string> {
    if (!walletManager.getState().isConnected) {
      throw new Error("Wallet not connected")
    }

    try {
      const provider = (window as any).ethereum
      const Web3 = (await import('web3')).default
      const web3 = new Web3(provider)
      
      const contract = new web3.eth.Contract(LOCK_VAULT_ABI as any, CONTRACT_ADDRESSES.LOCK_VAULT)
      const accounts = await web3.eth.getAccounts()
      
      const tx = await contract.methods.lockFunds(
        token,
        web3.utils.toWei(amount, 'ether'),
        duration,
        reason
      ).send({ from: accounts[0] })
      
      return tx.transactionHash
    } catch (error) {
      console.error("Failed to lock funds:", error)
      throw error
    }
  },

  async withdrawFunds(lockId: number): Promise<string> {
    if (!walletManager.getState().isConnected) {
      throw new Error("Wallet not connected")
    }

    try {
      const provider = (window as any).ethereum
      const Web3 = (await import('web3')).default
      const web3 = new Web3(provider)
      
      const contract = new web3.eth.Contract(LOCK_VAULT_ABI as any, CONTRACT_ADDRESSES.LOCK_VAULT)
      const accounts = await web3.eth.getAccounts()
      
      const tx = await contract.methods.withdrawFunds(lockId).send({ from: accounts[0] })
      return tx.transactionHash
    } catch (error) {
      console.error("Failed to withdraw funds:", error)
      throw error
    }
  },

  async getUserLocks(userAddress: string): Promise<any[]> {
    try {
      const provider = (window as any).ethereum
      const Web3 = (await import('web3')).default
      const web3 = new Web3(provider)
      
      const contract = new web3.eth.Contract(LOCK_VAULT_ABI as any, CONTRACT_ADDRESSES.LOCK_VAULT)
      const lockIds = await contract.methods.getUserLocks(userAddress).call()
      
      // Type guard to ensure lockIds is an array
      if (!Array.isArray(lockIds) || lockIds.length === 0) {
        return []
      }
      
      const locks = await Promise.all(
        lockIds.map(async (id: any) => {
          const lockResult = await contract.methods.getLock(id).call()
          // Type guard to ensure lock is an object with required properties
          if (!lockResult || typeof lockResult !== 'object') {
            return null
          }
          const lock = lockResult as any
          return {
            id: id,
            user: lock.user || '',
            token: lock.token || '',
            amount: lock.amount ? web3.utils.fromWei(lock.amount, 'ether') : '0',
            unlockTime: lock.unlockTime || 0,
            status: lock.status || 0
          }
        })
      ).then(results => results.filter(lock => lock !== null))
      
      return locks
    } catch (error) {
      console.error("Failed to get user locks:", error)
      return []
    }
  }
}

