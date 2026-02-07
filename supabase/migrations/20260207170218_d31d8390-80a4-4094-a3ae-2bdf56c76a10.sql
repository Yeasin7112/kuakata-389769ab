
-- Create mosque_prayer_times table
CREATE TABLE public.mosque_prayer_times (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  address_bn TEXT,
  address_en TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  fajr TEXT NOT NULL DEFAULT '05:00',
  dhuhr TEXT NOT NULL DEFAULT '12:00',
  asr TEXT NOT NULL DEFAULT '15:30',
  maghrib TEXT NOT NULL DEFAULT '18:00',
  isha TEXT NOT NULL DEFAULT '19:30',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mosque_prayer_times ENABLE ROW LEVEL SECURITY;

-- Everyone can read mosque prayer times
CREATE POLICY "Anyone can view mosque prayer times"
  ON public.mosque_prayer_times
  FOR SELECT
  USING (true);

-- Admins can manage mosque prayer times (check via user_roles table)
CREATE POLICY "Admins can insert mosque prayer times"
  ON public.mosque_prayer_times
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update mosque prayer times"
  ON public.mosque_prayer_times
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete mosque prayer times"
  ON public.mosque_prayer_times
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Add map_url to banks table (optional field for Google Maps link)
ALTER TABLE public.banks ADD COLUMN IF NOT EXISTS map_url TEXT;
