-- Mock data for the booking system

-- Insert mock users (customers and businesses)
INSERT INTO users (id, email, phone, first_name, last_name, user_type, avatar_url) VALUES
-- Business users
('550e8400-e29b-41d4-a716-446655440001', 'john.barber@example.com', '+1234567890', 'John', 'Smith', 'business', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
('550e8400-e29b-41d4-a716-446655440002', 'maria.salon@example.com', '+1234567891', 'Maria', 'Garcia', 'business', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
('550e8400-e29b-41d4-a716-446655440003', 'alex.spa@example.com', '+1234567892', 'Alex', 'Johnson', 'business', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),

-- Customer users
('550e8400-e29b-41d4-a716-446655440011', 'sarah.customer@example.com', '+1234567901', 'Sarah', 'Wilson', 'customer', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'),
('550e8400-e29b-41d4-a716-446655440012', 'mike.customer@example.com', '+1234567902', 'Mike', 'Brown', 'customer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'),
('550e8400-e29b-41d4-a716-446655440013', 'emma.customer@example.com', '+1234567903', 'Emma', 'Davis', 'customer', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'),
('550e8400-e29b-41d4-a716-446655440014', 'david.customer@example.com', '+1234567904', 'David', 'Miller', 'customer', 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face');

-- Insert business profiles
INSERT INTO business_profiles (id, user_id, business_name, description, address, city, country, postal_code, latitude, longitude, phone, email, website, instagram, facebook, working_hours, employees, rating, review_count) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Classic Cuts Barbershop', 'Traditional barbershop offering classic cuts, beard trims, and hot towel shaves. Established in 1995 with a commitment to quality and style.', '123 Main Street', 'New York', 'USA', '10001', 40.7128, -74.0060, '+1234567890', 'john.barber@example.com', 'https://classiccuts.com', '@classiccuts', 'ClassicCutsBarbershop', 
'{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "19:00"}, "friday": {"open": "09:00", "close": "19:00"}, "saturday": {"open": "08:00", "close": "17:00"}, "sunday": {"open": "10:00", "close": "16:00"}}',
'[{"name": "John Smith", "role": "Master Barber", "bio": "20+ years of experience in classic barbering"}, {"name": "Tom Wilson", "role": "Senior Barber", "bio": "Specialist in modern cuts and beard styling"}]',
4.8, 127),

('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Bella Vista Hair Salon', 'Full-service hair salon specializing in cuts, colors, styling, and treatments for all hair types. Modern techniques with personalized service.', '456 Fashion Ave', 'Los Angeles', 'USA', '90210', 34.0522, -118.2437, '+1234567891', 'maria.salon@example.com', 'https://bellavistasalon.com', '@bellavistasalon', 'BellaVistaSalon',
'{"monday": {"open": "10:00", "close": "19:00"}, "tuesday": {"open": "10:00", "close": "19:00"}, "wednesday": {"open": "10:00", "close": "19:00"}, "thursday": {"open": "10:00", "close": "20:00"}, "friday": {"open": "10:00", "close": "20:00"}, "saturday": {"open": "09:00", "close": "18:00"}, "sunday": {"open": "11:00", "close": "17:00"}}',
'[{"name": "Maria Garcia", "role": "Master Stylist", "bio": "Expert in color correction and modern styling techniques"}, {"name": "Lisa Chen", "role": "Senior Stylist", "bio": "Specialist in curly hair and natural textures"}, {"name": "Anna Rodriguez", "role": "Color Specialist", "bio": "Advanced colorist with expertise in balayage and highlights"}]',
4.9, 203),

('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Serenity Spa & Wellness', 'Luxury spa offering massage therapy, facials, body treatments, and wellness services. Your oasis of relaxation and rejuvenation.', '789 Wellness Blvd', 'Miami', 'USA', '33101', 25.7617, -80.1918, '+1234567892', 'alex.spa@example.com', 'https://serenityspa.com', '@serenityspa', 'SerenitySpaWellness',
'{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "21:00"}, "friday": {"open": "08:00", "close": "21:00"}, "saturday": {"open": "08:00", "close": "21:00"}, "sunday": {"open": "09:00", "close": "19:00"}}',
'[{"name": "Alex Johnson", "role": "Spa Director", "bio": "Licensed massage therapist and wellness expert"}, {"name": "Sophie Martinez", "role": "Esthetician", "bio": "Certified in advanced facial treatments and skincare"}, {"name": "James Lee", "role": "Massage Therapist", "bio": "Specialist in deep tissue and therapeutic massage"}]',
4.7, 89);

-- Insert services
INSERT INTO services (id, business_id, name, description, duration, price, category) VALUES
-- Classic Cuts Barbershop services
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Classic Haircut', 'Traditional scissor cut with styling', 30, 35.00, 'Haircut'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Beard Trim', 'Professional beard shaping and trimming', 20, 25.00, 'Grooming'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Hot Towel Shave', 'Traditional straight razor shave with hot towel', 45, 50.00, 'Grooming'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Haircut & Beard Combo', 'Complete grooming package', 50, 55.00, 'Package'),

-- Bella Vista Hair Salon services
('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 'Women\'s Cut & Style', 'Precision cut with blow dry and styling', 60, 85.00, 'Haircut'),
('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', 'Hair Color', 'Full color service with professional products', 120, 150.00, 'Color'),
('770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440002', 'Balayage Highlights', 'Hand-painted highlights for natural look', 180, 220.00, 'Color'),
('770e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440002', 'Deep Conditioning Treatment', 'Intensive hair repair and moisturizing', 45, 65.00, 'Treatment'),
('770e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440002', 'Blowout', 'Professional styling and blow dry', 30, 45.00, 'Styling'),

-- Serenity Spa services
('770e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440003', 'Swedish Massage', 'Relaxing full body massage', 60, 120.00, 'Massage'),
('770e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440003', 'Deep Tissue Massage', 'Therapeutic massage for muscle tension', 90, 160.00, 'Massage'),
('770e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440003', 'European Facial', 'Cleansing and rejuvenating facial treatment', 75, 110.00, 'Facial'),
('770e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440003', 'Hot Stone Massage', 'Relaxing massage with heated stones', 90, 180.00, 'Massage'),
('770e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440003', 'Body Wrap Treatment', 'Detoxifying and moisturizing body treatment', 60, 140.00, 'Body Treatment');

-- Insert portfolio items
INSERT INTO portfolio_items (id, business_id, service_id, title, description, image_url, tags) VALUES
-- Classic Cuts portfolio
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Classic Gentleman\'s Cut', 'Traditional side part with clean lines', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop', ARRAY['classic', 'professional', 'traditional']),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'Styled Beard Trim', 'Perfectly shaped beard with mustache styling', 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=400&h=400&fit=crop', ARRAY['beard', 'grooming', 'styling']),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 'Traditional Shave', 'Smooth finish with hot towel treatment', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop', ARRAY['shave', 'traditional', 'smooth']),

-- Bella Vista portfolio
('880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440013', 'Balayage Transformation', 'Natural sun-kissed highlights', 'https://images.unsplash.com/photo-1560869713-7d0954f92b8b?w=400&h=400&fit=crop', ARRAY['balayage', 'highlights', 'natural']),
('880e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440011', 'Modern Bob Cut', 'Sleek and sophisticated bob styling', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop', ARRAY['bob', 'modern', 'sleek']),
('880e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440012', 'Vibrant Color Change', 'Bold color transformation', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop', ARRAY['color', 'vibrant', 'transformation']),

-- Serenity Spa portfolio
('880e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440023', 'Relaxing Facial', 'Glowing skin after European facial', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop', ARRAY['facial', 'glowing', 'relaxing']),
('880e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440021', 'Spa Relaxation', 'Peaceful massage therapy session', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop', ARRAY['massage', 'relaxation', 'wellness']);

-- Insert business availability
INSERT INTO business_availability (business_id, day_of_week, start_time, end_time) VALUES
-- Classic Cuts availability (Monday=1, Sunday=0)
('660e8400-e29b-41d4-a716-446655440001', 1, '09:00', '18:00'), -- Monday
('660e8400-e29b-41d4-a716-446655440001', 2, '09:00', '18:00'), -- Tuesday
('660e8400-e29b-41d4-a716-446655440001', 3, '09:00', '18:00'), -- Wednesday
('660e8400-e29b-41d4-a716-446655440001', 4, '09:00', '19:00'), -- Thursday
('660e8400-e29b-41d4-a716-446655440001', 5, '09:00', '19:00'), -- Friday
('660e8400-e29b-41d4-a716-446655440001', 6, '08:00', '17:00'), -- Saturday
('660e8400-e29b-41d4-a716-446655440001', 0, '10:00', '16:00'), -- Sunday

-- Bella Vista availability
('660e8400-e29b-41d4-a716-446655440002', 1, '10:00', '19:00'), -- Monday
('660e8400-e29b-41d4-a716-446655440002', 2, '10:00', '19:00'), -- Tuesday
('660e8400-e29b-41d4-a716-446655440002', 3, '10:00', '19:00'), -- Wednesday
('660e8400-e29b-41d4-a716-446655440002', 4, '10:00', '20:00'), -- Thursday
('660e8400-e29b-41d4-a716-446655440002', 5, '10:00', '20:00'), -- Friday
('660e8400-e29b-41d4-a716-446655440002', 6, '09:00', '18:00'), -- Saturday
('660e8400-e29b-41d4-a716-446655440002', 0, '11:00', '17:00'), -- Sunday

-- Serenity Spa availability
('660e8400-e29b-41d4-a716-446655440003', 1, '08:00', '20:00'), -- Monday
('660e8400-e29b-41d4-a716-446655440003', 2, '08:00', '20:00'), -- Tuesday
('660e8400-e29b-41d4-a716-446655440003', 3, '08:00', '20:00'), -- Wednesday
('660e8400-e29b-41d4-a716-446655440003', 4, '08:00', '21:00'), -- Thursday
('660e8400-e29b-41d4-a716-446655440003', 5, '08:00', '21:00'), -- Friday
('660e8400-e29b-41d4-a716-446655440003', 6, '08:00', '21:00'), -- Saturday
('660e8400-e29b-41d4-a716-446655440003', 0, '09:00', '19:00'); -- Sunday

-- Insert sample appointments
INSERT INTO appointments (id, customer_id, business_id, service_id, employee_name, appointment_date, start_time, end_time, status, notes, total_price) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'John Smith', '2024-01-15', '10:00', '10:30', 'completed', 'Regular customer, prefers shorter on sides', 35.00),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440013', 'Maria Garcia', '2024-01-16', '14:00', '17:00', 'confirmed', 'First time balayage, consultation needed', 220.00),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440021', 'Alex Johnson', '2024-01-17', '11:00', '12:00', 'pending', 'Stress relief massage requested', 120.00),
('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440004', 'Tom Wilson', '2024-01-18', '15:30', '16:20', 'confirmed', 'Haircut and beard trim combo', 55.00);

-- Insert sample reviews
INSERT INTO reviews (customer_id, business_id, appointment_id, rating, comment) VALUES
('550e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 5, 'Excellent service as always! John is a master at his craft.'),
('550e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440002', 5, 'Amazing balayage work! Maria understood exactly what I wanted.'),
('550e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440003', 4, 'Very relaxing massage. The spa atmosphere is perfect for unwinding.');

-- Insert sample favorites
INSERT INTO favorites (customer_id, business_id) VALUES
('550e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440001');