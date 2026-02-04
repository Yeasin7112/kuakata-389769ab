-- =============================================
-- BADGE SYSTEM
-- =============================================

-- Badge definitions table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL,
  description_en TEXT,
  description_bn TEXT,
  icon_url TEXT,
  badge_type TEXT NOT NULL DEFAULT 'achievement', -- achievement, milestone, special
  requirement_type TEXT NOT NULL, -- review_count, place_visit, first_review, etc.
  requirement_value INTEGER DEFAULT 1,
  points INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User earned badges
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  shared_on_facebook BOOLEAN DEFAULT false,
  UNIQUE(user_id, badge_id)
);

-- =============================================
-- PHOTO CONTEST SYSTEM
-- =============================================

-- Photo contests
CREATE TABLE public.photo_contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_bn TEXT NOT NULL,
  description_en TEXT,
  description_bn TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  voting_end_date DATE,
  prize_en TEXT,
  prize_bn TEXT,
  status TEXT DEFAULT 'upcoming', -- upcoming, active, voting, completed
  winner_photo_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Contest photo submissions
CREATE TABLE public.contest_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES public.photo_contests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  caption_en TEXT,
  caption_bn TEXT,
  location_name TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_winner BOOLEAN DEFAULT false,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Photo votes
CREATE TABLE public.photo_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID REFERENCES public.contest_photos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(photo_id, user_id)
);

-- =============================================
-- DIGITAL TRAVEL DIARY
-- =============================================

-- Travel diary entries
CREATE TABLE public.diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  content TEXT,
  mood TEXT, -- happy, excited, relaxed, adventurous
  weather TEXT,
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  visit_date DATE DEFAULT CURRENT_DATE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Diary photos
CREATE TABLE public.diary_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_entry_id UUID REFERENCES public.diary_entries(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Generated travel stories
CREATE TABLE public.travel_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title_en TEXT,
  title_bn TEXT,
  content_en TEXT,
  content_bn TEXT,
  cover_image_url TEXT,
  start_date DATE,
  end_date DATE,
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- COMMUNITY Q&A
-- =============================================

-- Questions
CREATE TABLE public.community_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT, -- hotels, transport, places, food, general
  is_answered BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Answers
CREATE TABLE public.community_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.community_questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  is_from_local BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Answer upvotes
CREATE TABLE public.answer_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID REFERENCES public.community_answers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(answer_id, user_id)
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_upvotes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Badges: Everyone can view, only system awards
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);
CREATE POLICY "User badges viewable by everyone" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can view own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own badge shares" ON public.user_badges FOR UPDATE USING (auth.uid() = user_id);

-- Photo Contests: Public viewing, authenticated submissions
CREATE POLICY "Contests viewable by everyone" ON public.photo_contests FOR SELECT USING (true);
CREATE POLICY "Approved photos viewable by everyone" ON public.contest_photos FOR SELECT USING (is_approved = true OR auth.uid() = user_id);
CREATE POLICY "Users can submit photos" ON public.contest_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON public.contest_photos FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Votes viewable by voters" ON public.photo_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can vote" ON public.photo_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove vote" ON public.photo_votes FOR DELETE USING (auth.uid() = user_id);

-- Diary: Private by default, public if shared
CREATE POLICY "Users see own diary entries" ON public.diary_entries FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create diary entries" ON public.diary_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON public.diary_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON public.diary_entries FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Diary photos follow entry access" ON public.diary_photos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.diary_entries WHERE id = diary_entry_id AND (user_id = auth.uid() OR is_public = true))
);
CREATE POLICY "Users can add diary photos" ON public.diary_photos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.diary_entries WHERE id = diary_entry_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete diary photos" ON public.diary_photos FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.diary_entries WHERE id = diary_entry_id AND user_id = auth.uid())
);

-- Travel Stories
CREATE POLICY "Public stories viewable by all" ON public.travel_stories FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create stories" ON public.travel_stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stories" ON public.travel_stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON public.travel_stories FOR DELETE USING (auth.uid() = user_id);

-- Community Q&A
CREATE POLICY "Approved questions viewable by all" ON public.community_questions FOR SELECT USING (is_approved = true OR auth.uid() = user_id);
CREATE POLICY "Users can ask questions" ON public.community_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own questions" ON public.community_questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own questions" ON public.community_questions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Approved answers viewable by all" ON public.community_answers FOR SELECT USING (is_approved = true OR auth.uid() = user_id);
CREATE POLICY "Users can answer" ON public.community_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own answers" ON public.community_answers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own answers" ON public.community_answers FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Upvotes viewable by voter" ON public.answer_upvotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upvote" ON public.answer_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove upvote" ON public.answer_upvotes FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- INSERT DEFAULT BADGES
-- =============================================

INSERT INTO public.badges (name_en, name_bn, description_en, description_bn, badge_type, requirement_type, requirement_value, points) VALUES
('First Explorer', 'প্রথম অভিযাত্রী', 'Left your first review', 'আপনার প্রথম রিভিউ দিয়েছেন', 'achievement', 'first_review', 1, 10),
('Beach Lover', 'সৈকত প্রেমী', 'Reviewed 5 places', '৫টি স্থানে রিভিউ দিয়েছেন', 'milestone', 'review_count', 5, 25),
('Kuakata Expert', 'কুয়াকাটা বিশেষজ্ঞ', 'Reviewed 10 places', '১০টি স্থানে রিভিউ দিয়েছেন', 'milestone', 'review_count', 10, 50),
('Food Critic', 'খাদ্য সমালোচক', 'Reviewed 3 restaurants', '৩টি রেস্তোরাঁয় রিভিউ দিয়েছেন', 'achievement', 'restaurant_review', 3, 30),
('Hotel Reviewer', 'হোটেল রিভিউয়ার', 'Reviewed 3 hotels', '৩টি হোটেলে রিভিউ দিয়েছেন', 'achievement', 'hotel_review', 3, 30),
('Storyteller', 'গল্পকার', 'Created your first travel diary', 'আপনার প্রথম ভ্রমণ ডায়েরি তৈরি করেছেন', 'achievement', 'first_diary', 1, 15),
('Memory Keeper', 'স্মৃতি রক্ষক', 'Created 5 diary entries', '৫টি ডায়েরি এন্ট্রি তৈরি করেছেন', 'milestone', 'diary_count', 5, 40),
('Photographer', 'আলোকচিত্রী', 'Submitted a contest photo', 'প্রতিযোগিতায় ছবি জমা দিয়েছেন', 'achievement', 'first_photo', 1, 20),
('Contest Winner', 'প্রতিযোগিতা বিজয়ী', 'Won a photo contest', 'ফটো প্রতিযোগিতায় জয়ী হয়েছেন', 'special', 'contest_winner', 1, 100),
('Helper', 'সহায়ক', 'Answered 5 community questions', '৫টি প্রশ্নের উত্তর দিয়েছেন', 'achievement', 'answer_count', 5, 35),
('Local Expert', 'স্থানীয় বিশেষজ্ঞ', 'Had an answer accepted', 'আপনার উত্তর গৃহীত হয়েছে', 'achievement', 'accepted_answer', 1, 25);