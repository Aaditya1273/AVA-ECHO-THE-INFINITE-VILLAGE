#!/usr/bin/env node

/**
 * 🚀 DEVELOPMENT OPTIMIZATION SCRIPT
 * Optimizes the development environment for faster compilation
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 Optimizing Sphira Development Environment...')
console.log('='.repeat(50))

// Clear Next.js cache
const nextCacheDir = path.join(process.cwd(), '.next')
if (fs.existsSync(nextCacheDir)) {
    console.log('🧹 Clearing Next.js cache...')
    fs.rmSync(nextCacheDir, { recursive: true, force: true })
    console.log('✅ Cache cleared')
}

// Clear node_modules cache
const nodeModulesCacheDir = path.join(process.cwd(), 'node_modules', '.cache')
if (fs.existsSync(nodeModulesCacheDir)) {
    console.log('🧹 Clearing node_modules cache...')
    fs.rmSync(nodeModulesCacheDir, { recursive: true, force: true })
    console.log('✅ Node modules cache cleared')
}

// Create optimized .env.development
const envDev = `# Development optimizations
NEXT_TELEMETRY_DISABLED=1
DISABLE_ESLINT_PLUGIN=true
FAST_REFRESH=true
TURBOPACK=1
`

fs.writeFileSync('.env.development', envDev)
console.log('✅ Created optimized .env.development')

console.log('\n🎯 Optimization Tips:')
console.log('1. Use "npm run dev" for Turbopack (faster)')
console.log('2. Close unnecessary browser tabs')
console.log('3. Disable browser extensions while developing')
console.log('4. Use "npm run dev:fast" for HTTPS + Turbopack')

console.log('\n✅ Development environment optimized!')
console.log('Run "npm run dev" to start with optimizations')