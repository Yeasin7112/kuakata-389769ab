-- Add room_images table for gallery
CREATE TABLE public.room_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.hotel_rooms(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view room images
CREATE POLICY "Anyone can view room images"
ON public.room_images
FOR SELECT
USING (true);

-- Hotel owners can manage their room images
CREATE POLICY "Hotel owners can manage room images"
ON public.room_images
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.hotel_rooms hr
    WHERE hr.id = room_images.room_id AND hr.owner_id = auth.uid()
  )
);

-- Admins can manage all room images
CREATE POLICY "Admins can manage all room images"
ON public.room_images
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add notification_preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS push_subscription JSONB DEFAULT NULL;