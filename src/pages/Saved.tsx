import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { Heart, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Saved: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

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
        ) : (
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
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Saved;
