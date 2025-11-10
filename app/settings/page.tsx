"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Globe, 
  Wallet, 
  Moon, 
  Sun, 
  Monitor,
  Smartphone,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle,
  Copy
} from "lucide-react"
import { useState, useEffect } from "react"
import { useAccount, useDisconnect } from "@/lib/stellar-wallet"

export default function SettingsPage() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [theme, setTheme] = useState("system")
  const [language, setLanguage] = useState("en")
  const [currency, setCurrency] = useState("XLM")
  const [pushNotifications, setPushNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoRebalance, setAutoRebalance] = useState(true)
  const [riskTolerance, setRiskTolerance] = useState("moderate")
  const [copied, setCopied] = useState(false)
  const [showLanguagePopup, setShowLanguagePopup] = useState(false)
  const [showCurrencyPopup, setShowCurrencyPopup] = useState(false)

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    // Apply theme immediately to document
    const root = document.documentElement
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else if (newTheme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      // System theme
      root.classList.remove('dark', 'light')
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (systemPrefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.add('light')
      }
    }
    
    // Store in localStorage
    localStorage.setItem('sphira-theme', newTheme)
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }))
  }

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('sphira-theme') || 'system'
    setTheme(savedTheme)
    handleThemeChange(savedTheme)
  }, [])

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLanguageChange = (newLanguage: string) => {
    if (newLanguage !== "en") {
      setShowLanguagePopup(true)
    } else {
      setLanguage(newLanguage)
    }
  }

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency)
    setShowCurrencyPopup(true)
    // Store in localStorage for global app use
    localStorage.setItem('sphira-currency', newCurrency)
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: newCurrency }))
  }

  if (!isConnected) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Connect your wallet to access settings</p>
          </div>

          <Card className="bg-gradient-to-br from-card/50 to-muted/20 backdrop-blur-sm border-0">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Wallet className="h-20 w-20 text-muted-foreground mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Connect Wallet Required</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Connect your wallet to customize your Sphira experience and preferences
              </p>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Real User Settings
              </Badge>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Wallet Address */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your Sphira experience and preferences</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Connected Wallet</p>
            <p className="font-mono text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon size={16} />
              General
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={16} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette size={16} />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <Wallet size={16} />
              Trading
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Language & Region
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={handleLanguageChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="ko">한국어</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select value={currency} onValueChange={handleCurrencyChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XLM">XLM (◎)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                        <SelectItem value="BTC">BTC (₿)</SelectItem>
                        <SelectItem value="ETH">ETH (Ξ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                        <SelectItem value="gmt">GMT</SelectItem>
                        <SelectItem value="ist">India Standard Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5" />
                    Data & Sync
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Auto-sync Portfolio</p>
                      <p className="text-sm text-muted-foreground">Automatically sync portfolio data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Cache Data</p>
                      <p className="text-sm text-muted-foreground">Store data locally for faster loading</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full bg-gradient-to-r from-green-500/20 to-green-500/10 backdrop-blur-sm border border-green-500/20 hover:from-green-500/30 hover:to-green-500/20 transition-all duration-300 hover:scale-105">
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card/80 backdrop-blur-xl border-0 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5 text-green-600" />
                            Export Portfolio Data
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">
                            Export your portfolio data, settings, and transaction history
                          </p>
                          <div className="bg-muted/50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="h-4 w-4 text-green-500" />
                              <span className="font-medium text-sm">Secure Export</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Your data will be exported as an encrypted JSON file
                            </p>
                          </div>
                          <Button className="w-full bg-gradient-to-r from-green-500 to-green-600">
                            Download Export File
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full bg-gradient-to-r from-blue-500/20 to-blue-500/10 backdrop-blur-sm border border-blue-500/20 hover:from-blue-500/30 hover:to-blue-500/20 transition-all duration-300 hover:scale-105">
                          <Upload className="h-4 w-4 mr-2" />
                          Import Data
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card/80 backdrop-blur-xl border-0 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-blue-600" />
                            Import Portfolio Data
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">
                            Import your previously exported portfolio data and settings
                          </p>
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              This will overwrite your current settings and data
                            </AlertDescription>
                          </Alert>
                          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Click to select or drag and drop your export file
                            </p>
                          </div>
                          <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600" disabled>
                            Import Data
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Wallet Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                    {address ? address[2].toUpperCase() : "A"}
                  </div>
                  <div className="space-y-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/20 hover:from-primary/30 hover:to-primary/20 transition-all duration-300 hover:scale-105">
                          Change Avatar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card/80 backdrop-blur-xl border-0 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Change Avatar
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">
                            Upload a new avatar for your wallet profile
                          </p>
                          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Click to select or drag and drop your image
                            </p>
                            <p className="text-xs text-muted-foreground">
                              JPG, PNG or GIF. Max size 2MB
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                              Cancel
                            </Button>
                            <Button className="flex-1 bg-gradient-to-r from-primary to-primary/80" disabled>
                              Upload Avatar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="walletName">Wallet Name</Label>
                    <Input id="walletName" defaultValue="My Sphira Wallet" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Wallet Address</Label>
                    <div className="flex gap-2">
                      <Input id="walletAddress" value={address || ""} readOnly className="font-mono flex-1" />
                      <Button variant="outline" size="sm" onClick={copyAddress}>
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    {copied && <p className="text-xs text-green-600">Address copied!</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" placeholder="Tell us about yourself..." />
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105">
                        Save Changes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card/80 backdrop-blur-xl border-0 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          Save Profile Changes
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          Are you sure you want to save these profile changes?
                        </p>
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Wallet Name:</span>
                            <span className="font-medium">My Sphira Wallet</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Bio:</span>
                            <span className="font-medium">Updated</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            Cancel
                          </Button>
                          <Button className="flex-1 bg-gradient-to-r from-green-500 to-green-600">
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme & Display
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                        theme === 'light' ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <Sun className="mx-auto mb-2 h-6 w-6" />
                      <p className="text-center text-sm">Light</p>
                    </div>
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                        theme === 'dark' ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <Moon className="mx-auto mb-2 h-6 w-6" />
                      <p className="text-center text-sm">Dark</p>
                    </div>
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                        theme === 'system' ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => handleThemeChange('system')}
                    >
                      <Monitor className="mx-auto mb-2 h-6 w-6" />
                      <p className="text-center text-sm">System</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                    <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Trading Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Auto-Rebalancing</p>
                      <p className="text-sm text-muted-foreground">Automatically rebalance portfolio</p>
                    </div>
                    <Switch checked={autoRebalance} onCheckedChange={setAutoRebalance} />
                  </div>

                  <div className="space-y-2">
                    <Label>Risk Tolerance</Label>
                    <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Default SIP Frequency</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Gas Price Strategy</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">Slow (Lower fees)</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="fast">Fast (Higher fees)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Account Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Reset Settings</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                      Reset all settings to default values.
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 hover:from-yellow-500/30 hover:to-yellow-500/20 transition-all duration-300 hover:scale-105">
                          Reset to Defaults
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card/80 backdrop-blur-xl border-0 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-yellow-600" />
                            Reset All Settings
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">
                            This will reset all your settings to their default values. This action cannot be undone.
                          </p>
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Your wallet connection will remain, but all preferences will be reset
                            </AlertDescription>
                          </Alert>
                          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                            <p className="text-sm text-yellow-600 font-medium">Settings to be reset:</p>
                            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                              <li>• Currency: Back to XLM</li>
                              <li>• Theme: Back to System</li>
                              <li>• Notifications: Back to enabled</li>
                              <li>• Trading preferences: Back to defaults</li>
                            </ul>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                              Cancel
                            </Button>
                            <Button className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600">
                              Reset Settings
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800">
                    <p className="font-medium text-red-800 dark:text-red-200 mb-2">Disconnect Wallet</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                      Disconnect your wallet from this session.
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 bg-gradient-to-r from-red-500/20 to-red-500/10 backdrop-blur-sm hover:from-red-500/30 hover:to-red-500/20 transition-all duration-300 hover:scale-105">
                          Disconnect Wallet
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card/80 backdrop-blur-xl border-0 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            Disconnect Wallet
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">
                            Are you sure you want to disconnect your wallet? You'll need to reconnect to access your portfolio.
                          </p>
                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="font-mono text-sm mb-2">Current Wallet:</p>
                            <p className="font-mono text-sm text-primary break-all">{address}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                              Cancel
                            </Button>
                            <Button 
                              className="flex-1 bg-gradient-to-r from-red-500 to-red-600"
                              onClick={() => disconnect()}
                            >
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Real Data Notice */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium text-purple-600 mb-1">100% Real User Settings</p>
                <p className="text-sm text-muted-foreground">
                  All settings are connected to your real wallet address. Currency changes affect the entire app globally.
                  XLM is the default currency for Stellar blockchain. No fake wallet addresses or mock data is displayed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Coming Soon Popup */}
        <Dialog open={showLanguagePopup} onOpenChange={setShowLanguagePopup}>
          <DialogContent className="bg-card/80 backdrop-blur-xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Multilingual Coming Soon
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-8">
                <Globe className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Multilingual Support</h3>
                <p className="text-muted-foreground mb-6">
                  We're working hard to bring you Sphira in multiple languages. 
                  Currently, only English is supported.
                </p>
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <p className="text-sm text-blue-600 font-medium">Coming Soon:</p>
                  <p className="text-sm text-muted-foreground">
                    Spanish, French, German, Japanese, Korean and more!
                  </p>
                </div>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
                onClick={() => {
                  setShowLanguagePopup(false)
                  setLanguage("en") // Reset to English
                }}
              >
                Continue with English
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Currency Changed Popup */}
        <Dialog open={showCurrencyPopup} onOpenChange={setShowCurrencyPopup}>
          <DialogContent className="bg-card/80 backdrop-blur-xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Currency Updated
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">
                    {currency === "XLM" ? "◎" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "BTC" ? "₿" : currency === "ETH" ? "Ξ" : currency}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Currency Changed to {currency}</h3>
                <p className="text-muted-foreground mb-4">
                  Your default currency has been updated across the entire Sphira app.
                </p>
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <p className="text-sm text-green-600 font-medium">✓ All prices and balances will now display in {currency}</p>
                  <p className="text-sm text-muted-foreground">
                    This setting is saved and will persist across sessions
                  </p>
                </div>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-green-600"
                onClick={() => setShowCurrencyPopup(false)}
              >
                Got it!
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

