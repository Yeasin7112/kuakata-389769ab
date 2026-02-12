
-- Add photographer role to enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'photographer';

-- Photographers table
CREATE TABLE public.photographers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name_bn text NOT NULL,
  name_en text NOT NULL,
  bio_bn text,
  bio_en text,
  phone text,
  whatsapp text,
  email text,
  profile_image_url text,
  portfolio_images text[] DEFAULT '{}',
  specializations text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  rating numeric DEFAULT 0,
  is_approved boolean DEFAULT false,
  is_active boolean DEFAULT true,
  commission_rate numeric DEFAULT 20,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.photographers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved photographers" ON public.photographers
  FOR SELECT USING (is_approved = true AND is_active = true);

CREATE POLICY "Photographers can view own profile" ON public.photographers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register as photographer" ON public.photographers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Photographers can update own profile" ON public.photographers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage photographers" ON public.photographers
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Photographer services / packages
CREATE TABLE public.photographer_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES public.photographers(id) ON DELETE CASCADE,
  name_bn text NOT NULL,
  name_en text NOT NULL,
  description_bn text,
  description_en text,
  price numeric NOT NULL DEFAULT 0,
  duration_minutes integer DEFAULT 60,
  service_type text NOT NULL DEFAULT 'photo_shoot',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.photographer_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services" ON public.photographer_services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Photographers can manage own services" ON public.photographer_services
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.photographers p WHERE p.id = photographer_services.photographer_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all services" ON public.photographer_services
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Photographer bookings
CREATE TABLE public.photographer_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES public.photographers(id),
  service_id uuid REFERENCES public.photographer_services(id),
  user_id uuid NOT NULL,
  booking_date date NOT NULL,
  booking_time text,
  location text,
  notes text,
  guest_name text,
  guest_phone text,
  status text NOT NULL DEFAULT 'pending',
  total_price numeric DEFAULT 0,
  commission_amount numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.photographer_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create bookings" ON public.photographer_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own bookings" ON public.photographer_bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Photographers can view their bookings" ON public.photographer_bookings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.photographers p WHERE p.id = photographer_bookings.photographer_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Photographers can update booking status" ON public.photographer_bookings
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.photographers p WHERE p.id = photographer_bookings.photographer_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all bookings" ON public.photographer_bookings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_photographers_updated_at BEFORE UPDATE ON public.photographers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_photographer_services_updated_at BEFORE UPDATE ON public.photographer_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_photographer_bookings_updated_at BEFORE UPDATE ON public.photographer_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
