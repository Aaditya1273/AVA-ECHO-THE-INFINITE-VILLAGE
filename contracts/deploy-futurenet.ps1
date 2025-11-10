Write-Host "🚀 Deploying Sphira to Stellar Futurenet..." -ForegroundColor Cyan

# Check if soroban CLI is installed
$sorobanExists = Get-Command soroban -ErrorAction SilentlyContinue
if (-not $sorobanExists) {
    Write-Host "❌ Soroban CLI not found. Install with: cargo install --locked soroban-cli" -ForegroundColor Red
    exit 1
}

# Set network
$NETWORK = "futurenet"
$WASM_PATH = "target/wasm32-unknown-unknown/release/sphira_stellar_contracts_optimized.wasm"

# Check if WASM exists
if (-not (Test-Path $WASM_PATH)) {
    Write-Host "⚠️  Optimized WASM not found. Building first..." -ForegroundColor Yellow
    .\build.ps1
}

Write-Host "📦 Deploying contracts to Futurenet..." -ForegroundColor Yellow

# Deploy SIPManager
Write-Host "Deploying SIPManager..." -ForegroundColor Cyan
$SIP_MANAGER_ID = soroban contract deploy `
    --wasm $WASM_PATH `
    --source-account default `
    --network $NETWORK

Write-Host "✅ SIPManager deployed: $SIP_MANAGER_ID" -ForegroundColor Green

# Deploy YieldRouter
Write-Host "Deploying YieldRouter..." -ForegroundColor Cyan
$YIELD_ROUTER_ID = soroban contract deploy `
    --wasm $WASM_PATH `
    --source-account default `
    --network $NETWORK

Write-Host "✅ YieldRouter deployed: $YIELD_ROUTER_ID" -ForegroundColor Green

# Deploy LockVault
Write-Host "Deploying LockVault..." -ForegroundColor Cyan
$LOCK_VAULT_ID = soroban contract deploy `
    --wasm $WASM_PATH `
    --source-account default `
    --network $NETWORK

Write-Host "✅ LockVault deployed: $LOCK_VAULT_ID" -ForegroundColor Green

# Save contract IDs
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$contractData = @{
    network = "futurenet"
    timestamp = $timestamp
    contracts = @{
        sipManager = $SIP_MANAGER_ID
        yieldRouter = $YIELD_ROUTER_ID
        lockVault = $LOCK_VAULT_ID
    }
} | ConvertTo-Json -Depth 10

$contractData | Out-File -FilePath "deployed-contracts.json" -Encoding UTF8

Write-Host ""
Write-Host "🎉 All contracts deployed successfully!" -ForegroundColor Green
Write-Host "📄 Contract IDs saved to deployed-contracts.json" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contract Addresses:" -ForegroundColor Yellow
Write-Host "  SIPManager:  $SIP_MANAGER_ID" -ForegroundColor White
Write-Host "  YieldRouter: $YIELD_ROUTER_ID" -ForegroundColor White
Write-Host "  LockVault:   $LOCK_VAULT_ID" -ForegroundColor White
