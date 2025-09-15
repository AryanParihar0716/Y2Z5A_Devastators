import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, AlertTriangle, TrendingUp } from "lucide-react"

export async function AdminStats() {
  const supabase = await createClient()

  // Get total active bookings
  const { count: activeBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .gte("start_time", new Date().toISOString())

  // Get total users
  const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

  // Get total resources
  const { count: totalResources } = await supabase
    .from("resources")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  // Get pending fault reports
  const { count: pendingFaults } = await supabase
    .from("fault_reports")
    .select("*", { count: "exact", head: true })
    .in("status", ["reported", "in_progress"])

  // Get today's bookings
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

  const { count: todayBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .gte("start_time", startOfDay)
    .lt("start_time", endOfDay)

  const stats = [
    {
      title: "Active Bookings",
      value: activeBookings || 0,
      description: "Currently active reservations",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Users",
      value: totalUsers || 0,
      description: "Registered students and staff",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Available Resources",
      value: totalResources || 0,
      description: "Active bookable resources",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Pending Issues",
      value: pendingFaults || 0,
      description: "Fault reports requiring attention",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
