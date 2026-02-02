-- Create table for tour service images
CREATE TABLE public.tour_service_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_service_id UUID NOT NULL REFERENCES public.tour_services(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for popular food images
CREATE TABLE public.popular_food_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  popular_food_id UUID NOT NULL REFERENCES public.popular_foods(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tour_service_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popular_food_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for tour_service_images
CREATE POLICY "Anyone can view tour service images" ON public.tour_service_images
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tour service images" ON public.tour_service_images
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for popular_food_images
CREATE POLICY "Anyone can view popular food images" ON public.popular_food_images
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage popular food images" ON public.popular_food_images
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_tour_service_images_tour_service_id ON public.tour_service_images(tour_service_id);
CREATE INDEX idx_popular_food_images_popular_food_id ON public.popular_food_images(popular_food_id);