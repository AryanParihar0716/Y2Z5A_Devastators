-- Safe seed data script that handles existing data conflicts
-- This script will clean up existing sample data and insert fresh data

-- Clean up existing sample data first
DELETE FROM public.bookings WHERE user_id IN (
    SELECT id FROM public.users WHERE email IN (
        'admin@campus.edu', 'john.doe@student.edu', 'jane.smith@student.edu', 
        'mike.johnson@student.edu', 'sarah.wilson@student.edu'
    )
);

DELETE FROM public.user_preferences WHERE user_id IN (
    SELECT id FROM public.users WHERE email IN (
        'admin@campus.edu', 'john.doe@student.edu', 'jane.smith@student.edu', 
        'mike.johnson@student.edu', 'sarah.wilson@student.edu'
    )
);

DELETE FROM public.system_updates WHERE created_by IN (
    SELECT id FROM public.users WHERE email = 'admin@campus.edu'
);

DELETE FROM public.users WHERE email IN (
    'admin@campus.edu', 'john.doe@student.edu', 'jane.smith@student.edu', 
    'mike.johnson@student.edu', 'sarah.wilson@student.edu'
);

DELETE FROM auth.users WHERE email IN (
    'admin@campus.edu', 'john.doe@student.edu', 'jane.smith@student.edu', 
    'mike.johnson@student.edu', 'sarah.wilson@student.edu'
);

-- Create a sample admin user first for system updates
DO $$
DECLARE
    admin_user_id UUID := 'a0000000-0000-0000-0000-000000000001'::UUID;
BEGIN
    -- Insert a sample admin user into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        admin_user_id,
        'authenticated',
        'authenticated',
        'admin@campus.edu',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "System", "last_name": "Administrator", "student_id": "ADMIN001", "department": "IT Services", "year_of_study": null, "phone": "+1234567890"}',
        false,
        '',
        '',
        '',
        ''
    );

    -- Insert the admin user into our users table
    INSERT INTO public.users (
        id,
        email,
        first_name,
        last_name,
        student_id,
        department,
        year_of_study,
        phone,
        role
    ) VALUES (
        admin_user_id,
        'admin@campus.edu',
        'System',
        'Administrator',
        'ADMIN001',
        'IT Services',
        null,
        '+1234567890',
        'admin'
    );
END $$;

-- Insert sample system updates
INSERT INTO public.system_updates (title, content, type, is_published, published_at, created_by) VALUES
('Welcome to Campus Booking System', 'We are excited to launch our new campus resource booking system! You can now easily book study rooms, computers, and library resources online.', 'feature', true, NOW(), 'a0000000-0000-0000-0000-000000000001'::UUID),
('Extended Library Hours', 'Starting next week, the library will be open until 11 PM on weekdays to accommodate student study needs during finals week.', 'general', true, NOW(), 'a0000000-0000-0000-0000-000000000001'::UUID),
('New Study Rooms Available', 'We have added 3 new study rooms on the third floor of the library. These rooms feature the latest technology and comfortable seating.', 'feature', true, NOW() - INTERVAL '2 days', 'a0000000-0000-0000-0000-000000000001'::UUID);

-- Insert sample student users with fixed UUIDs
DO $$
DECLARE
    student1_id UUID := 'b0000000-0000-0000-0000-000000000001'::UUID;
    student2_id UUID := 'b0000000-0000-0000-0000-000000000002'::UUID;
    student3_id UUID := 'b0000000-0000-0000-0000-000000000003'::UUID;
    student4_id UUID := 'b0000000-0000-0000-0000-000000000004'::UUID;
BEGIN
    -- Insert sample students into auth.users
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES 
    ('00000000-0000-0000-0000-000000000000', student1_id, 'authenticated', 'authenticated', 'john.doe@student.edu', crypt('student123', gen_salt('bf')), NOW(), NOW(), NOW(),
     '{"provider": "email", "providers": ["email"]}', '{"first_name": "John", "last_name": "Doe", "student_id": "STU001", "department": "Computer Science", "year_of_study": 3, "phone": "+1234567891"}', false, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', student2_id, 'authenticated', 'authenticated', 'jane.smith@student.edu', crypt('student123', gen_salt('bf')), NOW(), NOW(), NOW(),
     '{"provider": "email", "providers": ["email"]}', '{"first_name": "Jane", "last_name": "Smith", "student_id": "STU002", "department": "Mathematics", "year_of_study": 4, "phone": "+1234567892"}', false, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', student3_id, 'authenticated', 'authenticated', 'mike.johnson@student.edu', crypt('student123', gen_salt('bf')), NOW(), NOW(), NOW(),
     '{"provider": "email", "providers": ["email"]}', '{"first_name": "Mike", "last_name": "Johnson", "student_id": "STU003", "department": "Engineering", "year_of_study": 2, "phone": "+1234567893"}', false, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', student4_id, 'authenticated', 'authenticated', 'sarah.wilson@student.edu', crypt('student123', gen_salt('bf')), NOW(), NOW(), NOW(),
     '{"provider": "email", "providers": ["email"]}', '{"first_name": "Sarah", "last_name": "Wilson", "student_id": "STU004", "department": "Biology", "year_of_study": 1, "phone": "+1234567894"}', false, '', '', '', '');

    -- Insert students into our users table
    INSERT INTO public.users (id, email, first_name, last_name, student_id, department, year_of_study, phone, role) VALUES
    (student1_id, 'john.doe@student.edu', 'John', 'Doe', 'STU001', 'Computer Science', 3, '+1234567891', 'student'),
    (student2_id, 'jane.smith@student.edu', 'Jane', 'Smith', 'STU002', 'Mathematics', 4, '+1234567892', 'student'),
    (student3_id, 'mike.johnson@student.edu', 'Mike', 'Johnson', 'STU003', 'Engineering', 2, '+1234567893', 'student'),
    (student4_id, 'sarah.wilson@student.edu', 'Sarah', 'Wilson', 'STU004', 'Biology', 1, '+1234567894', 'student');

    -- Insert sample bookings for demonstration
    INSERT INTO public.bookings (user_id, resource_id, start_time, end_time, purpose, status) VALUES
    (student1_id, (SELECT id FROM public.resources WHERE name = 'Study Room A1' LIMIT 1), NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours', 'Group project meeting', 'active'),
    (student2_id, (SELECT id FROM public.resources WHERE name = 'Computer Lab 1 - Station 01' LIMIT 1), NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 1 hour', 'CAD assignment', 'active'),
    (student3_id, (SELECT id FROM public.resources WHERE name = 'Introduction to Computer Science' LIMIT 1), NOW() + INTERVAL '3 days', NOW() + INTERVAL '10 days', 'Course reading', 'active');

    -- Insert sample user preferences
    INSERT INTO public.user_preferences (user_id, preferred_locations, preferred_times, preferred_resource_types, study_habits) VALUES
    (student1_id, ARRAY['Library Floor 1', 'Library Floor 2'], '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "10:00", "end": "18:00"}}', ARRAY['study_room', 'computer'], '{"study_style": "collaborative", "preferred_duration": 120, "noise_level": "moderate"}'),
    (student2_id, ARRAY['Library Floor 3', 'Computer Lab 1'], '{"monday": {"start": "14:00", "end": "20:00"}, "wednesday": {"start": "10:00", "end": "16:00"}}', ARRAY['computer', 'book'], '{"study_style": "individual", "preferred_duration": 90, "noise_level": "quiet"}');

END $$;
