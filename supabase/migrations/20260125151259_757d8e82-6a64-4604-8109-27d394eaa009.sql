-- Create beach_chairs table for dynamic beach chair rental info
CREATE TABLE public.beach_chairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price_bn TEXT,
  price_en TEXT,
  timing_bn TEXT,
  timing_en TEXT,
  phone TEXT,
  features_bn TEXT[],
  features_en TEXT[],
  location_bn TEXT,
  location_en TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tour_services table for tour operators (speed boat, beach bike, etc.)
CREATE TABLE public.tour_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_bn TEXT,
  description_en TEXT,
  service_type TEXT NOT NULL, -- 'speed_boat', 'beach_bike', 'sundarbans', 'boat', 'houseboat'
  price_bn TEXT,
  price_en TEXT,
  phone TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create popular_foods table
CREATE TABLE public.popular_foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_bn TEXT,
  description_en TEXT,
  location_bn TEXT,
  location_en TEXT,
  price_range TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create children_rides table
CREATE TABLE public.children_rides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_bn TEXT,
  description_en TEXT,
  price_bn TEXT,
  price_en TEXT,
  location_bn TEXT,
  location_en TEXT,
  timing_bn TEXT,
  timing_en TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shopping_markets table
CREATE TABLE public.shopping_markets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_bn TEXT,
  description_en TEXT,
  category TEXT, -- 'rakhine', 'dried_fish', 'pickles', 'seafood', 'general'
  location_bn TEXT,
  location_en TEXT,
  timing_bn TEXT,
  timing_en TEXT,
  phone TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all new tables
ALTER TABLE public.beach_chairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popular_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children_rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_markets ENABLE ROW LEVEL SECURITY;

-- RLS policies for beach_chairs
CREATE POLICY "Anyone can view active beach chairs" ON public.beach_chairs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage beach chairs" ON public.beach_chairs
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS policies for tour_services
CREATE POLICY "Anyone can view active tour services" ON public.tour_services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tour services" ON public.tour_services
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS policies for popular_foods
CREATE POLICY "Anyone can view active popular foods" ON public.popular_foods
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage popular foods" ON public.popular_foods
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS policies for children_rides
CREATE POLICY "Anyone can view active children rides" ON public.children_rides
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage children rides" ON public.children_rides
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS policies for shopping_markets
CREATE POLICY "Anyone can view active shopping markets" ON public.shopping_markets
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage shopping markets" ON public.shopping_markets
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_beach_chairs_updated_at
  BEFORE UPDATE ON public.beach_chairs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tour_services_updated_at
  BEFORE UPDATE ON public.tour_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_popular_foods_updated_at
  BEFORE UPDATE ON public.popular_foods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_children_rides_updated_at
  BEFORE UPDATE ON public.children_rides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopping_markets_updated_at
  BEFORE UPDATE ON public.shopping_markets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();