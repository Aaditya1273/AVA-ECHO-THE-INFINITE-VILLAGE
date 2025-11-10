#!/bin/bash

echo "🚀 Deploying Sphira to Stellar Futurenet..."

# Check if soroban CLI is installed
if ! command -v soroban &> /dev/null; then
    echo "❌ Soroban CLI not found. Install with: cargo install --locked soroban-cli"
    exit 1
fi

# Set network
NETWORK="futurenet"
WASM_PATH="target/wasm32-unknown-unknown/release/sphira_stellar_contracts_optimized.wasm"

# Check if WASM exists
if [ ! -f "$WASM_PATH" ]; then
    echo "⚠️  Optimized WASM not found. Building first..."
    ./build.sh
fi

echo "📦 Deploying contracts to Futurenet..."

# Deploy SIPManager
echo "Deploying SIPManager..."
SIP_MANAGER_ID=$(soroban contract deploy \
    --wasm $WASM_PATH \
    --source-account default \
    --network $NETWORK)

echo "✅ SIPManager deployed: $SIP_MANAGER_ID"

# Deploy YieldRouter
echo "Deploying YieldRouter..."
YIELD_ROUTER_ID=$(soroban contract deploy \
    --wasm $WASM_PATH \
    --source-account default \
    --network $NETWORK)

echo "✅ YieldRouter deployed: $YIELD_ROUTER_ID"

# Deploy LockVault
echo "Deploying LockVault..."
LOCK_VAULT_ID=$(soroban contract deploy \
    --wasm $WASM_PATH \
    --source-account default \
    --network $NETWORK)

echo "✅ LockVault deployed: $LOCK_VAULT_ID"

# Save contract IDs
cat > deployed-contracts.json << EOF
{
  "network": "futurenet",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "contracts": {
    "sipManager": "$SIP_MANAGER_ID",
    "yieldRouter": "$YIELD_ROUTER_ID",
    "lockVault": "$LOCK_VAULT_ID"
  }
}
EOF

echo ""
echo "🎉 All contracts deployed successfully!"
echo "📄 Contract IDs saved to deployed-contracts.json"
echo ""
echo "Contract Addresses:"
echo "  SIPManager:  $SIP_MANAGER_ID"
echo "  YieldRouter: $YIELD_ROUTER_ID"
echo "  LockVault:   $LOCK_VAULT_ID"
