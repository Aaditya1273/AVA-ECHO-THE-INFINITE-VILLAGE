import { DashboardLayout } from "@/components/dashboard-layout"
import { SIPList } from "@/components/sip-list"
import { CreateSIPDialog } from "@/components/create-sip-dialog"
import { SIPStats } from "@/components/sip-stats"

export default function SIPsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">My SIPs</h1>
            <p className="text-muted-foreground text-pretty">Manage your systematic investment plans</p>
          </div>
          <CreateSIPDialog />
        </div>

        <SIPStats />
        <SIPList />
      </div>
    </DashboardLayout>
  )
}
