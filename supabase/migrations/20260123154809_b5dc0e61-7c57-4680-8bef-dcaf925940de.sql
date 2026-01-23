-- First, drop the existing restrictive INSERT policies
DROP POLICY IF EXISTS "Hotel owners can insert their hotels" ON public.hotels;
DROP POLICY IF EXISTS "Restaurant owners can insert their restaurants" ON public.restaurants;

-- Create simpler INSERT policies that just check owner_id matches
CREATE POLICY "Users can insert their own hotels" 
ON public.hotels FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own restaurants" 
ON public.restaurants FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Add UPDATE policies for owners to edit their hotels/restaurants
DROP POLICY IF EXISTS "Hotel owners can manage their hotels" ON public.hotels;
CREATE POLICY "Hotel owners can update their hotels" 
ON public.hotels FOR UPDATE 
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Restaurant owners can manage their restaurants" ON public.restaurants;
CREATE POLICY "Restaurant owners can update their restaurants" 
ON public.restaurants FOR UPDATE 
USING (auth.uid() = owner_id);

-- Create about_kuakata table for the about page content
CREATE TABLE IF NOT EXISTS public.about_kuakata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  title_bn text NOT NULL,
  title_en text NOT NULL,
  content_bn text,
  content_en text,
  image_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on about_kuakata
ALTER TABLE public.about_kuakata ENABLE ROW LEVEL SECURITY;

-- Create policies for about_kuakata
CREATE POLICY "Anyone can view active about sections" 
ON public.about_kuakata FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage about sections" 
ON public.about_kuakata FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default about content
INSERT INTO public.about_kuakata (section_key, title_bn, title_en, content_bn, content_en, display_order) VALUES
('history', 'কুয়াকাটার ইতিহাস', 'History of Kuakata', 
'কুয়াকাটা বাংলাদেশের দক্ষিণাঞ্চলে অবস্থিত একটি সমুদ্র সৈকত। এটি পটুয়াখালী জেলার কলাপাড়া উপজেলায় অবস্থিত। কুয়াকাটা সমুদ্র সৈকত প্রায় ১৮ কিলোমিটার দীর্ঘ। এই সৈকত থেকে সূর্যোদয় ও সূর্যাস্ত উভয়ই দেখা যায়, যা বাংলাদেশের অন্য কোনো সৈকত থেকে সম্ভব নয়।', 
'Kuakata is a beach in southern Bangladesh, located in Kalapara Upazila of Patuakhali District. The beach is about 18 kilometers long. Both sunrise and sunset can be viewed from this beach, which is not possible from any other beach in Bangladesh.',
1),
('geography', 'ভৌগোলিক অবস্থান', 'Geography', 
'কুয়াকাটা বঙ্গোপসাগরের উত্তর তীরে অবস্থিত। এটি ঢাকা থেকে প্রায় ৩২০ কিলোমিটার দক্ষিণে এবং খুলনা বিভাগ থেকে প্রায় ৭০ কিলোমিটার দক্ষিণে অবস্থিত।', 
'Kuakata is located on the northern shore of the Bay of Bengal. It is approximately 320 kilometers south of Dhaka and about 70 kilometers south of Khulna Division.',
2),
('attractions', 'দর্শনীয় স্থান', 'Attractions', 
'কুয়াকাটায় রাখাইন সম্প্রদায়ের বৌদ্ধ মন্দির, ফাতরার চর, গঙ্গামতির চর, এবং লাল কাঁকড়ার চর উল্লেখযোগ্য দর্শনীয় স্থান।', 
'Notable attractions in Kuakata include Rakhine Buddhist temples, Fatrar Char, Gangamati Char, and Lal Kakrar Char.',
3)
ON CONFLICT (section_key) DO NOTHING;

-- Create trigger for about_kuakata updated_at
CREATE TRIGGER update_about_kuakata_updated_at
  BEFORE UPDATE ON public.about_kuakata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();