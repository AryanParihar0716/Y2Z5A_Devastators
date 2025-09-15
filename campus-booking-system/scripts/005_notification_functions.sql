-- Function to send booking reminder notifications
CREATE OR REPLACE FUNCTION send_booking_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Send reminders for bookings starting in 1 hour
  INSERT INTO public.notifications (user_id, type, title, message, data)
  SELECT 
    b.user_id,
    'booking_reminder'::notification_type,
    'Booking Reminder',
    'Your booking for ' || r.name || ' starts in 1 hour at ' || r.location || '.',
    json_build_object(
      'booking_id', b.id,
      'resource_id', b.resource_id,
      'start_time', b.start_time
    )
  FROM public.bookings b
  JOIN public.resources r ON b.resource_id = r.id
  WHERE b.status = 'active'
    AND b.start_time BETWEEN NOW() + INTERVAL '55 minutes' AND NOW() + INTERVAL '65 minutes'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = b.user_id 
        AND n.type = 'booking_reminder'
        AND n.data->>'booking_id' = b.id::text
        AND n.created_at > NOW() - INTERVAL '2 hours'
    );
END;
$$;

-- Function to check waitlist and notify users when resources become available
CREATE OR REPLACE FUNCTION check_waitlist_availability()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  waitlist_entry RECORD;
  available_slot BOOLEAN;
BEGIN
  -- Check each active waitlist entry
  FOR waitlist_entry IN 
    SELECT w.*, r.name as resource_name
    FROM public.waitlist w
    JOIN public.resources r ON w.resource_id = r.id
    WHERE w.is_active = true
      AND w.desired_start_time > NOW()
      AND w.expires_at > NOW()
  LOOP
    -- Check if the desired time slot is now available
    SELECT NOT EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.resource_id = waitlist_entry.resource_id
        AND b.status = 'active'
        AND (
          (waitlist_entry.desired_start_time >= b.start_time AND waitlist_entry.desired_start_time < b.end_time) OR
          (waitlist_entry.desired_end_time > b.start_time AND waitlist_entry.desired_end_time <= b.end_time) OR
          (waitlist_entry.desired_start_time <= b.start_time AND waitlist_entry.desired_end_time >= b.end_time)
        )
    ) INTO available_slot;

    -- If available, notify the user
    IF available_slot THEN
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        waitlist_entry.user_id,
        'waitlist_available'::notification_type,
        'Resource Available!',
        waitlist_entry.resource_name || ' is now available for your requested time slot. Book now before it''s taken!',
        json_build_object(
          'waitlist_id', waitlist_entry.id,
          'resource_id', waitlist_entry.resource_id,
          'desired_start_time', waitlist_entry.desired_start_time,
          'desired_end_time', waitlist_entry.desired_end_time
        )
      );

      -- Mark waitlist entry as notified
      UPDATE public.waitlist 
      SET notified_at = NOW()
      WHERE id = waitlist_entry.id;
    END IF;
  END LOOP;
END;
$$;

-- Function to automatically mark no-shows
CREATE OR REPLACE FUNCTION mark_no_shows()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark bookings as no-show if they haven't checked in 15 minutes after start time
  UPDATE public.bookings
  SET status = 'no_show'
  WHERE status = 'active'
    AND start_time < NOW() - INTERVAL '15 minutes'
    AND check_in_time IS NULL;

  -- Send notifications for no-shows
  INSERT INTO public.notifications (user_id, type, title, message, data)
  SELECT 
    b.user_id,
    'booking_cancelled'::notification_type,
    'Booking Marked as No-Show',
    'Your booking for ' || r.name || ' was marked as a no-show. Please remember to check in for future bookings.',
    json_build_object(
      'booking_id', b.id,
      'resource_id', b.resource_id
    )
  FROM public.bookings b
  JOIN public.resources r ON b.resource_id = r.id
  WHERE b.status = 'no_show'
    AND b.updated_at > NOW() - INTERVAL '5 minutes'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = b.user_id 
        AND n.type = 'booking_cancelled'
        AND n.data->>'booking_id' = b.id::text
    );
END;
$$;
