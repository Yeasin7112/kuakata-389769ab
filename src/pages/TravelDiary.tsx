import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import { Book, Plus, MapPin, Sparkles, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DiaryEntry {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  mood: string | null;
  weather: string | null;
  location_name: string | null;
  visit_date: string;
  is_public: boolean;
  created_at: string;
}

const MOODS = [
  { value: 'happy', emoji: '😊', label_en: 'Happy', label_bn: 'খুশি' },
  { value: 'excited', emoji: '🤩', label_en: 'Excited', label_bn: 'উত্তেজিত' },
  { value: 'relaxed', emoji: '😌', label_en: 'Relaxed', label_bn: 'স্বস্তি' },
  { value: 'adventurous', emoji: '🌟', label_en: 'Adventurous', label_bn: 'দুঃসাহসিক' },
  { value: 'romantic', emoji: '💕', label_en: 'Romantic', label_bn: 'রোমান্টিক' },
];

const WEATHERS = [
  { value: 'sunny', emoji: '☀️', label_en: 'Sunny', label_bn: 'রৌদ্রোজ্জ্বল' },
  { value: 'cloudy', emoji: '☁️', label_en: 'Cloudy', label_bn: 'মেঘলা' },
  { value: 'rainy', emoji: '🌧️', label_en: 'Rainy', label_bn: 'বৃষ্টি' },
  { value: 'windy', emoji: '💨', label_en: 'Windy', label_bn: 'ঝড়ো' },
];

const TravelDiary: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [weather, setWeather] = useState('');
  const [locationName, setLocationName] = useState('');
  const [visitDate, setVisitDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEntries();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchEntries = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('visit_date', { ascending: false });
    
    setEntries(data || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!content.trim()) {
      toast({
        title: language === 'bn' ? 'কন্টেন্ট প্রয়োজন' : 'Content required',
        description: language === 'bn' ? 'আপনার স্মৃতি লিখুন' : 'Please write your memory',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    
    const { error } = await supabase
      .from('diary_entries')
      .insert({
        user_id: user.id,
        title: title || null,
        content,
        mood: mood || null,
        weather: weather || null,
        location_name: locationName || null,
        visit_date: visitDate,
        is_public: isPublic,
      });

    if (error) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: language === 'bn' ? 'সংরক্ষিত!' : 'Saved!',
        description: language === 'bn' ? 'আপনার স্মৃতি সংরক্ষিত হয়েছে' : 'Your memory has been saved',
      });
      setShowAddDialog(false);
      resetForm();
      fetchEntries();
    }
    
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setEntries(prev => prev.filter(e => e.id !== id));
      toast({
        title: language === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted',
      });
    }
  };

  const togglePublic = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('diary_entries')
      .update({ is_public: !current })
      .eq('id', id);
    
    if (!error) {
      setEntries(prev => prev.map(e => 
        e.id === id ? { ...e, is_public: !current } : e
      ));
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setMood('');
    setWeather('');
    setLocationName('');
    setVisitDate(format(new Date(), 'yyyy-MM-dd'));
    setIsPublic(false);
  };

  const getMoodEmoji = (moodValue: string | null) => {
    return MOODS.find(m => m.value === moodValue)?.emoji || '';
  };

  const getWeatherEmoji = (weatherValue: string | null) => {
    return WEATHERS.find(w => w.value === weatherValue)?.emoji || '';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader title={language === 'bn' ? 'ভ্রমণ ডায়েরি' : 'Travel Diary'} />
        <main className="container mx-auto px-4 py-4">
          <div className="card-elevated p-8 text-center">
            <Book className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground font-bangla">
              {language === 'bn' ? 'ডায়েরি লিখতে লগইন করুন' : 'Login to write your diary'}
            </p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title={language === 'bn' ? 'ভ্রমণ ডায়েরি' : 'Travel Diary'} />
      
      <main className="container mx-auto px-4 py-4">
        {/* Add Entry Button */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full mb-4 gap-2">
              <Plus className="w-4 h-4" />
              {language === 'bn' ? 'নতুন স্মৃতি যোগ করুন' : 'Add New Memory'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-bangla">
                {language === 'bn' ? 'নতুন স্মৃতি' : 'New Memory'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium font-bangla">
                  {language === 'bn' ? 'শিরোনাম (ঐচ্ছিক)' : 'Title (optional)'}
                </label>
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'bn' ? 'আজকের দিনটি...' : "Today's adventure..."}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium font-bangla">
                  {language === 'bn' ? 'আপনার স্মৃতি *' : 'Your Memory *'}
                </label>
                <Textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={language === 'bn' ? 'আজ কুয়াকাটায় কী হলো...' : 'What happened in Kuakata today...'}
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium font-bangla">
                    {language === 'bn' ? 'মেজাজ' : 'Mood'}
                  </label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'bn' ? 'বাছুন' : 'Select'} />
                    </SelectTrigger>
                    <SelectContent>
                      {MOODS.map(m => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.emoji} {language === 'bn' ? m.label_bn : m.label_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium font-bangla">
                    {language === 'bn' ? 'আবহাওয়া' : 'Weather'}
                  </label>
                  <Select value={weather} onValueChange={setWeather}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'bn' ? 'বাছুন' : 'Select'} />
                    </SelectTrigger>
                    <SelectContent>
                      {WEATHERS.map(w => (
                        <SelectItem key={w.value} value={w.value}>
                          {w.emoji} {language === 'bn' ? w.label_bn : w.label_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium font-bangla">
                  {language === 'bn' ? 'স্থান' : 'Location'}
                </label>
                <Input 
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder={language === 'bn' ? 'কুয়াকাটা বীচ' : 'Kuakata Beach'}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium font-bangla">
                  {language === 'bn' ? 'তারিখ' : 'Date'}
                </label>
                <Input 
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium font-bangla">
                  {language === 'bn' ? 'পাবলিক করুন' : 'Make Public'}
                </label>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
              
              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Memory')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Entries List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-elevated p-4 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/3 mb-3" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="card-elevated p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMoodEmoji(entry.mood) || '📝'}</span>
                    <div>
                      {entry.title && (
                        <h3 className="font-bold font-bangla">{entry.title}</h3>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(entry.visit_date), 'dd MMM yyyy')}</span>
                        {entry.weather && <span>{getWeatherEmoji(entry.weather)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => togglePublic(entry.id, entry.is_public)}
                      className="p-1.5 rounded-full hover:bg-muted"
                      title={entry.is_public ? 'Make Private' : 'Make Public'}
                    >
                      {entry.is_public ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 rounded-full hover:bg-muted text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {entry.location_name && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{entry.location_name}</span>
                  </div>
                )}
                
                <p className="text-sm font-bangla whitespace-pre-line">{entry.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-elevated p-8 text-center">
            <Book className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-bold font-bangla mb-2">
              {language === 'bn' ? 'আপনার ডায়েরি খালি' : 'Your Diary is Empty'}
            </h3>
            <p className="text-sm text-muted-foreground font-bangla">
              {language === 'bn' ? 'আজকের স্মৃতি লিখে শুরু করুন!' : 'Start by writing today\'s memory!'}
            </p>
          </div>
        )}

        {/* Generate Story CTA */}
        {entries.length >= 3 && (
          <div className="card-elevated p-4 mt-6 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              <div className="flex-1">
                <h3 className="font-bold font-bangla">
                  {language === 'bn' ? 'ট্রাভেল স্টোরি তৈরি করুন' : 'Generate Travel Story'}
                </h3>
                <p className="text-xs text-muted-foreground font-bangla">
                  {language === 'bn' ? 'AI দিয়ে আপনার স্মৃতি থেকে গল্প তৈরি করুন' : 'Create a story from your memories with AI'}
                </p>
              </div>
              <Button size="sm" variant="outline">
                {language === 'bn' ? 'শীঘ্রই' : 'Soon'}
              </Button>
            </div>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
};

export default TravelDiary;
