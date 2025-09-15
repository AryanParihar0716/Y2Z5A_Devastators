"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

interface BookingFormProps {
  resource: any
  userId: string
}

interface BookingDetails {
  date: Date | null
  time: string | null
  dateTime: Date | null
}

export function BookingForm({ resource, userId }: BookingFormProps) {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    date: null,
    time: null,
    dateTime: null,
  })
  const [duration, setDuration] = useState("60")
  const [purpose, setPurpose] = useState("")
  const [notes, setNotes] = useState("")
  const [addToWaitlist, setAddToWaitlist] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleTimeSlotSelected = (event: CustomEvent) => {
      setBookingDetails({
        date: event.detail.date,
        time: event.detail.time,
        dateTime: event.detail.dateTime,
      })
    }

    window.addEventListener("timeSlotSelected", handleTimeSlotSelected as EventListener)
    return () => {
      window.removeEventListener("timeSlotSelected", handleTimeSlotSelected as EventListener)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingDetails.dateTime) {
      setError("Please select a date and time")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const startTime = bookingDetails.dateTime
      const endTime = new Date(startTime.getTime() + Number.parseInt(duration) * 60 * 1000)

      // Create the booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: userId,
          resource_id: resource.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          purpose: purpose || null,
          notes: notes || null,
        })
        .select()
        .single()

      if (bookingError) {
        if (bookingError.message.includes("Booking conflict")) {
          setError("This time slot is no longer available. Please select a different time.")
        } else {
          setError("Failed to create booking. Please try again.")
        }
        return
      }

      // Create notification
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "booking_confirmed",
        title: "Booking Confirmed",
        message: `Your booking for ${resource.name} has been confirmed for ${format(
          startTime,
          "EEEE, MMM d 'at' h:mm a",
        )}.`,
        data: {
          booking_id: booking.id,
          resource_id: resource.id,
          resource_name: resource.name,
          start_time: startTime.toISOString(),
        },
      })

      // If user wants to be added to waitlist for future availability
      if (addToWaitlist) {
        await supabase.from("waitlist").insert({
          user_id: userId,
          resource_id: resource.id,
          desired_start_time: startTime.toISOString(),
          desired_end_time: endTime.toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })
      }

      router.push("/bookings?success=true")
    } catch (error) {
      console.error("Booking error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = bookingDetails.dateTime && duration && !isSubmitting

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Booking Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected Date & Time Display */}
          {bookingDetails.dateTime && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Selected Time</span>
              </div>
              <p className="text-blue-800">{format(bookingDetails.dateTime, "EEEE, MMMM d, yyyy 'at' h:mm a")}</p>
            </div>
          )}

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose (Optional)</Label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual_study">Individual Study</SelectItem>
                <SelectItem value="group_study">Group Study</SelectItem>
                <SelectItem value="project_work">Project Work</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="presentation_prep">Presentation Preparation</SelectItem>
                <SelectItem value="exam_prep">Exam Preparation</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Waitlist Option */}
          <div className="flex items-center space-x-2">
            <Checkbox id="waitlist" checked={addToWaitlist} onCheckedChange={setAddToWaitlist} />
            <Label htmlFor="waitlist" className="text-sm">
              Add me to waitlist for similar time slots in the future
            </Label>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <Button type="submit" className="w-full" disabled={!canSubmit}>
            {isSubmitting ? "Creating Booking..." : "Confirm Booking"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
