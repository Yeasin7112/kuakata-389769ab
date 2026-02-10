
-- 1. COUPON SYSTEM
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'flat' or 'percentage'
  discount_value NUMERIC NOT NULL DEFAULT 0,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE, -- null means all hotels
  created_by UUID NOT NULL, -- admin or hotel owner
  min_booking_amount NUMERIC DEFAULT 0,
  max_discount NUMERIC DEFAULT NULL, -- max discount for percentage type
  usage_limit INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Hotel owners can manage their coupons" ON public.coupons FOR ALL USING (
  public.has_role(auth.uid(), 'hotel_owner') AND (
    hotel_id IN (SELECT id FROM public.hotels WHERE owner_id = auth.uid())
    OR created_by = auth.uid()
  )
);

-- Add coupon fields to room_bookings
ALTER TABLE public.room_bookings ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupons(id);
ALTER TABLE public.room_bookings ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE public.room_bookings ADD COLUMN IF NOT EXISTS original_price NUMERIC;

-- 2. COMMISSION SYSTEM
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 0;

CREATE TABLE public.commission_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.room_bookings(id) ON DELETE CASCADE,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
  booking_amount NUMERIC NOT NULL,
  commission_rate NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, collected
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all commissions" ON public.commission_earnings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage commissions" ON public.commission_earnings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 3. FEATURED LISTINGS
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE DEFAULT NULL;
