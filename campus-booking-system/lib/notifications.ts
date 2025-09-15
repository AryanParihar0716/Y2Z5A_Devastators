import { createClient } from "@/lib/supabase/server"

export interface CreateNotificationParams {
  userId: string
  type: "booking_confirmed" | "booking_reminder" | "booking_cancelled" | "waitlist_available" | "system_update"
  title: string
  message: string
  data?: any
}

export async function createNotification(params: CreateNotificationParams) {
  const supabase = await createClient()

  const { error } = await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    data: params.data || {},
  })

  if (error) {
    console.error("Failed to create notification:", error)
    return false
  }

  return true
}

export async function createBookingConfirmationNotification(userId: string, bookingData: any) {
  return createNotification({
    userId,
    type: "booking_confirmed",
    title: "Booking Confirmed",
    message: `Your booking for ${bookingData.resourceName} has been confirmed for ${new Date(
      bookingData.startTime,
    ).toLocaleString()}.`,
    data: { bookingId: bookingData.bookingId, resourceId: bookingData.resourceId },
  })
}

export async function createBookingReminderNotification(userId: string, bookingData: any) {
  return createNotification({
    userId,
    type: "booking_reminder",
    title: "Booking Reminder",
    message: `Your booking for ${bookingData.resourceName} starts in 1 hour at ${bookingData.location}.`,
    data: { bookingId: bookingData.bookingId, resourceId: bookingData.resourceId },
  })
}

export async function createBookingCancellationNotification(userId: string, bookingData: any) {
  return createNotification({
    userId,
    type: "booking_cancelled",
    title: "Booking Cancelled",
    message: `Your booking for ${bookingData.resourceName} on ${new Date(
      bookingData.startTime,
    ).toLocaleString()} has been cancelled.`,
    data: { bookingId: bookingData.bookingId, resourceId: bookingData.resourceId },
  })
}

export async function createWaitlistNotification(userId: string, resourceData: any) {
  return createNotification({
    userId,
    type: "waitlist_available",
    title: "Resource Available",
    message: `${resourceData.resourceName} is now available for your requested time slot. Book now before it's taken!`,
    data: { resourceId: resourceData.resourceId, timeSlot: resourceData.timeSlot },
  })
}

export async function createSystemUpdateNotification(userId: string, updateData: any) {
  return createNotification({
    userId,
    type: "system_update",
    title: updateData.title,
    message: updateData.message,
    data: { updateId: updateData.updateId },
  })
}
