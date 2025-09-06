-- Supabase Setup Script
-- This script sets up the complete database schema and initial data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'business')),
  full_name VARCHAR(200),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business profiles table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  business_name VARCHAR(200) NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  instagram VARCHAR(100),
  facebook VARCHAR(100),
  telegram VARCHAR(100),
  youtube VARCHAR(100),
  tiktok VARCHAR(100),
  twitter VARCHAR(100),
  working_hours JSONB,
  employees TEXT[],
  cover_photos TEXT[],
  main_cover_photo TEXT,
  bio TEXT,
  business_type VARCHAR(100),
  service_type VARCHAR(100),
  is_accepting_bookings BOOLEAN DEFAULT true,
  booking_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio items table
CREATE TABLE public.portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_category VARCHAR(100),
  date VARCHAR(10), -- YYYY-MM-DD format
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  client_name VARCHAR(200) NOT NULL,
  client_phone VARCHAR(20),
  client_email VARCHAR(255),
  appointment_date VARCHAR(10) NOT NULL, -- YYYY-MM-DD format
  start_time VARCHAR(5) NOT NULL, -- HH:MM format
  end_time VARCHAR(5) NOT NULL, -- HH:MM format
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  total_price DECIMAL(10, 2) NOT NULL,
  booking_source VARCHAR(20) DEFAULT 'bronapp',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table (for customers to save favorite businesses)
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, business_id)
);

-- Clients table (for business to track their customers)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  notes TEXT,
  last_visit VARCHAR(10), -- YYYY-MM-DD format
  upcoming_appointment VARCHAR(10), -- YYYY-MM-DD format
  visit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_user_type ON public.users(user_type);
CREATE INDEX idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX idx_services_business_id ON public.services(business_id);
CREATE INDEX idx_portfolio_business_id ON public.portfolio(business_id);
CREATE INDEX idx_appointments_customer_id ON public.appointments(customer_id);
CREATE INDEX idx_appointments_business_id ON public.appointments(business_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX idx_favorites_customer_id ON public.favorites(customer_id);
CREATE INDEX idx_clients_business_id ON public.clients(business_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON public.portfolio FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Businesses policies
CREATE POLICY "Anyone can view businesses" ON public.businesses
  FOR SELECT USING (true);

CREATE POLICY "Business owners can manage their business" ON public.businesses
  FOR ALL USING (auth.uid() = user_id);

-- Services policies
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Business owners can manage their services" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = services.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

-- Portfolio policies
CREATE POLICY "Anyone can view portfolio" ON public.portfolio
  FOR SELECT USING (true);

CREATE POLICY "Business owners can manage their portfolio" ON public.portfolio
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = portfolio.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

-- Appointments policies
CREATE POLICY "Users can view their appointments" ON public.appointments
  FOR SELECT USING (
    auth.uid() = customer_id OR 
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = appointments.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Business owners can manage appointments" ON public.appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = appointments.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can manage their reviews" ON public.reviews
  FOR ALL USING (auth.uid() = customer_id);

-- Favorites policies
CREATE POLICY "Users can view their favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can manage their favorites" ON public.favorites
  FOR ALL USING (auth.uid() = customer_id);

-- Clients policies
CREATE POLICY "Business owners can view their clients" ON public.clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = clients.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can manage their clients" ON public.clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE businesses.id = clients.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('business-images', 'business-images', true),
  ('portfolio-images', 'portfolio-images', true),
  ('user-avatars', 'user-avatars', true);

-- Storage policies
CREATE POLICY "Anyone can view business images" ON storage.objects
  FOR SELECT USING (bucket_id = 'business-images');

CREATE POLICY "Business owners can upload business images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'business-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view portfolio images" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-images');

CREATE POLICY "Business owners can upload portfolio images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Anyone can view user avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND
    auth.role() = 'authenticated'
  );

-- Insert mock data

-- Create a demo business user first (this would normally be done through auth.users)
-- For demo purposes, we'll create the user record directly
INSERT INTO public.users (id, email, user_type, full_name, phone, avatar_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'demo@elitebarbershop.com', 'business', 'Elite Barber Shop Owner', '(555) 123-4567', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face');

-- Insert demo business
INSERT INTO public.businesses (id, user_id, business_name, description, address, phone, email, website, instagram, facebook, telegram, youtube, tiktok, twitter, working_hours, employees, cover_photos, main_cover_photo, bio, business_type, service_type, is_accepting_bookings, booking_settings) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Elite Barber Shop', 'Elite Barber Shop has been providing premium grooming services since 2010. Our team of skilled barbers specializes in classic and modern styles, beard grooming, and premium shaving services.', '123 Main Street, Anytown, USA', '(555) 123-4567', 'contact@elitebarbershop.com', 'https://elitebarbershop.com', 'https://instagram.com/elitebarbershop', 'https://facebook.com/EliteBarberShop', 'https://t.me/elitebarbershop', '', 'https://tiktok.com/@elitebarbershop', '', 
'{
  "monday": {"isOpen": true, "openTime": "09:00", "closeTime": "18:00"},
  "tuesday": {"isOpen": true, "openTime": "09:00", "closeTime": "18:00"},
  "wednesday": {"isOpen": true, "openTime": "09:00", "closeTime": "18:00"},
  "thursday": {"isOpen": true, "openTime": "09:00", "closeTime": "20:00"},
  "friday": {"isOpen": true, "openTime": "09:00", "closeTime": "20:00"},
  "saturday": {"isOpen": true, "openTime": "10:00", "closeTime": "16:00"},
  "sunday": {"isOpen": false, "openTime": "", "closeTime": ""}
}',
ARRAY['John Smith - Master Barber', 'Mike Johnson - Senior Barber', 'Alex Brown - Barber'],
ARRAY[
  'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1622286346003-c2d4e2e8b8b8?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop'
],
'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=800&h=400&fit=crop',
'Elite Barber Shop has been providing premium grooming services since 2010. Our team of skilled barbers specializes in classic and modern styles, beard grooming, and premium shaving services.',
'Barber Shop',
'Hair & Grooming Services',
true,
'{
  "advanceBookingDays": 30,
  "cancellationPolicy": "Cancellations must be made at least 24 hours in advance.",
  "requiresConfirmation": true
}');

-- Insert demo services
INSERT INTO public.services (id, business_id, name, description, duration, price, category) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Haircut & Styling', 'Professional haircut with styling according to client preference.', 45, 35.00, 'Hair'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Beard Trim', 'Precision beard trimming and shaping.', 30, 20.00, 'Facial Hair'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Full Service (Haircut & Beard)', 'Complete haircut and beard trim package.', 60, 50.00, 'Combo'),
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Hair Coloring', 'Professional hair coloring service.', 90, 75.00, 'Hair'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Hot Towel Shave', 'Traditional hot towel shave with straight razor.', 45, 40.00, 'Facial Hair'),
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', 'Kids Haircut', 'Haircut for children under 12.', 30, 25.00, 'Hair'),
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', 'Head Shave', 'Complete head shave with razor.', 30, 30.00, 'Hair'),
('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440001', 'Facial Treatment', 'Cleansing and rejuvenating facial treatment.', 45, 45.00, 'Skin Care');

-- Insert demo portfolio items
INSERT INTO public.portfolio (id, business_id, title, description, image_url, service_id, service_category, date) VALUES
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Classic fade with textured top', 'Classic fade with textured top', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1', '770e8400-e29b-41d4-a716-446655440001', 'Hair', '2025-06-10'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Modern pompadour style', 'Modern pompadour style', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033', '770e8400-e29b-41d4-a716-446655440001', 'Hair', '2025-06-15'),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Full beard grooming and styling', 'Full beard grooming and styling', 'https://images.unsplash.com/photo-1598524374912-6b0b0bdd00f9', '770e8400-e29b-41d4-a716-446655440002', 'Facial Hair', '2025-06-20'),
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Platinum blonde color transformation', 'Platinum blonde color transformation', 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f', '770e8400-e29b-41d4-a716-446655440004', 'Hair', '2025-06-25'),
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Precision beard line-up', 'Precision beard line-up', 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c', '770e8400-e29b-41d4-a716-446655440002', 'Facial Hair', '2025-07-01'),
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', 'Short textured crop with fade', 'Short textured crop with fade', 'https://images.unsplash.com/photo-1519699047748-de8e457a634e', '770e8400-e29b-41d4-a716-446655440001', 'Hair', '2025-07-05');

-- Insert demo clients
INSERT INTO public.clients (id, business_id, name, phone, email, notes, last_visit, upcoming_appointment, visit_count) VALUES
('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'John Smith', '(555) 123-4567', 'john.smith@example.com', 'Prefers appointments in the morning. Likes classic styles.', '2025-07-01', '2025-07-13', 5),
('990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Michael Johnson', '(555) 234-5678', 'michael.johnson@example.com', 'Sensitive scalp, use gentle products.', '2025-06-15', '2025-07-13', 3),
('990e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'David Williams', '(555) 345-6789', 'david.williams@example.com', 'New client, referred by John Smith.', NULL, '2025-07-13', 0),
('990e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Robert Brown', '(555) 456-7890', 'robert.brown@example.com', NULL, '2025-06-30', '2025-07-14', 2),
('990e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'James Miller', '(555) 567-8901', 'james.miller@example.com', 'Likes to experiment with different styles and colors.', '2025-06-20', '2025-07-14', 4),
('990e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', 'Thomas Davis', '(555) 678-9012', 'thomas.davis@example.com', NULL, '2025-06-10', '2025-07-15', 1),
('990e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', 'Daniel Wilson', '(555) 789-0123', 'daniel.wilson@example.com', 'Prefers evening appointments.', '2025-06-05', NULL, 2),
('990e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440001', 'Matthew Taylor', '(555) 890-1234', 'matthew.taylor@example.com', NULL, '2025-05-25', NULL, 1),
('990e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440001', 'Christopher Anderson', '(555) 901-2345', 'christopher.anderson@example.com', 'Allergic to certain hair products. Check before using new products.', '2025-05-15', NULL, 3),
('990e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440001', 'Anthony Thomas', '(555) 012-3456', 'anthony.thomas@example.com', NULL, '2025-05-10', NULL, 1);

-- Insert demo appointments
INSERT INTO public.appointments (id, customer_id, business_id, service_id, client_name, client_phone, client_email, appointment_date, start_time, end_time, status, notes, total_price, booking_source) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'John Smith', '+1234567890', 'john.smith@email.com', '2025-01-15', '10:00', '10:45', 'confirmed', 'Regular client, prefers scissors over clippers', 35.00, 'bronapp'),
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'Michael Johnson', '+1234567891', 'michael.j@email.com', '2025-01-15', '11:00', '11:30', 'confirmed', NULL, 20.00, 'direct'),
('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 'David Williams', '+1234567892', 'david.w@email.com', '2025-01-15', '13:00', '14:00', 'pending', 'New client', 50.00, 'bronapp'),
('aa0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Robert Brown', '+1234567893', NULL, '2025-01-16', '09:30', '10:15', 'confirmed', NULL, 35.00, 'phone'),
('aa0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440004', 'James Miller', '+1234567894', 'james.miller@email.com', '2025-01-16', '14:00', '15:30', 'confirmed', 'Wants to try a new color', 75.00, 'bronapp'),
('aa0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'John Smith', '+1234567890', 'john.smith@email.com', '2025-01-17', '10:00', '10:30', 'confirmed', NULL, 20.00, 'direct'),
('aa0e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440005', 'Thomas Davis', '+1234567895', NULL, '2025-01-17', '11:00', '11:45', 'pending', NULL, 40.00, 'bronapp');

-- Success message
SELECT 'Supabase setup completed successfully!' as message;