import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BookingsList } from "@/components/bookings/bookings-list"
import { BookingFilters } from "@/components/bookings/booking-filters"

interface BookingsPageProps {
  searchParams: Promise<{
    status?: string
    success?: string
  }>
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} profile={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">Manage your current and past resource bookings</p>
        </div>

        {params.success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">Booking created successfully! You'll receive a confirmation notification.</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <BookingFilters />
          </aside>

          <div className="flex-1">
            <BookingsList userId={user.id} statusFilter={params.status} />
          </div>
        </div>
      </main>
    </div>
  )
}
