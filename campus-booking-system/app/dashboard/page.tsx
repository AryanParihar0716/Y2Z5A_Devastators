import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { UpcomingBookings } from "@/components/dashboard/upcoming-bookings"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SystemUpdates } from "@/components/dashboard/system-updates"
import { RecommendationEngine } from "@/components/ai/recommendation-engine"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { SmartSuggestions } from "@/components/ai/smart-suggestions"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} profile={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile?.first_name || user.email}!</h1>
          <p className="text-gray-600">Manage your bookings and discover campus resources</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <QuickActions />
            <UpcomingBookings userId={user.id} />
            <RecentActivity userId={user.id} />
            <RecommendationEngine userId={user.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <NotificationCenter userId={user.id} />
            <SmartSuggestions userId={user.id} />
            <SystemUpdates />
          </div>
        </div>
      </main>
    </div>
  )
}
