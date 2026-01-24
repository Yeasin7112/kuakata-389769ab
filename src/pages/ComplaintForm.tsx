import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, MessageSquare, Loader2, CheckCircle } from 'lucide-react';

const ComplaintForm: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    type: 'complaint',
    subject_bn: '',
    subject_en: '',
    description_bn: '',
    description_en: '',
    contact_phone: '',
    image_url: '',
  });

  const complaintTypes = [
    { value: 'complaint', labelBn: 'অভিযোগ', labelEn: 'Complaint' },
    { value: 'suggestion', labelBn: 'পরামর্শ', labelEn: 'Suggestion' },
    { value: 'feedback', labelBn: 'মতামত', labelEn: 'Feedback' },
    { value: 'inquiry', labelBn: 'জিজ্ঞাসা', labelEn: 'Inquiry' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('complaints').insert([{
        user_id: user?.id || null,
        subject_bn: formData.subject_bn || formData.subject_en,
        subject_en: formData.subject_en || formData.subject_bn,
        description_bn: formData.description_bn || formData.description_en,
        description_en: formData.description_en || formData.description_bn,
        image_url: formData.image_url || null,
        status: 'pending',
      }]);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' ? 'আপনার বার্তা পাঠানো হয়েছে' : 'Your message has been submitted',
      });
    } catch (error: any) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="card-elevated p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-bold font-bangla mb-2">
              {language === 'bn' ? 'ধন্যবাদ!' : 'Thank You!'}
            </h2>
            <p className="text-muted-foreground font-bangla mb-6">
              {language === 'bn' 
                ? 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।'
                : 'Your message has been successfully submitted. We will get back to you soon.'
              }
            </p>
            <Button onClick={() => navigate('/')}>
              {language === 'bn' ? 'হোম এ ফিরুন' : 'Back to Home'}
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-header text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate('/')} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold font-bangla">
            {language === 'bn' ? 'অভিযোগ ও পরামর্শ' : 'Complaints & Suggestions'}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <div className="card-elevated p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold font-bangla">
                {language === 'bn' ? 'আপনার মতামত জানান' : 'Share Your Feedback'}
              </h2>
              <p className="text-sm text-muted-foreground font-bangla">
                {language === 'bn' 
                  ? 'আমরা আপনার কথা শুনতে চাই'
                  : 'We want to hear from you'
                }
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bangla">{language === 'bn' ? 'প্রকার' : 'Type'}</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {complaintTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {language === 'bn' ? type.labelBn : type.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">
                {language === 'bn' ? 'বিষয় (বাংলা/ইংরেজি)' : 'Subject (Bangla/English)'} *
              </Label>
              <Input
                value={language === 'bn' ? formData.subject_bn : formData.subject_en}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  [language === 'bn' ? 'subject_bn' : 'subject_en']: e.target.value 
                })}
                placeholder={language === 'bn' ? 'বিষয় লিখুন' : 'Enter subject'}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">
                {language === 'bn' ? 'বিস্তারিত' : 'Details'} *
              </Label>
              <Textarea
                value={language === 'bn' ? formData.description_bn : formData.description_en}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  [language === 'bn' ? 'description_bn' : 'description_en']: e.target.value 
                })}
                placeholder={language === 'bn' ? 'বিস্তারিত লিখুন...' : 'Enter details...'}
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">
                {language === 'bn' ? 'যোগাযোগ নম্বর (ঐচ্ছিক)' : 'Contact Number (Optional)'}
              </Label>
              <Input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+880..."
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bangla">
                {language === 'bn' ? 'ছবি সংযুক্ত করুন (ঐচ্ছিক)' : 'Attach Photo (Optional)'}
              </Label>
              <ImageUpload
                onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                currentImage={formData.image_url}
                folder="complaints"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Submitting...'}
                </>
              ) : (
                language === 'bn' ? 'জমা দিন' : 'Submit'
              )}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default ComplaintForm;