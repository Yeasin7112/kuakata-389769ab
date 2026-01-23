-- Allow hotel owners to insert their own hotels
CREATE POLICY "Hotel owners can insert their hotels" 
ON public.hotels 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id AND has_role(auth.uid(), 'hotel_owner'::app_role));

-- Allow restaurant owners to insert their own restaurants
CREATE POLICY "Restaurant owners can insert their restaurants" 
ON public.restaurants 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id AND has_role(auth.uid(), 'restaurant_owner'::app_role));

-- Allow hotel owners to delete their own hotels
CREATE POLICY "Hotel owners can delete their hotels" 
ON public.hotels 
FOR DELETE 
USING (owner_id = auth.uid());