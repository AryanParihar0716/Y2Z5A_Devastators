import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart3 } from "lucide-react"

export async function ResourceUtilization() {
  const supabase = await createClient()

  // Get resource utilization data for the past 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: utilizationData } = await supabase
    .from("booking_analytics")
    .select(`
      resource_id,
      resources (
        name,
        type
      )
    `)
    .gte("booking_date", sevenDaysAgo.toISOString().split("T")[0])

  // Calculate utilization by resource type
  const typeUtilization: Record<string, { count: number; total: number }> = {}

  if (utilizationData) {
    utilizationData.forEach((booking) => {
      const type = booking.resources?.type || "unknown"
      if (!typeUtilization[type]) {
        typeUtilization[type] = { count: 0, total: 0 }
      }
      typeUtilization[type].count += 1
    })
  }

  // Get total resources by type
  const { data: resources } = await supabase.from("resources").select("type").eq("is_active", true)

  if (resources) {
    resources.forEach((resource) => {
      const type = resource.type
      if (!typeUtilization[type]) {
        typeUtilization[type] = { count: 0, total: 0 }
      }
      typeUtilization[type].total += 1
    })
  }

  const utilizationStats = Object.entries(typeUtilization).map(([type, data]) => ({
    type: type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    utilization: data.total > 0 ? Math.round((data.count / (data.total * 7)) * 100) : 0,
    bookings: data.count,
    resources: data.total,
  }))

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return "bg-red-500"
    if (utilization >= 60) return "bg-yellow-500"
    if (utilization >= 40) return "bg-blue-500"
    return "bg-green-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Resource Utilization (7 days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {utilizationStats.length > 0 ? (
          <div className="space-y-6">
            {utilizationStats.map((stat) => (
              <div key={stat.type}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{stat.type}</h4>
                    <p className="text-sm text-muted-foreground">
                      {stat.bookings} bookings • {stat.resources} resources
                    </p>
                  </div>
                  <span className="text-sm font-medium">{stat.utilization}%</span>
                </div>
                <Progress value={stat.utilization} className="h-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No utilization data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
