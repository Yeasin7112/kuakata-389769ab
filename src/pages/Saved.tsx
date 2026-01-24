import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Heart, LogIn, MapPin, Star, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SavedPlace {
  id: string;
  place_id: string;
  places: {
    id: string;
    name_bn: string;
    name_en: string;
    description_bn: string | null;
    description_en: string | null;
    image_url: string | null;
    rating: number | null;
    category: string | null;
  };
}

const Saved: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedPlaces();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSavedPlaces = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('saved_places')
      .select(`
        id,
        place_id,
        places (
          id,
          name_bn,
          name_en,
          description_bn,
          description_en,
          image_url,
          rating,
          category
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSavedPlaces(data as unknown as SavedPlace[]);
    }
    setLoading(false);
  };

  const handleRemove = async (savedId: string) => {
    const { error } = await supabase
      .from('saved_places')
      .delete()
      .eq('id', savedId);

    if (error) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setSavedPlaces(prev => prev.filter(p => p.id !== savedId));
      toast({
        title: language === 'bn' ? 'সরানো হয়েছে' : 'Removed',
        description: language === 'bn' ? 'স্থানটি সরানো হয়েছে' : 'Place removed from saved',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-4">
        <h2 className="text-xl font-bold font-bangla mb-4">
          {language === 'bn' ? 'প্রিয় স্থান' : 'Saved Places'}
        </h2>

        {!user ? (
          <div className="card-elevated p-8 text-center">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold font-bangla mb-2">
              {language === 'bn' ? 'লগইন করুন' : 'Login Required'}
            </h3>
            <p className="text-muted-foreground font-bangla text-sm mb-4">
              {language === 'bn' 
                ? 'আপনার প্রিয় স্থানগুলো সংরক্ষণ করতে লগইন করুন'
                : 'Login to save your favorite places'}
            </p>
            <Link to="/login">
              <Button className="gap-2">
                <LogIn className="w-4 h-4" />
                {language === 'bn' ? 'লগইন' : 'Login'}
              </Button>
            </Link>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : savedPlaces.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-bangla">
              {language === 'bn' 
                ? 'আপনি এখনো কোন স্থান সংরক্ষণ করেননি'
                : 'You haven\'t saved any places yet'}
            </p>
            <Link to="/explore" className="inline-block mt-4">
              <Button variant="outline">
                {language === 'bn' ? 'এক্সপ্লোর করুন' : 'Start Exploring'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {savedPlaces.map((saved) => (
              <div 
                key={saved.id} 
                className="card-elevated overflow-hidden flex"
              >
                <button
                  onClick={() => navigate(`/places/${saved.places.id}`)}
                  className="flex-1 flex items-start gap-3 p-3 text-left"
                >
                  {saved.places.image_url ? (
                    <img 
                      src={saved.places.image_url} 
                      alt="" 
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold font-bangla truncate">
                      {language === 'bn' ? saved.places.name_bn : saved.places.name_en}
                    </h3>
                    {saved.places.category && (
                      <span className="text-xs text-muted-foreground capitalize">
                        {saved.places.category.replace('_', ' ')}
                      </span>
                    )}
                    {saved.places.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs text-muted-foreground">{saved.places.rating}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 font-bangla">
                      {language === 'bn' ? saved.places.description_bn : saved.places.description_en}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleRemove(saved.id)}
                  className="px-3 flex items-center justify-center hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Saved;
