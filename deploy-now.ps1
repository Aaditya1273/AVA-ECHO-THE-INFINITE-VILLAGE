# Quick Deploy Script for Sphira Stellar Contracts
Write-Host "🚀 Deploying Sphira to Stellar Futurenet..." -ForegroundColor Cyan

# Check if build exists
$wasmPath = "contracts/target/wasm32-unknown-unknown/release/sphira_stellar_contracts.wasm"

if (-not (Test-Path $wasmPath)) {
    Write-Host "❌ WASM file not found. Building first..." -ForegroundColor Red
    cd contracts
    cargo build --target wasm32-unknown-unknown --release
    cd ..
    
    if (-not (Test-Path $wasmPath)) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ WASM file found: $wasmPath" -ForegroundColor Green

# Deploy contract
Write-Host "`n📦 Deploying contract to Futurenet..." -ForegroundColor Yellow

$deployOutput = stellar contract deploy `
    --wasm $wasmPath `
    --source sphira `
    --network futurenet 2>&1

if ($LASTEXITCODE -eq 0) {
    $contractId = $deployOutput | Select-String -Pattern "C[A-Z0-9]{55}" | ForEach-Object { $_.Matches.Value }
    
    if ($contractId) {
        Write-Host "`n✅ Contract deployed successfully!" -ForegroundColor Green
        Write-Host "📝 Contract ID: $contractId" -ForegroundColor Cyan
        
        # Save to JSON
        $deployData = @{
            network = "futurenet"
            contracts = @{
                sipManager = $contractId
                yieldRouter = $contractId
                lockVault = $contractId
            }
            deployer = "GA3D7NMCIIL76SQI6HAPOUB26NH5IXCG3PYWGDRJU225ELPY6DHWH4Y3"
            deployedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")
        }
        
        $deployData | ConvertTo-Json -Depth 3 | Set-Content "contracts/deployed-contracts.json"
        Write-Host "✅ Saved to contracts/deployed-contracts.json" -ForegroundColor Green
        
        # Update .env.local
        if (Test-Path ".env.stellar") {
            Copy-Item .env.stellar .env.local -Force
            
            $envContent = Get-Content .env.local
            $envContent = $envContent -replace "NEXT_PUBLIC_SIP_MANAGER_CONTRACT=.*", "NEXT_PUBLIC_SIP_MANAGER_CONTRACT=$contractId"
            $envContent = $envContent -replace "NEXT_PUBLIC_YIELD_ROUTER_CONTRACT=.*", "NEXT_PUBLIC_YIELD_ROUTER_CONTRACT=$contractId"
            $envContent = $envContent -replace "NEXT_PUBLIC_LOCK_VAULT_CONTRACT=.*", "NEXT_PUBLIC_LOCK_VAULT_CONTRACT=$contractId"
            $envContent | Set-Content .env.local
            
            Write-Host "✅ Updated .env.local with contract ID" -ForegroundColor Green
        }
        
        Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
        Write-Host "`nNext steps:" -ForegroundColor Yellow
        Write-Host "1. Install Freighter wallet: https://www.freighter.app/" -ForegroundColor White
        Write-Host "2. Switch Freighter to Futurenet network" -ForegroundColor White
        Write-Host "3. Fund your wallet: https://laboratory.stellar.org/#account-creator?network=futurenet" -ForegroundColor White
        Write-Host "4. Run: npm run dev" -ForegroundColor White
        Write-Host "5. Visit: http://localhost:3000" -ForegroundColor White
        
    } else {
        Write-Host "❌ Could not extract contract ID from output" -ForegroundColor Red
        Write-Host "Output: $deployOutput" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Error: $deployOutput" -ForegroundColor Yellow
    exit 1
}
