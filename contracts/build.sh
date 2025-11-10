#!/bin/bash

echo "Building Sphira Stellar Contracts..."

# Build the contract
cargo build --target wasm32-unknown-unknown --release

# Optimize the wasm
if command -v soroban &> /dev/null; then
    echo "Optimizing WASM..."
    soroban contract optimize \
        --wasm target/wasm32-unknown-unknown/release/sphira_stellar_contracts.wasm \
        --wasm-out target/wasm32-unknown-unknown/release/sphira_stellar_contracts_optimized.wasm
    echo "✅ Build complete! Optimized WASM at: target/wasm32-unknown-unknown/release/sphira_stellar_contracts_optimized.wasm"
else
    echo "⚠️  Soroban CLI not found. Install with: cargo install --locked soroban-cli"
    echo "✅ Build complete! WASM at: target/wasm32-unknown-unknown/release/sphira_stellar_contracts.wasm"
fi
