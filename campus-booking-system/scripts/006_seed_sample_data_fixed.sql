-- Create a sample admin user first for system updates
DO $$
DECLARE
    admin_user_id UUID;
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
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@campus.edu',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "System Administrator", "student_id": "ADMIN001", "department": "IT Services", "year": "Staff", "phone": "+1234567890"}',
        false,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO admin_user_id;

    -- Insert the admin user into our users table
    INSERT INTO public.users (
        id,
        email,
        full_name,
        student_id,
        department,
        year,
        phone,
        role,
        is_active
    ) VALUES (
        admin_user_id,
        'admin@campus.edu',
        'System Administrator',
        'ADMIN001',
        'IT Services',
        'Staff',
        '+1234567890',
        'admin',
        true
    );
END $$;

-- Insert sample resources
INSERT INTO public.resources (name, type, description, location, capacity, features, availability_schedule) VALUES
-- Study Rooms
('Study Room A1', 'study_room', 'Quiet study room with whiteboard and projector', 'Library Floor 1', 6, '{"whiteboard": true, "projector": true, "power_outlets": 8, "wifi": true}', '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "10:00", "close": "18:00"}, "sunday": {"open": "12:00", "close": "20:00"}}'),

('Study Room B2', 'study_room', 'Collaborative space with large table and TV screen', 'Library Floor 2', 8, '{"tv_screen": true, "large_table": true, "power_outlets": 12, "wifi": true, "collaborative": true}', '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "10:00", "close": "18:00"}, "sunday": {"open": "12:00", "close": "20:00"}}'),

('Study Room C3', 'study_room', 'Small quiet room perfect for individual study', 'Library Floor 3', 2, '{"quiet_zone": true, "desk_lamp": true, "power_outlets": 4, "wifi": true}', '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "10:00", "close": "18:00"}, "sunday": {"open": "12:00", "close": "20:00"}}'),

-- Computers
('Computer Lab 1 - Station 01', 'computer', 'High-performance desktop with dual monitors', 'Computer Lab 1', 1, '{"dual_monitors": true, "high_performance": true, "software": ["Adobe Creative Suite", "AutoCAD", "MATLAB"], "peripherals": ["webcam", "microphone"]}', '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "10:00", "close": "18:00"}, "sunday": {"open": "12:00", "close": "20:00"}}'),

('Computer Lab 1 - Station 02', 'computer', 'Standard desktop for general use', 'Computer Lab 1', 1, '{"standard_monitor": true, "software": ["Microsoft Office", "Web Browsers", "Basic Programming Tools"], "peripherals": ["webcam"]}', '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "10:00", "close": "18:00"}, "sunday": {"open": "12:00", "close": "20:00"}}'),

-- Books
('Introduction to Computer Science', 'book', 'Comprehensive textbook covering fundamental CS concepts', 'Library Circulation Desk', 1, '{"isbn": "978-0134444321", "author": "John Smith", "edition": "5th", "year": 2023, "category": "Computer Science"}', '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "10:00", "close": "18:00"}, "sunday": {"open": "12:00", "close": "20:00"}}'),

('Advanced Mathematics for Engineers', 'book', 'Advanced mathematical concepts for engineering students', 'Library Circulation Desk', 1, '{"isbn": "978-0321749086", "author": "Jane Doe", "edition": "3rd", "year": 2022, "category": "Mathematics"}', '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}, "wednesday": {"open": "08:00", "close": "22:00"}, "thursday": {"open": "08:00", "close": "22:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "10:00", "close": "18:00"}, "sunday": {"open": "12:00", "close": "20:00"}}'),

-- Equipment
('Laptop - Dell XPS 13', 'equipment', 'Portable laptop for checkout', 'IT Services Desk', 1, '{"brand": "Dell", "model": "XPS 13", "specs": "Intel i7, 16GB RAM, 512GB SSD", "software": ["Microsoft Office", "Adobe Reader", "Web Browsers"], "accessories": ["charger", "mouse"]}', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "17:00"}}'),

('Projector - Epson PowerLite', 'equipment', 'Portable projector for presentations', 'IT Services Desk', 1, '{"brand": "Epson", "model": "PowerLite 1781W", "resolution": "1280x800", "brightness": "3200 lumens", "accessories": ["remote", "cables", "carrying_case"]}', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "17:00"}}');

-- Insert sample system updates (now with a valid created_by reference)
INSERT INTO public.system_updates (title, content, type, is_published, published_at, created_by) VALUES
('Welcome to Campus Booking System', 'We are excited to launch our new campus resource booking system! You can now easily book study rooms, computers, and library resources online.', 'feature', true, NOW(), (SELECT id FROM public.users WHERE email = 'admin@campus.edu')),
('Extended Library Hours', 'Starting next week, the library will be open until 11 PM on weekdays to accommodate student study needs during finals week.', 'general', true, NOW(), (SELECT id FROM public.users WHERE email = 'admin@campus.edu')),
('New Study Rooms Available', 'We have added 3 new study rooms on the third floor of the library. These rooms feature the latest technology and comfortable seating.', 'feature', true, NOW() - INTERVAL '2 days', (SELECT id FROM public.users WHERE email = 'admin@campus.edu'));

-- Insert some sample student users
DO $$
DECLARE
    student1_id UUID := gen_random_uuid();
    student2_id UUID := gen_random_uuid();
BEGIN
    -- Insert sample students into auth.users
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES 
    ('00000000-0000-0000-0000-000000000000', student1_id, 'authenticated', 'authenticated', 'john.doe@student.edu', crypt('student123', gen_salt('bf')), NOW(), NOW(), NOW(),
     '{"provider": "email", "providers": ["email"]}', '{"full_name": "John Doe", "student_id": "STU001", "department": "Computer Science", "year": "Junior", "phone": "+1234567891"}', false, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', student2_id, 'authenticated', 'authenticated', 'jane.smith@student.edu', crypt('student123', gen_salt('bf')), NOW(), NOW(), NOW(),
     '{"provider": "email", "providers": ["email"]}', '{"full_name": "Jane Smith", "student_id": "STU002", "department": "Mathematics", "year": "Senior", "phone": "+1234567892"}', false, '', '', '', '');

    -- Insert students into our users table
    INSERT INTO public.users (id, email, full_name, student_id, department, year, phone, role, is_active) VALUES
    (student1_id, 'john.doe@student.edu', 'John Doe', 'STU001', 'Computer Science', 'Junior', '+1234567891', 'student', true),
    (student2_id, 'jane.smith@student.edu', 'Jane Smith', 'STU002', 'Mathematics', 'Senior', '+1234567892', 'student', true);
END $$;
