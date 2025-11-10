# Sphira Stellar Smart Contracts

Rust/Soroban smart contracts for the Sphira DeFi platform on Stellar.

## 📦 Contracts

### SIPManager
Manages Systematic Investment Plans (SIPs) with automated scheduling.

**Key Functions:**
- `create_sip()` - Create new SIP
- `execute_sip()` - Execute scheduled deposit
- `pause_sip()` / `resume_sip()` - Control SIP state
- `cancel_sip()` - Cancel SIP
- `early_withdrawal()` - Withdraw with penalty

### YieldRouter
AI-powered yield optimization across Stellar DeFi pools.

**Key Functions:**
- `register_pool()` - Add new yield pool
- `deposit()` - Smart fund allocation
- `rebalance()` - Optimize portfolio
- `harvest_yield()` - Collect earnings
- `get_optimal_pools()` - Find best opportunities

### LockVault
Emergency fund protection with multi-sig governance.

**Key Functions:**
- `lock_funds()` - Secure emergency funds
- `withdraw_funds()` - Time-based unlock
- `create_emergency_proposal()` - Request early unlock
- `approve_emergency()` - Governor approval
- `execute_emergency_unlock()` - Multi-sig release (3/5)

## 🛠️ Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install Soroban CLI
cargo install --locked soroban-cli

# Configure Stellar network
soroban network add \
  --global futurenet \
  --rpc-url https://rpc-futurenet.stellar.org:443 \
  --network-passphrase "Test SDF Future Network ; October 2022"

# Create identity
soroban keys generate --global default --network futurenet
```

## 🚀 Quick Start

### Build Contracts

**Windows (PowerShell):**
```powershell
.\build.ps1
```

**Linux/Mac:**
```bash
chmod +x build.sh
./build.sh
```

### Test Contracts

```bash
cargo test
```

### Deploy to Futurenet

**Windows (PowerShell):**
```powershell
.\deploy-futurenet.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy-futurenet.sh
./deploy-futurenet.sh
```

Contract IDs will be saved to `deployed-contracts.json`.

## 📝 Usage Examples

### Create a SIP

```bash
soroban contract invoke \
  --id <SIP_MANAGER_CONTRACT_ID> \
  --source-account default \
  --network futurenet \
  -- create_sip \
  --user <USER_ADDRESS> \
  --token <TOKEN_ADDRESS> \
  --amount 100 \
  --frequency Weekly \
  --max_executions 12 \
  --penalty_bps 500
```

### Register Yield Pool

```bash
soroban contract invoke \
  --id <YIELD_ROUTER_CONTRACT_ID> \
  --source-account default \
  --network futurenet \
  -- register_pool \
  --admin <ADMIN_ADDRESS> \
  --pool_address <POOL_ADDRESS> \
  --initial_apy 1500 \
  --risk_score 5 \
  --max_capacity 1000000
```

### Lock Emergency Funds

```bash
soroban contract invoke \
  --id <LOCK_VAULT_CONTRACT_ID> \
  --source-account default \
  --network futurenet \
  -- lock_funds \
  --user <USER_ADDRESS> \
  --amount 1000 \
  --unlock_time <TIMESTAMP> \
  --reason EMERGENCY
```

## 🧪 Testing

Run all tests:
```bash
cargo test
```

Run specific test:
```bash
cargo test test_create_sip
```

With output:
```bash
cargo test -- --nocapture
```

## 📊 Contract Events

All contracts emit events for off-chain monitoring:

**SIPManager Events:**
- `SIP_NEW` - New SIP created
- `SIP_EXEC` - SIP executed
- `SIP_PAUS` - SIP paused
- `SIP_RESM` - SIP resumed
- `SIP_CANC` - SIP cancelled
- `SIP_WDRW` - Early withdrawal

**YieldRouter Events:**
- `POOL_REG` - Pool registered
- `DEPOSIT` - Funds deposited
- `REBAL` - Portfolio rebalanced
- `HARVEST` - Yield harvested
- `APY_UPD` - APY updated

**LockVault Events:**
- `LOCK_NEW` - Funds locked
- `WITHDRAW` - Funds withdrawn
- `PROP_NEW` - Emergency proposal created
- `PROP_APP` - Proposal approved
- `EMERG_UNL` - Emergency unlock executed

## 🔐 Security

- All contracts use Soroban SDK security best practices
- Multi-sig governance for emergency operations
- Time-locks for fund protection
- Comprehensive input validation
- Event logging for transparency

## 📄 License

MIT License - see LICENSE file for details
