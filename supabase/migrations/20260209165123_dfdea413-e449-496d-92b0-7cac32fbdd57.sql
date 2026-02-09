
-- Donation payment settings (admin configures bKash/Nagad/Rocket/Bank details)
CREATE TABLE public.donation_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  method_type TEXT NOT NULL,
  account_name TEXT,
  account_number TEXT,
  bank_name TEXT,
  branch_name TEXT,
  routing_number TEXT,
  instructions_bn TEXT,
  instructions_en TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Donations submitted by users
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT NOT NULL,
  donor_phone TEXT,
  donor_email TEXT,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  sender_number TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  thanked BOOLEAN DEFAULT false,
  thank_method TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Public can view active donation settings
CREATE POLICY "Anyone can view active donation settings"
  ON public.donation_settings FOR SELECT USING (is_active = true);

-- Admin write access to settings
CREATE POLICY "Admins can manage donation settings"
  ON public.donation_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Anyone can submit a donation
CREATE POLICY "Anyone can submit a donation"
  ON public.donations FOR INSERT WITH CHECK (true);

-- Admins can view/update/delete donations
CREATE POLICY "Admins can view all donations"
  ON public.donations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update donations"
  ON public.donations FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete donations"
  ON public.donations FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
