
-- Add online status to local_guides
ALTER TABLE public.local_guides ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.local_guides ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE public.local_guides ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create chat_rooms table
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tourist_id UUID NOT NULL,
  guide_id UUID NOT NULL,
  guide_profile_id UUID REFERENCES public.local_guides(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tourist_id, guide_id)
);

-- Enable RLS on chat_rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- Chat rooms policies: participants can view their rooms
CREATE POLICY "Users can view their chat rooms"
  ON public.chat_rooms FOR SELECT
  USING (auth.uid() = tourist_id OR auth.uid() = guide_id);

CREATE POLICY "Users can create chat rooms"
  ON public.chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = tourist_id);

CREATE POLICY "Participants can update chat rooms"
  ON public.chat_rooms FOR UPDATE
  USING (auth.uid() = tourist_id OR auth.uid() = guide_id);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Messages policies: room participants can view/send messages
CREATE POLICY "Room participants can view messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_messages.room_id
      AND (tourist_id = auth.uid() OR guide_id = auth.uid())
    )
  );

CREATE POLICY "Room participants can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_messages.room_id
      AND (tourist_id = auth.uid() OR guide_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = chat_messages.room_id
      AND (tourist_id = auth.uid() OR guide_id = auth.uid())
    )
  );

-- Create index for fast message lookup
CREATE INDEX idx_chat_messages_room_id ON public.chat_messages(room_id, created_at);
CREATE INDEX idx_chat_rooms_tourist ON public.chat_rooms(tourist_id);
CREATE INDEX idx_chat_rooms_guide ON public.chat_rooms(guide_id);

-- Enable realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;

-- Function to update chat room's last message
CREATE OR REPLACE FUNCTION public.update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_rooms
  SET last_message = NEW.content,
      last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_new_chat_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_room_last_message();
