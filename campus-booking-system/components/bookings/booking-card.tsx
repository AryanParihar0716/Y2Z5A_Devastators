"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, X, CheckCircle, AlertTriangle } from "lucide-react"
import { format, isPast, isFuture } from "date-fns"
import { useState } from "react"

interface BookingCardProps {
  booking: any
}

export function BookingCard({ booking }: BookingCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />
      case "no_show":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no_show":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "study_room":
        return "bg-blue-100 text-blue-800"
      case "computer":
        return "bg-green-100 text-green-800"
      case "book":
        return "bg-purple-100 text-purple-800"
      case "equipment":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const canCancel = booking.status === "active" && isFuture(new Date(booking.start_time))
  const canCheckIn = booking.status === "active" && !booking.check_in_time && !isPast(new Date(booking.end_time))

  const handleCancel = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", booking.id)

      if (!error) {
        // Create cancellation notification
        await supabase.from("notifications").insert({
          user_id: booking.user_id,
          type: "booking_cancelled",
          title: "Booking Cancelled",
          message: `Your booking for ${booking.resources.name} has been cancelled.`,
          data: { booking_id: booking.id },
        })

        window.location.reload()
      }
    } catch (error) {
      console.error("Cancel booking error:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCheckIn = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ check_in_time: new Date().toISOString() })
        .eq("id", booking.id)

      if (!error) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Check-in error:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDateTime = (dateTime: string) => {
    return format(new Date(dateTime), "EEE, MMM d 'at' h:mm a")
  }

  const formatDuration = (start: string, end: string) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const durationMs = endTime.getTime() - startTime.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${minutes}m`
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(booking.status)}
            <h3 className="font-semibold">{booking.resources.name}</h3>
            <Badge className={getTypeColor(booking.resources.type)} variant="secondary">
              {booking.resources.type.replace("_", " ")}
            </Badge>
          </div>
          <Badge className={getStatusColor(booking.status)}>{booking.status.replace("_", " ")}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDateTime(booking.start_time)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(booking.start_time, booking.end_time)}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {booking.resources.location}
            </div>
          </div>

          {booking.purpose && (
            <div className="text-sm">
              <span className="font-medium">Purpose:</span> {booking.purpose.replace("_", " ")}
            </div>
          )}

          {booking.notes && (
            <div className="text-sm">
              <span className="font-medium">Notes:</span> {booking.notes}
            </div>
          )}

          {booking.check_in_time && (
            <div className="text-sm text-green-600">
              <span className="font-medium">Checked in:</span> {formatDateTime(booking.check_in_time)}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {canCheckIn && (
              <Button size="sm" onClick={handleCheckIn} disabled={isUpdating}>
                Check In
              </Button>
            )}
            {canCancel && (
              <Button size="sm" variant="outline" onClick={handleCancel} disabled={isUpdating}>
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
