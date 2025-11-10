Write-Host "Building Sphira Stellar Contracts..." -ForegroundColor Cyan

# Build the contract
Write-Host "Compiling Rust to WASM..." -ForegroundColor Yellow
cargo build --target wasm32-unknown-unknown --release

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Check if stellar CLI is available
$stellarExists = Get-Command stellar -ErrorAction SilentlyContinue

if ($stellarExists) {
    Write-Host "Optimizing WASM..." -ForegroundColor Yellow
    stellar contract optimize `
        --wasm target/wasm32-unknown-unknown/release/sphira_stellar_contracts.wasm `
        --wasm-out target/wasm32-unknown-unknown/release/sphira_stellar_contracts_optimized.wasm
    
    Write-Host "✅ Build complete! Optimized WASM at: target/wasm32-unknown-unknown/release/sphira_stellar_contracts_optimized.wasm" -ForegroundColor Green
} else {
    Write-Host "⚠️  Stellar CLI not found. Install with: cargo install --locked stellar-cli" -ForegroundColor Yellow
    Write-Host "✅ Build complete! WASM at: target/wasm32-unknown-unknown/release/sphira_stellar_contracts.wasm" -ForegroundColor Green
}
