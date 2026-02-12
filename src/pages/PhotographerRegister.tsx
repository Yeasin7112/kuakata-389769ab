import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';
import { useToast } from '@/hooks/use-toast';

const SPECIALIZATIONS = [
  'Couple Shoot', 'Drone Shot', 'Reels', 'Portrait', 'Event', 'Landscape', 'Wedding', 'Product'
];

const PhotographerRegister: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name_bn: '',
    name_en: '',
    bio_bn: '',
    bio_en: '',
    phone: '',
    whatsapp: '',
    email: '',
    profile_image_url: '',
    experience_years: 0,
    specializations: [] as string[],
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const toggleSpec = (spec: string) => {
    setForm(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from('photographers').insert([{
        ...form,
        user_id: user.id,
        is_approved: false,
        is_active: true,
      }]);

      if (error) throw error;

      // Assign photographer role
      await supabase.from('user_roles').insert([{
        user_id: user.id,
        role: 'photographer',
      }]);

      toast({
        title: language === 'bn' ? 'রেজিস্ট্রেশন সফল!' : 'Registration Successful!',
        description: language === 'bn' 
          ? 'অ্যাডমিন আপনার প্রোফাইল অনুমোদন করলে আপনি বুকিং পাবেন'
          : 'You will receive bookings once admin approves your profile',
      });
      navigate('/photographer-dashboard');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-header text-white p-4 safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {language === 'bn' ? '📸 ফটোগ্রাফার রেজিস্ট্রেশন' : '📸 Photographer Registration'}
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card-elevated p-4 space-y-4">
            <h3 className="font-bold font-bangla">{language === 'bn' ? 'প্রোফাইল তথ্য' : 'Profile Info'}</h3>

            <ImageUpload
              currentImage={form.profile_image_url}
              onImageUploaded={(url) => setForm({ ...form, profile_image_url: url })}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>নাম (বাংলা)</Label>
                <Input required value={form.name_bn} onChange={e => setForm({ ...form, name_bn: e.target.value })} />
              </div>
              <div>
                <Label>Name (English)</Label>
                <Input required value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{language === 'bn' ? 'ফোন' : 'Phone'}</Label>
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>WhatsApp</Label>
                <Input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="880XXXXXXXXXX" />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <Label>{language === 'bn' ? 'অভিজ্ঞতা (বছর)' : 'Experience (years)'}</Label>
              <Input type="number" min="0" value={form.experience_years}
                onChange={e => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })} />
            </div>

            <div>
              <Label className="font-bangla">{language === 'bn' ? 'বায়ো (বাংলা)' : 'Bio (Bangla)'}</Label>
              <Textarea value={form.bio_bn} onChange={e => setForm({ ...form, bio_bn: e.target.value })} />
            </div>
            <div>
              <Label>Bio (English)</Label>
              <Textarea value={form.bio_en} onChange={e => setForm({ ...form, bio_en: e.target.value })} />
            </div>
          </div>

          <div className="card-elevated p-4 space-y-3">
            <h3 className="font-bold font-bangla">{language === 'bn' ? 'বিশেষত্ব' : 'Specializations'}</h3>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map(spec => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpec(spec)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    form.specializations.includes(spec)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-muted'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
            {language === 'bn' ? 'রেজিস্টার করুন' : 'Register'}
          </Button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
};

export default PhotographerRegister;
