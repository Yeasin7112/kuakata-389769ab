import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, MapPin, Loader2, History, Globe, Camera } from 'lucide-react';

interface AboutSection {
  id: string;
  section_key: string;
  title_bn: string;
  title_en: string;
  content_bn: string | null;
  content_en: string | null;
  image_url: string | null;
  display_order: number;
}

const AboutKuakata: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      const { data } = await supabase
        .from('about_kuakata')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (data) setSections(data);
      setLoading(false);
    };

    fetchSections();
  }, []);

  const getSectionIcon = (key: string) => {
    switch (key) {
      case 'history': return History;
      case 'geography': return Globe;
      case 'attractions': return Camera;
      default: return MapPin;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-header text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate('/')} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold font-bangla">
            {language === 'bn' ? 'কুয়াকাটা সম্পর্কে' : 'About Kuakata'}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Hero Section */}
        <div className="card-elevated overflow-hidden mb-6">
          <div className="h-48 bg-gradient-header flex items-center justify-center">
            <div className="text-center text-primary-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <h2 className="text-2xl font-bold font-bangla">
                {language === 'bn' ? 'কুয়াকাটা' : 'Kuakata'}
              </h2>
              <p className="text-sm opacity-90 font-bangla">
                {language === 'bn' ? 'সাগর কন্যা' : 'Daughter of the Sea'}
              </p>
            </div>
          </div>
          <div className="p-4">
            <p className="text-muted-foreground font-bangla text-sm leading-relaxed">
              {language === 'bn' 
                ? 'কুয়াকাটা বাংলাদেশের একমাত্র সমুদ্র সৈকত যেখান থেকে সূর্যোদয় ও সূর্যাস্ত উভয়ই উপভোগ করা যায়। এটি "সাগর কন্যা" নামেও পরিচিত।'
                : 'Kuakata is the only sea beach in Bangladesh from where both sunrise and sunset can be enjoyed. It is also known as the "Daughter of the Sea".'
              }
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = getSectionIcon(section.section_key);
              return (
                <div key={section.id} className="card-elevated p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold font-bangla text-lg">
                      {language === 'bn' ? section.title_bn : section.title_en}
                    </h3>
                  </div>
                  {section.image_url && (
                    <img
                      src={section.image_url}
                      alt={language === 'bn' ? section.title_bn : section.title_en}
                      className="w-full h-40 object-cover rounded-xl mb-3"
                    />
                  )}
                  <p className="text-muted-foreground font-bangla text-sm leading-relaxed whitespace-pre-line">
                    {language === 'bn' ? section.content_bn : section.content_en}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Facts */}
        <div className="mt-6">
          <h3 className="font-bold font-bangla text-lg mb-3">
            {language === 'bn' ? 'দ্রুত তথ্য' : 'Quick Facts'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="card-elevated p-3 text-center">
              <p className="text-2xl font-bold text-primary">18</p>
              <p className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'কিমি সৈকত' : 'km Beach'}
              </p>
            </div>
            <div className="card-elevated p-3 text-center">
              <p className="text-2xl font-bold text-primary">320</p>
              <p className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'কিমি ঢাকা থেকে' : 'km from Dhaka'}
              </p>
            </div>
            <div className="card-elevated p-3 text-center">
              <p className="text-2xl font-bold text-primary">2</p>
              <p className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'সূর্যোদয় ও সূর্যাস্ত' : 'Sunrise & Sunset'}
              </p>
            </div>
            <div className="card-elevated p-3 text-center">
              <p className="text-2xl font-bold text-primary">১৭৮৪</p>
              <p className="text-xs text-muted-foreground font-bangla">
                {language === 'bn' ? 'রাখাইন বসতি স্থাপন' : 'Rakhine Settlement'}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default AboutKuakata;