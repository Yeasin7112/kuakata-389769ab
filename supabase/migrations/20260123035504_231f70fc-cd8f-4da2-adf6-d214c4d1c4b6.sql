-- Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hotel_owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'restaurant_owner';

-- Create hotel_rooms table for hotel owners to manage their rooms
CREATE TABLE public.hotel_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID NOT NULL,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_bn TEXT,
  description_en TEXT,
  image_url TEXT,
  price_per_night NUMERIC NOT NULL DEFAULT 0,
  max_guests INTEGER DEFAULT 2,
  room_type TEXT DEFAULT 'standard',
  amenities TEXT[],
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room_bookings table for travelers to book rooms
CREATE TABLE public.room_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.hotel_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  guests INTEGER DEFAULT 1,
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  phone TEXT,
  guest_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create food_items table for restaurant owners
CREATE TABLE public.food_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID NOT NULL,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_bn TEXT,
  description_en TEXT,
  image_url TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'main_course',
  is_available BOOLEAN DEFAULT true,
  is_vegetarian BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add owner_id to hotels table for hotel owners
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Add owner_id to restaurants table for restaurant owners
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for hotel_rooms
CREATE POLICY "Anyone can view active hotel rooms"
ON public.hotel_rooms FOR SELECT
USING (is_active = true AND is_available = true);

CREATE POLICY "Hotel owners can manage their rooms"
ON public.hotel_rooms FOR ALL
USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Hotel owners can insert their rooms"
ON public.hotel_rooms FOR INSERT
WITH CHECK (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for room_bookings
CREATE POLICY "Users can view their own bookings"
ON public.room_bookings FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings"
ON public.room_bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hotel owners can view bookings for their rooms"
ON public.room_bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.hotel_rooms hr
    WHERE hr.id = room_bookings.room_id AND hr.owner_id = auth.uid()
  )
);

CREATE POLICY "Hotel owners can update booking status"
ON public.room_bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.hotel_rooms hr
    WHERE hr.id = room_bookings.room_id AND hr.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all bookings"
ON public.room_bookings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for food_items
CREATE POLICY "Anyone can view active food items"
ON public.food_items FOR SELECT
USING (is_active = true);

CREATE POLICY "Restaurant owners can manage their food"
ON public.food_items FOR ALL
USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Restaurant owners can insert food"
ON public.food_items FOR INSERT
WITH CHECK (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for hotels (updated for owners)
CREATE POLICY "Hotel owners can manage their hotels"
ON public.hotels FOR UPDATE
USING (owner_id = auth.uid());

-- RLS policies for restaurants (updated for owners)
CREATE POLICY "Restaurant owners can manage their restaurants"
ON public.restaurants FOR UPDATE
USING (owner_id = auth.uid());

-- Storage policies for images bucket
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Triggers for updated_at
CREATE TRIGGER update_hotel_rooms_updated_at
BEFORE UPDATE ON public.hotel_rooms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_bookings_updated_at
BEFORE UPDATE ON public.room_bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_food_items_updated_at
BEFORE UPDATE ON public.food_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();