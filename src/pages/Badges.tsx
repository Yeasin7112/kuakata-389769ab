import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { Award, Lock, Share2, Trophy, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface Badge {
  id: string;
  name_en: string;
  name_bn: string;
  description_en: string | null;
  description_bn: string | null;
  badge_type: string;
  requirement_type: string;
  requirement_value: number;
  points: number;
  icon_url: string | null;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  shared_on_facebook: boolean;
}

const Badges: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [userStats, setUserStats] = useState({
    reviewCount: 0,
    diaryCount: 0,
    photoCount: 0,
    answerCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    fetchBadges();
    if (user) {
      fetchUserBadges();
      fetchUserStats();
    }
  }, [user]);

  const fetchBadges = async () => {
    const { data } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('points', { ascending: true });
    
    setBadges(data || []);
    setLoading(false);
  };

  const fetchUserBadges = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id);
    
    setUserBadges(data || []);
    
    // Calculate total points
    if (data && badges.length > 0) {
      const points = data.reduce((sum, ub) => {
        const badge = badges.find(b => b.id === ub.badge_id);
        return sum + (badge?.points || 0);
      }, 0);
      setTotalPoints(points);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    // Get review count
    const { count: reviewCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get diary count
    const { count: diaryCount } = await supabase
      .from('diary_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get photo count
    const { count: photoCount } = await supabase
      .from('contest_photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get answer count
    const { count: answerCount } = await supabase
      .from('community_answers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    setUserStats({
      reviewCount: reviewCount || 0,
      diaryCount: diaryCount || 0,
      photoCount: photoCount || 0,
      answerCount: answerCount || 0,
    });
  };

  const hasBadge = (badgeId: string) => {
    return userBadges.some(ub => ub.badge_id === badgeId);
  };

  const getBadgeProgress = (badge: Badge) => {
    let current = 0;
    switch (badge.requirement_type) {
      case 'first_review':
      case 'review_count':
        current = userStats.reviewCount;
        break;
      case 'first_diary':
      case 'diary_count':
        current = userStats.diaryCount;
        break;
      case 'first_photo':
        current = userStats.photoCount;
        break;
      case 'answer_count':
        current = userStats.answerCount;
        break;
      default:
        current = 0;
    }
    return Math.min((current / badge.requirement_value) * 100, 100);
  };

  const shareOnFacebook = (badge: Badge) => {
    const text = language === 'bn' 
      ? `আমি কুয়াকাটা ট্যুরিস্ট গাইড অ্যাপে "${badge.name_bn}" ব্যাজ অর্জন করেছি! 🏆`
      : `I earned the "${badge.name_en}" badge on Kuakata Tourist Guide app! 🏆`;
    
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
    
    toast({
      title: language === 'bn' ? 'শেয়ার করা হচ্ছে' : 'Sharing',
      description: language === 'bn' ? 'ফেসবুকে শেয়ার করুন' : 'Share on Facebook',
    });
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Award className="w-8 h-8" />;
      case 'milestone': return <Star className="w-8 h-8" />;
      case 'special': return <Trophy className="w-8 h-8" />;
      default: return <Award className="w-8 h-8" />;
    }
  };

  const getBadgeColor = (type: string, earned: boolean) => {
    if (!earned) return 'bg-muted text-muted-foreground';
    switch (type) {
      case 'achievement': return 'bg-blue-500 text-white';
      case 'milestone': return 'bg-amber-500 text-white';
      case 'special': return 'bg-purple-500 text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title={language === 'bn' ? 'ব্যাজ সংগ্রহ' : 'Badge Collection'} />
      
      <main className="container mx-auto px-4 py-4">
        {/* User Stats Summary */}
        {user && (
          <div className="card-elevated p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold font-bangla">
                  {language === 'bn' ? 'আপনার অর্জন' : 'Your Achievements'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {userBadges.length} / {badges.length} {language === 'bn' ? 'ব্যাজ অর্জিত' : 'badges earned'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{totalPoints}</div>
                <div className="text-xs text-muted-foreground">
                  {language === 'bn' ? 'পয়েন্ট' : 'Points'}
                </div>
              </div>
            </div>
            <Progress value={(userBadges.length / badges.length) * 100} className="h-2" />
          </div>
        )}

        {!user && (
          <div className="card-elevated p-6 text-center mb-6">
            <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground font-bangla">
              {language === 'bn' ? 'ব্যাজ অর্জন করতে লগইন করুন' : 'Login to earn badges'}
            </p>
          </div>
        )}

        {/* Badges Grid */}
        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="card-elevated p-4 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3" />
                <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2" />
                <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
              </div>
            ))
          ) : (
            badges.map((badge) => {
              const earned = hasBadge(badge.id);
              const progress = getBadgeProgress(badge);
              
              return (
                <div 
                  key={badge.id} 
                  className={`card-elevated p-4 text-center relative ${earned ? 'ring-2 ring-primary' : 'opacity-75'}`}
                >
                  {earned && (
                    <div className="absolute -top-2 -right-2">
                      <CheckCircle className="w-6 h-6 text-green-500 fill-white" />
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${getBadgeColor(badge.badge_type, earned)}`}>
                    {earned ? getBadgeIcon(badge.badge_type) : <Lock className="w-8 h-8" />}
                  </div>
                  
                  <h3 className="font-bold text-sm font-bangla mb-1">
                    {language === 'bn' ? badge.name_bn : badge.name_en}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground mb-2 font-bangla line-clamp-2">
                    {language === 'bn' ? badge.description_bn : badge.description_en}
                  </p>
                  
                  <div className="flex items-center justify-center gap-1 text-xs text-amber-600 mb-2">
                    <Trophy className="w-3 h-3" />
                    <span>{badge.points} {language === 'bn' ? 'পয়েন্ট' : 'pts'}</span>
                  </div>
                  
                  {!earned && user && (
                    <div className="mt-2">
                      <Progress value={progress} className="h-1 mb-1" />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  )}
                  
                  {earned && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2 gap-1"
                      onClick={() => shareOnFacebook(badge)}
                    >
                      <Share2 className="w-3 h-3" />
                      {language === 'bn' ? 'শেয়ার' : 'Share'}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Badges;
