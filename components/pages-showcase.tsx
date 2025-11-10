"use client"

import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Shield, Settings, CheckCircle, ArrowRight } from "lucide-react"

export function PagesShowcase() {
  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
      <EnhancedCard animated glow className="p-6">
        <EnhancedCardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 glow-primary">
              <Shield size={24} />
            </div>
            <div>
              <EnhancedCardTitle neon>Security Center</EnhancedCardTitle>
              <p className="text-sm text-muted-foreground">Manage account security</p>
            </div>
          </div>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Two-Factor Authentication</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Security Score: 95/100</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Activity Monitoring</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>API Key Management</span>
            </div>
          </div>
          <EnhancedButton variant="glow" className="w-full" asChild>
            <a href="/security">
              Open Security Center
              <ArrowRight size={16} className="ml-2" />
            </a>
          </EnhancedButton>
        </EnhancedCardContent>
      </EnhancedCard>

      <EnhancedCard animated glow className="p-6">
        <EnhancedCardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 glow-secondary">
              <Settings size={24} />
            </div>
            <div>
              <EnhancedCardTitle neon>Settings</EnhancedCardTitle>
              <p className="text-sm text-muted-foreground">Customize your experience</p>
            </div>
          </div>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Profile Management</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Theme & Appearance</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Notification Preferences</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-400" />
              <span>Trading Settings</span>
            </div>
          </div>
          <EnhancedButton variant="glow" className="w-full" asChild>
            <a href="/settings">
              Open Settings
              <ArrowRight size={16} className="ml-2" />
            </a>
          </EnhancedButton>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  )
}
