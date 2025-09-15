"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { format, addDays, startOfWeek, isSameDay, isToday, isPast } from "date-fns"

interface AvailabilityCalendarProps {
  resourceId: string
}

interface TimeSlot {
  time: string
  available: boolean
  bookingId?: string
}

export function AvailabilityCalendar({ resourceId }: AvailabilityCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate)
    }
  }, [selectedDate, resourceId])

  const fetchTimeSlots = async (date: Date) => {
    setLoading(true)
    const dateStr = format(date, "yyyy-MM-dd")

    // Get existing bookings for this date
    const { data: bookings } = await supabase
      .from("bookings")
      .select("start_time, end_time, id")
      .eq("resource_id", resourceId)
      .eq("status", "active")
      .gte("start_time", `${dateStr}T00:00:00`)
      .lt("start_time", `${dateStr}T23:59:59`)

    // Generate time slots (8 AM to 10 PM, 1-hour slots)
    const slots: TimeSlot[] = []
    for (let hour = 8; hour <= 21; hour++) {
      const timeStr = `${hour.toString().padStart(2, "0")}:00`
      const slotStart = new Date(`${dateStr}T${timeStr}:00`)
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000)

      // Check if this slot conflicts with any booking
      const isBooked = bookings?.some((booking) => {
        const bookingStart = new Date(booking.start_time)
        const bookingEnd = new Date(booking.end_time)
        return slotStart < bookingEnd && slotEnd > bookingStart
      })

      // Check if slot is in the past
      const isPastSlot = isPast(slotStart)

      slots.push({
        time: timeStr,
        available: !isBooked && !isPastSlot,
        bookingId: isBooked ? bookings?.find((b) => new Date(b.start_time) <= slotStart)?.id : undefined,
      })
    }

    setTimeSlots(slots)
    setLoading(false)
  }

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) => addDays(prev, direction === "next" ? 7 : -7))
    setSelectedDate(null)
    setSelectedTimeSlot(null)
  }

  const selectDate = (date: Date) => {
    if (isPast(date) && !isToday(date)) return
    setSelectedDate(date)
    setSelectedTimeSlot(null)
  }

  const selectTimeSlot = (time: string) => {
    setSelectedTimeSlot(time)
    // Emit event for parent component
    window.dispatchEvent(
      new CustomEvent("timeSlotSelected", {
        detail: {
          date: selectedDate,
          time: time,
          dateTime: new Date(`${format(selectedDate!, "yyyy-MM-dd")}T${time}:00`),
        },
      }),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Select Date & Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="font-medium">
            {format(currentWeek, "MMM d")} - {format(addDays(currentWeek, 6), "MMM d, yyyy")}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDays.map((day) => {
            const isPastDay = isPast(day) && !isToday(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)

            return (
              <Button
                key={day.toISOString()}
                variant={isSelected ? "default" : "outline"}
                className={`h-16 flex flex-col ${isPastDay ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => selectDate(day)}
                disabled={isPastDay}
              >
                <span className="text-xs">{format(day, "EEE")}</span>
                <span className="text-lg font-semibold">{format(day, "d")}</span>
                {isToday(day) && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    Today
                  </Badge>
                )}
              </Button>
            )
          })}
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" />
              <h4 className="font-medium">Available Times for {format(selectedDate, "EEEE, MMM d")}</h4>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading available times...</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                    size="sm"
                    className={`${!slot.available ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => slot.available && selectTimeSlot(slot.time)}
                    disabled={!slot.available}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            )}

            {timeSlots.length > 0 && !timeSlots.some((slot) => slot.available) && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No available time slots for this date</p>
                <p className="text-sm">Try selecting a different date</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
