import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, LogOut, Heart, History, Settings } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const menuItems = [
    { icon: Heart, labelBn: 'সংরক্ষিত স্থান', labelEn: 'Saved Places' },
    { icon: History, labelBn: 'ভ্রমণ ইতিহাস', labelEn: 'Travel History' },
    { icon: Settings, labelBn: 'সেটিংস', labelEn: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-header text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {language === 'bn' ? 'প্রোফাইল' : 'Profile'}
          </h1>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <div className="card-elevated p-6 text-center mb-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">{user.email}</h2>
          {isAdmin && (
            <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
              {language === 'bn' ? 'অ্যাডমিন' : 'Admin'}
            </span>
          )}
        </div>

        <div className="card-elevated divide-y divide-border">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button 
                key={index}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors"
              >
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium font-bangla">
                  {language === 'bn' ? item.labelBn : item.labelEn}
                </span>
              </button>
            );
          })}
        </div>

        <Button 
          onClick={handleLogout}
          variant="destructive" 
          className="w-full mt-4"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {language === 'bn' ? 'লগ আউট' : 'Logout'}
        </Button>
      </main>
    </div>
  );
};

export default Profile;
