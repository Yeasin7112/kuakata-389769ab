import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Heart, 
  Bell, 
  Shield,
  HelpCircle,
  LogIn
} from 'lucide-react';

const Profile: React.FC = () => {
  const { language } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: language === 'bn' ? 'লগ আউট সফল' : 'Logged out',
      description: language === 'bn' ? 'সফলভাবে লগ আউট হয়েছে' : 'You have been logged out successfully',
    });
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="card-elevated p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold font-bangla mb-2">
              {language === 'bn' ? 'লগইন করুন' : 'Login to Continue'}
            </h2>
            <p className="text-muted-foreground font-bangla text-sm mb-6">
              {language === 'bn' 
                ? 'আপনার প্রোফাইল দেখতে এবং সেবা ব্যবহার করতে লগইন করুন'
                : 'Login to view your profile and use services'}
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/login">
                <Button className="w-full gap-2">
                  <LogIn className="w-4 h-4" />
                  {language === 'bn' ? 'লগইন' : 'Login'}
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" className="w-full">
                  {language === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create New Account'}
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const menuItems = [
    { icon: Heart, label: language === 'bn' ? 'প্রিয় স্থান' : 'Saved Places', route: '/saved' },
    { icon: Bell, label: language === 'bn' ? 'নোটিফিকেশন' : 'Notifications', route: '/notifications' },
    { icon: Settings, label: language === 'bn' ? 'সেটিংস' : 'Settings', route: '/settings' },
    { icon: HelpCircle, label: language === 'bn' ? 'সাহায্য' : 'Help & Support', route: '/help' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Profile Card */}
        <div className="card-elevated p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-header flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold font-bangla text-lg">
                {user.email?.split('@')[0]}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Admin Panel Link */}
        {isAdmin && (
          <Link to="/admin" className="card-elevated p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium font-bangla">
                {language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
        )}

        {/* Menu Items */}
        <div className="card-elevated divide-y divide-border">
          {menuItems.map((item, index) => (
            <Link 
              key={index}
              to={item.route}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium font-bangla">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full mt-4 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          {language === 'bn' ? 'লগ আউট' : 'Logout'}
        </Button>
      </main>
      <BottomNav />
    </div>
  );
};

export default Profile;
