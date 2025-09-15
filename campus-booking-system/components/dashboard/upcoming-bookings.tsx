import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock } from "lucide-react"
import Link from "next/link"

interface UpcomingBookingsProps {
  userId: string
}

export async function UpcomingBookings({ userId }: UpcomingBookingsProps) {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      resources (
        name,
        type,
        location
      )
    `)
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(5)

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const getStatusColor = (startTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffHours < 1) return "bg-red-100 text-red-800"
    if (diffHours < 24) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Bookings
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/bookings">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{booking.resources?.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {booking.resources?.type?.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(booking.start_time)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {booking.resources?.location}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(booking.start_time)}>
                  {new Date(booking.start_time).getTime() - new Date().getTime() < 60 * 60 * 1000 ? "Soon" : "Upcoming"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming bookings</p>
            <Button asChild className="mt-4">
              <Link href="/resources">Book a Resource</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
