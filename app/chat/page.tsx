"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ChatInterface } from "@/components/chat-interface"

export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] -m-6">
        <ChatInterface isOpen={true} onClose={() => {}} />
      </div>
    </DashboardLayout>
  )
}
