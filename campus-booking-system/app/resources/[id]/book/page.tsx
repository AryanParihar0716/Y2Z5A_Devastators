import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BookingForm } from "@/components/booking/booking-form"
import { ResourceDetails } from "@/components/booking/resource-details"
import { AvailabilityCalendar } from "@/components/booking/availability-calendar"

interface BookResourcePageProps {
  params: Promise<{ id: string }>
}

export default async function BookResourcePage({ params }: BookResourcePageProps) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // Get resource details
  const { data: resource } = await supabase.from("resources").select("*").eq("id", id).single()

  if (!resource) {
    redirect("/resources")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} profile={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Book {resource.name}</h1>
          <p className="text-gray-600">Select your preferred time slot and complete your booking</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AvailabilityCalendar resourceId={resource.id} />
            <div className="mt-8">
              <BookingForm resource={resource} userId={user.id} />
            </div>
          </div>

          <div>
            <ResourceDetails resource={resource} />
          </div>
        </div>
      </main>
    </div>
  )
}
