-- Create saved_places table for user favorites
CREATE TABLE public.saved_places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, place_id)
);

-- Enable RLS
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_places
CREATE POLICY "Users can view own saved places" ON public.saved_places
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved places" ON public.saved_places
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved places" ON public.saved_places
FOR DELETE USING (auth.uid() = user_id);

-- Create bus_counters table
CREATE TABLE public.bus_counters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  counter_number TEXT,
  location_bn TEXT,
  location_en TEXT,
  phone TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bus_counters ENABLE ROW LEVEL SECURITY;

-- RLS policies for bus_counters
CREATE POLICY "Anyone can view active bus counters" ON public.bus_counters
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage bus counters" ON public.bus_counters
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create dc_initiatives table
CREATE TABLE public.dc_initiatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_bn TEXT,
  description_en TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'planned',
  target_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dc_initiatives ENABLE ROW LEVEL SECURITY;

-- RLS policies for dc_initiatives
CREATE POLICY "Anyone can view active dc initiatives" ON public.dc_initiatives
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage dc initiatives" ON public.dc_initiatives
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create place_images table for multiple photos per place
CREATE TABLE public.place_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.place_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for place_images
CREATE POLICY "Anyone can view place images" ON public.place_images
FOR SELECT USING (true);

CREATE POLICY "Admins can manage place images" ON public.place_images
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add image_url to complaints table for photo uploads
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add triggers for updated_at
CREATE TRIGGER update_bus_counters_updated_at
BEFORE UPDATE ON public.bus_counters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dc_initiatives_updated_at
BEFORE UPDATE ON public.dc_initiatives
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();