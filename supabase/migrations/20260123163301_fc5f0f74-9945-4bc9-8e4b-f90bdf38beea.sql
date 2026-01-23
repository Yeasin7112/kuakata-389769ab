-- Allow users to insert their own role
CREATE POLICY "Users can insert their own role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Ensure the reviews table exists with proper constraints
-- It already exists per the types, but let's add realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;