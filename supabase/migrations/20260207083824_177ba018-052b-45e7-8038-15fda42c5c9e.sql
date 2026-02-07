
-- Create community chat messages table
CREATE TABLE public.community_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  user_name TEXT,
  avatar_url TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create banned users table
CREATE TABLE public.banned_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  banned_by UUID NOT NULL,
  reason TEXT,
  banned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_permanent BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.community_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- Community chat messages policies
-- Everyone authenticated can read non-deleted messages
CREATE POLICY "Anyone can read community messages"
ON public.community_chat_messages
FOR SELECT
TO authenticated
USING (is_deleted = false);

-- Authenticated users can insert their own messages (if not banned)
CREATE POLICY "Users can send community messages"
ON public.community_chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND NOT EXISTS (
    SELECT 1 FROM public.banned_users
    WHERE banned_users.user_id = auth.uid()
    AND (is_permanent = true OR expires_at > now())
  )
);

-- Admins can soft-delete any message
CREATE POLICY "Admins can update community messages"
ON public.community_chat_messages
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));

-- Banned users policies
-- Admins can view banned users
CREATE POLICY "Admins can view banned users"
ON public.banned_users
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));

-- Admins can ban users
CREATE POLICY "Admins can ban users"
ON public.banned_users
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));

-- Admins can unban users
CREATE POLICY "Admins can unban users"
ON public.banned_users
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));

-- Users can check their own ban status
CREATE POLICY "Users can check own ban status"
ON public.banned_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Enable realtime for community chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_chat_messages;
