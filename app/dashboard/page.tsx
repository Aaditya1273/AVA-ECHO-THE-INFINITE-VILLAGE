import { DashboardLayout } from "@/components/dashboard-layout"
import { OverviewCards } from "@/components/overview-cards"
import { SIPChart } from "@/components/sip-chart"
import { RecentActivity } from "@/components/recent-activity"
import { YieldOptimizer } from "@/components/yield-optimizer"
import { FuturenetSetup } from "@/components/futurenet-setup"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome to Sphira Dashboard</h1>
          <p className="text-muted-foreground">Your advanced DeFi SIP platform on Stellar blockchain</p>
        </div>

        <FuturenetSetup />

        <OverviewCards />

        <div className="grid gap-6 md:grid-cols-2">
          <SIPChart />
          <YieldOptimizer />
        </div>

        <RecentActivity />
      </div>
    </DashboardLayout>
  )
}
