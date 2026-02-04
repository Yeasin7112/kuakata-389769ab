import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { Camera, Heart, Trophy, Upload, Calendar, Award, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Contest {
  id: string;
  title_en: string;
  title_bn: string;
  description_en: string | null;
  description_bn: string | null;
  start_date: string;
  end_date: string;
  voting_end_date: string | null;
  prize_en: string | null;
  prize_bn: string | null;
  status: string;
}

interface ContestPhoto {
  id: string;
  contest_id: string;
  user_id: string;
  image_url: string;
  caption_en: string | null;
  caption_bn: string | null;
  location_name: string | null;
  is_approved: boolean;
  is_winner: boolean;
  vote_count: number;
}

const PhotoContest: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [photos, setPhotos] = useState<ContestPhoto[]>([]);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  
  // Submission form state
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    if (selectedContest) {
      fetchPhotos(selectedContest.id);
      if (user) fetchUserVotes(selectedContest.id);
    }
  }, [selectedContest, user]);

  const fetchContests = async () => {
    const { data } = await supabase
      .from('photo_contests')
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: false });
    
    setContests(data || []);
    if (data && data.length > 0) {
      setSelectedContest(data[0]);
    }
    setLoading(false);
  };

  const fetchPhotos = async (contestId: string) => {
    const { data } = await supabase
      .from('contest_photos')
      .select('*')
      .eq('contest_id', contestId)
      .eq('is_approved', true)
      .order('vote_count', { ascending: false });
    
    setPhotos(data || []);
  };

  const fetchUserVotes = async (contestId: string) => {
    if (!user) return;
    
    const { data } = await supabase
      .from('photo_votes')
      .select('photo_id')
      .eq('user_id', user.id);
    
    setUserVotes(data?.map(v => v.photo_id) || []);
  };

  const handleVote = async (photoId: string) => {
    if (!user) {
      toast({
        title: language === 'bn' ? 'লগইন করুন' : 'Please login',
        description: language === 'bn' ? 'ভোট দিতে লগইন করুন' : 'Login to vote',
        variant: 'destructive',
      });
      return;
    }

    const hasVoted = userVotes.includes(photoId);

    if (hasVoted) {
      // Remove vote
      await supabase
        .from('photo_votes')
        .delete()
        .eq('photo_id', photoId)
        .eq('user_id', user.id);
      
      setUserVotes(prev => prev.filter(id => id !== photoId));
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, vote_count: p.vote_count - 1 } : p
      ));
    } else {
      // Add vote
      await supabase
        .from('photo_votes')
        .insert({ photo_id: photoId, user_id: user.id });
      
      setUserVotes(prev => [...prev, photoId]);
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, vote_count: p.vote_count + 1 } : p
      ));
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedContest) return;
    
    if (!imageUrl.trim()) {
      toast({
        title: language === 'bn' ? 'ছবি প্রয়োজন' : 'Image required',
        description: language === 'bn' ? 'ছবির URL দিন' : 'Please provide image URL',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    
    const { error } = await supabase
      .from('contest_photos')
      .insert({
        contest_id: selectedContest.id,
        user_id: user.id,
        image_url: imageUrl,
        caption_en: caption,
        caption_bn: caption,
        location_name: location,
      });

    if (error) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: language === 'bn' ? 'জমা হয়েছে!' : 'Submitted!',
        description: language === 'bn' 
          ? 'আপনার ছবি অ্যাডমিন অনুমোদনের পর দেখা যাবে' 
          : 'Your photo will appear after admin approval',
      });
      setShowSubmitDialog(false);
      setImageUrl('');
      setCaption('');
      setLocation('');
    }
    
    setSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">{language === 'bn' ? 'চলমান' : 'Active'}</Badge>;
      case 'voting':
        return <Badge className="bg-blue-500">{language === 'bn' ? 'ভোটিং' : 'Voting'}</Badge>;
      case 'completed':
        return <Badge variant="secondary">{language === 'bn' ? 'সমাপ্ত' : 'Completed'}</Badge>;
      default:
        return <Badge variant="outline">{language === 'bn' ? 'আসছে' : 'Upcoming'}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title={language === 'bn' ? 'ফটো প্রতিযোগিতা' : 'Photo Contest'} />
      
      <main className="container mx-auto px-4 py-4">
        {/* Contest Selector */}
        {contests.length > 0 && selectedContest && (
          <div className="card-elevated p-4 mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Camera className="w-5 h-5 text-primary" />
                  <h2 className="font-bold font-bangla">
                    {language === 'bn' ? selectedContest.title_bn : selectedContest.title_en}
                  </h2>
                </div>
                {getStatusBadge(selectedContest.status)}
              </div>
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 font-bangla">
              {language === 'bn' ? selectedContest.description_bn : selectedContest.description_en}
            </p>
            
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(selectedContest.start_date), 'dd MMM')} - {format(new Date(selectedContest.end_date), 'dd MMM yyyy')}</span>
              </div>
              {selectedContest.prize_en && (
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>{language === 'bn' ? selectedContest.prize_bn : selectedContest.prize_en}</span>
                </div>
              )}
            </div>
            
            {selectedContest.status === 'active' && user && (
              <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full gap-2">
                    <Upload className="w-4 h-4" />
                    {language === 'bn' ? 'ছবি জমা দিন' : 'Submit Photo'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-bangla">
                      {language === 'bn' ? 'ছবি জমা দিন' : 'Submit Your Photo'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium font-bangla">
                        {language === 'bn' ? 'ছবির URL' : 'Image URL'}
                      </label>
                      <Input 
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium font-bangla">
                        {language === 'bn' ? 'ক্যাপশন' : 'Caption'}
                      </label>
                      <Textarea 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={language === 'bn' ? 'আপনার ছবি সম্পর্কে লিখুন...' : 'Write about your photo...'}
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium font-bangla">
                        {language === 'bn' ? 'স্থান' : 'Location'}
                      </label>
                      <Input 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={language === 'bn' ? 'যেখানে ছবি তোলা হয়েছে' : 'Where was this taken?'}
                      />
                    </div>
                    <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                      {submitting ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...') : (language === 'bn' ? 'জমা দিন' : 'Submit')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {/* Photos Grid */}
        <h3 className="font-bold font-bangla mb-3">
          {language === 'bn' ? 'প্রতিযোগিতার ছবি' : 'Contest Entries'} ({photos.length})
        </h3>
        
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className={`card-elevated overflow-hidden relative ${photo.is_winner ? 'ring-2 ring-amber-500' : ''}`}
              >
                {photo.is_winner && (
                  <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {language === 'bn' ? 'বিজয়ী' : 'Winner'}
                  </div>
                )}
                {index < 3 && !photo.is_winner && (
                  <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                    #{index + 1}
                  </div>
                )}
                
                <div className="aspect-square bg-muted">
                  <img 
                    src={photo.image_url} 
                    alt={photo.caption_en || 'Contest photo'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
                
                <div className="p-3">
                  {photo.caption_en && (
                    <p className="text-sm font-bangla line-clamp-2 mb-2">
                      {language === 'bn' ? photo.caption_bn : photo.caption_en}
                    </p>
                  )}
                  {photo.location_name && (
                    <p className="text-xs text-muted-foreground mb-2">📍 {photo.location_name}</p>
                  )}
                  
                  <button 
                    onClick={() => handleVote(photo.id)}
                    className={`flex items-center gap-1 text-sm ${userVotes.includes(photo.id) ? 'text-red-500' : 'text-muted-foreground'}`}
                  >
                    <Heart className={`w-4 h-4 ${userVotes.includes(photo.id) ? 'fill-current' : ''}`} />
                    <span>{photo.vote_count}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-elevated p-8 text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground font-bangla">
              {language === 'bn' ? 'এখনো কোনো ছবি নেই' : 'No photos yet'}
            </p>
          </div>
        )}

        {/* No Contest State */}
        {!loading && contests.length === 0 && (
          <div className="card-elevated p-8 text-center">
            <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-bold font-bangla mb-2">
              {language === 'bn' ? 'কোনো প্রতিযোগিতা নেই' : 'No Contests'}
            </h3>
            <p className="text-muted-foreground font-bangla">
              {language === 'bn' ? 'শীঘ্রই নতুন প্রতিযোগিতা আসছে!' : 'New contests coming soon!'}
            </p>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
};

export default PhotoContest;
