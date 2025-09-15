import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStats } from "@/components/admin/admin-stats"
import { RecentBookings } from "@/components/admin/recent-bookings"
import { ResourceUtilization } from "@/components/admin/resource-utilization"
import { SystemHealth } from "@/components/admin/system-health"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile || !["admin", "staff"].includes(profile.role)) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} profile={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage campus resource bookings</p>
        </div>

        <div className="space-y-8">
          <AdminStats />

          <div className="grid lg:grid-cols-2 gap-8">
            <RecentBookings />
            <ResourceUtilization />
          </div>

          <SystemHealth />
        </div>
      </main>
    </div>
  )
}
