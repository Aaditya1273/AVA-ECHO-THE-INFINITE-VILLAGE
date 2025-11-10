import { DashboardLayout } from "@/components/dashboard-layout"
import { YieldOptimizer } from "@/components/yield-optimizer"
import { YieldPools } from "@/components/yield-pools"
import { YieldHistory } from "@/components/yield-history"

export default function YieldPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Yield Optimizer</h1>
          <p className="text-muted-foreground text-pretty">Maximize your returns with automated yield routing</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <YieldOptimizer />
          <YieldPools />
        </div>

        <YieldHistory />
      </div>
    </DashboardLayout>
  )
}
