"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { connectWallet, disconnectWallet, getPublicKey } from "@/lib/stellar-wallet"
import { Zap, Shield, TrendingUp, MessageSquare, BarChart3, ArrowRight, Sparkles, Rocket, Star, LogOut, Wallet } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEffect, useState } from "react"

export function LandingPage() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const publicKey = await getPublicKey()
      if (publicKey) {
        setAddress(publicKey)
        setIsConnected(true)
      }
    } catch (error) {
      console.log('No wallet connected')
    }
  }

  const handleConnect = async () => {
    try {
      const publicKey = await connectWallet()
      setAddress(publicKey)
      setIsConnected(true)
    } catch (error: any) {
      console.error('Failed to connect:', error)
      // Show error to user
      alert(error?.message || 'Failed to connect wallet. Please try again.')
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    setAddress(null)
    setIsConnected(false)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b bg-card/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-primary-foreground font-bold text-xl">S</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-2xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Sphira</span>
              <Badge variant="secondary" className="animate-pulse bg-green-500/10 text-green-600 border-green-500/20">
                v2.0
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-600">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Launch App
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 hover:border-red-300 transition-all duration-300 hover:scale-105"
                  title="Disconnect Wallet"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="animate-bounce">
                <Button 
                  onClick={handleConnect}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Freighter
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-40 pt-20 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Animated Badge */}
          <div className="mb-8 animate-fade-in-up">
            <Badge variant="outline" className="px-6 py-2 text-sm bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20 text-green-600 hover:scale-105 transition-transform duration-300">
              <Rocket className="w-4 h-4 mr-2 animate-pulse" />
              Production Ready • Stellar Blockchain
              <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
            </Badge>
          </div>

          {/* Main Title */}
          <div className="mb-8 animate-fade-in-up delay-200">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 text-green-500 leading-tight">
              Advanced DeFi
              <br />
              Platform
            </h1>
          </div>

          {/* Subtitle */}
          <div className="mb-12 animate-fade-in-up delay-400">
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Systematic Investment Plans, Yield Optimization, and Emergency Vaults
              <br />
              <span className="text-primary font-semibold">All powered by real blockchain data</span>
            </p>
          </div>

          {/* CTA Section */}
          <div className="animate-fade-in-up delay-600">
            {isConnected ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-3 text-green-600 animate-pulse">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
                  <span className="font-medium">Connected: {address?.slice(0,6)}...{address?.slice(-4)}</span>
                  <Star className="w-4 h-4 text-green-500" />
                </div>
                <Button 
                  size="lg" 
                  onClick={() => router.push('/dashboard')}
                  className="px-12 py-6 text-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 rounded-2xl"
                >
                  <BarChart3 className="mr-3 h-6 w-6" />
                  Open Dashboard
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </div>
            ) : (
              <div className="space-y-6 flex flex-col items-center">
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <Button 
                    size="lg"
                    onClick={handleConnect}
                    className="px-12 py-6 text-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl"
                  >
                    <Wallet className="mr-3 h-6 w-6" />
                    Connect Freighter Wallet
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </div>
                <p className="text-muted-foreground animate-pulse text-center">Connect your Stellar wallet to access the platform</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-30 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "SIP 2.0",
                description: "Automated systematic investment plans with real blockchain execution",
                color: "from-primary/20 to-primary/5",
                iconColor: "text-primary",
                delay: "delay-100"
              },
              {
                icon: Zap,
                title: "Yield Optimization",
                description: "AI-powered yield routing across Stellar DeFi pools",
                color: "from-green-500/20 to-green-500/5",
                iconColor: "text-green-600",
                delay: "delay-200"
              },
              {
                icon: Shield,
                title: "Emergency Vault",
                description: "Secure fund locking with time-based protection",
                color: "from-orange-500/20 to-orange-500/5",
                iconColor: "text-orange-600",
                delay: "delay-300"
              },
              {
                icon: MessageSquare,
                title: "AI Assistant",
                description: "Intelligent chatbot powered by Gemini AI",
                color: "from-blue-500/20 to-blue-500/5",
                iconColor: "text-blue-600",
                delay: "delay-400"
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                className={`group hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-fade-in-up ${feature.delay} border-0 bg-gradient-to-br ${feature.color} backdrop-blur-sm`}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-20 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-card/80 to-muted/20 backdrop-blur-xl border-0 shadow-2xl animate-fade-in-up delay-500">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Platform Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-12 text-center">
                {[
                  { value: "100%", label: "Real Blockchain Data", color: "text-primary" },
                  { value: "Live", label: "Smart Contract Integration", color: "text-green-600" },
                  { value: "AI", label: "Powered Assistant", color: "text-blue-600" }
                ].map((stat, index) => (
                  <div key={index} className="group hover:scale-110 transition-transform duration-300">
                    <div className={`text-5xl font-black ${stat.color} mb-4 group-hover:animate-pulse`}>
                      {stat.value}
                    </div>
                    <p className="text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      {!isConnected && (
        <section className="relative z-10 py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <Card className="text-center bg-gradient-to-br from-primary/10 via-card to-primary/5 backdrop-blur-xl border-primary/20 shadow-2xl animate-fade-in-up delay-700">
              <CardContent className="pt-12 pb-12">
                <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Ready to Start?
                </h3>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Connect your wallet and experience the future of DeFi on Stellar
                </p>
                <div className="flex justify-center transform hover:scale-105 transition-transform duration-300">
                  <Button 
                    size="lg"
                    onClick={handleConnect}
                    className="px-12 py-6 text-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl"
                  >
                    <Wallet className="mr-3 h-6 w-6" />
                    Connect Freighter Wallet
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t bg-card/80 backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Sphira
            </span>
          </div>
          <p className="text-muted-foreground">
            Built on Stellar Blockchain • Powered by Soroban • Production Ready
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
      `}</style>
    </div>
  )
}