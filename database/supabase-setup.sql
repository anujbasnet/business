-- Supabase Setup Script (schema only, no demo inserts)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'business')),
  full_name VARCHAR(200),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business profiles table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_name VARCHAR(200) NOT NULL,
  description TEXT,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  instagram VARCHAR(100),
  facebook VARCHAR(100),
  working_hours JSONB,
  employees JSONB,
  cover_photos TEXT[],
  main_cover_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio items table
CREATE TABLE IF NOT EXISTS public.portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  appointment_date VARCHAR(10) NOT NULL,
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table (for customers to save favorite businesses)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, business_id)
);

-- Clients table (for business to track their customers)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  notes TEXT,
  last_visit VARCHAR(10),
  visit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_services_business_id ON public.services(business_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_business_id ON public.portfolio(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON public.appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_business_id ON public.appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_favorites_customer_id ON public.favorites(customer_id);
CREATE INDEX IF NOT EXISTS idx_clients_business_id ON public.clients(business_id);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON public.portfolio FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration: create public.users on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Businesses policies
DROP POLICY IF EXISTS "Anyone can view businesses" ON public.businesses;
DROP POLICY IF EXISTS "Business owners can manage their business" ON public.businesses;
CREATE POLICY "Anyone can view businesses" ON public.businesses
  FOR SELECT USING (true);
CREATE POLICY "Business owners can manage their business" ON public.businesses
  FOR ALL USING (auth.uid() = user_id);

-- Services policies
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Business owners can manage their services" ON public.services;
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
DROP POLICY IF EXISTS "Anyone can view portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Business owners can manage their portfolio" ON public.portfolio;
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
DROP POLICY IF EXISTS "Users can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Business owners can manage appointments" ON public.appointments;
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
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customers can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can manage their reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Users can manage their reviews" ON public.reviews
  FOR ALL USING (auth.uid() = customer_id);

-- Favorites policies
DROP POLICY IF EXISTS "Users can view their favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage their favorites" ON public.favorites;
CREATE POLICY "Users can view their favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can manage their favorites" ON public.favorites
  FOR ALL USING (auth.uid() = customer_id);

-- Clients policies
DROP POLICY IF EXISTS "Business owners can view their clients" ON public.clients;
DROP POLICY IF EXISTS "Business owners can manage their clients" ON public.clients;
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

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
SELECT 'business-images', 'business-images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'business-images');
INSERT INTO storage.buckets (id, name, public)
SELECT 'portfolio-images', 'portfolio-images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'portfolio-images');
INSERT INTO storage.buckets (id, name, public)
SELECT 'user-avatars', 'user-avatars', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-avatars');

-- Storage policies
CREATE POLICY IF NOT EXISTS "Anyone can view business images" ON storage.objects
  FOR SELECT USING (bucket_id = 'business-images');
CREATE POLICY IF NOT EXISTS "Business owners can upload business images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'business-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY IF NOT EXISTS "Anyone can view portfolio images" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-images');
CREATE POLICY IF NOT EXISTS "Business owners can upload portfolio images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY IF NOT EXISTS "Anyone can view user avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');
CREATE POLICY IF NOT EXISTS "Users can upload their avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND auth.role() = 'authenticated'
  );

SELECT 'Schema setup completed successfully!' AS message;