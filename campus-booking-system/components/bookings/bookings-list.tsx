import { createClient } from "@/lib/supabase/server"
import { BookingCard } from "./booking-card"

interface BookingsListProps {
  userId: string
  statusFilter?: string
}

export async function BookingsList({ userId, statusFilter }: BookingsListProps) {
  const supabase = await createClient()

  let query = supabase
    .from("bookings")
    .select(`
      *,
      resources (
        name,
        type,
        location,
        features
      )
    `)
    .eq("user_id", userId)
    .order("start_time", { ascending: false })

  if (statusFilter) {
    query = query.eq("status", statusFilter)
  }

  const { data: bookings, error } = await query

  if (error) {
    return <div className="text-center py-8 text-red-600">Error loading bookings</div>
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No bookings found</p>
        <p className="text-sm text-gray-400">
          {statusFilter ? `No ${statusFilter} bookings` : "You haven't made any bookings yet"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  )
}
