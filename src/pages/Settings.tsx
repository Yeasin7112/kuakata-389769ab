import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import ImageUpload from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, User, Bell, Globe } from 'lucide-react';

interface Profile {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  notification_enabled: boolean;
}

const Settings: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone: '',
    avatar_url: '',
    notification_enabled: false,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url, notification_enabled')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || '',
          notification_enabled: data.notification_enabled || false,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          notification_enabled: profile.notification_enabled,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'প্রোফাইল আপডেট হয়েছে' : 'Profile updated successfully',
      });
    } catch (error: any) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-header text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold font-bangla">
            {language === 'bn' ? 'সেটিংস' : 'Settings'}
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto px-4 py-4 w-full">
        {/* Profile Section */}
        <div className="card-elevated p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-semibold font-bangla">
              {language === 'bn' ? 'প্রোফাইল তথ্য' : 'Profile Information'}
            </h2>
          </div>

          <div className="space-y-4">
            {/* Avatar */}
            <div className="flex justify-center">
              <ImageUpload
                currentImage={profile.avatar_url || ''}
                onImageUploaded={(url) => setProfile({ ...profile, avatar_url: url })}
                folder="avatars"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}</Label>
              <Input
                value={profile.full_name || ''}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder={language === 'bn' ? 'আপনার নাম' : 'Your name'}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</Label>
              <Input
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="01XXXXXXXXX"
                type="tel"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'ইমেইল' : 'Email'}</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                {language === 'bn' ? 'ইমেইল পরিবর্তন করা যাবে না' : 'Email cannot be changed'}
              </p>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="card-elevated p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="font-semibold font-bangla">
              {language === 'bn' ? 'পছন্দ' : 'Preferences'}
            </h2>
          </div>

          <div className="space-y-4">
            {/* Language Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium font-bangla">{language === 'bn' ? 'ভাষা' : 'Language'}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'বাংলা' : 'English'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleLanguage}>
                {language === 'bn' ? 'ENG' : 'বাংলা'}
              </Button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium font-bangla">
                    {language === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'পুশ নোটিফিকেশন' : 'Push notifications'}
                  </p>
                </div>
              </div>
              <Switch
                checked={profile.notification_enabled}
                onCheckedChange={(checked) => setProfile({ ...profile, notification_enabled: checked })}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...'}
            </>
          ) : (
            language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'
          )}
        </Button>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Settings;
