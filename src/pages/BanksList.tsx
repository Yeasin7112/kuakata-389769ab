import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Phone, MapPin, Loader2, CreditCard, Building2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface Bank {
  id: string;
  name_bn: string;
  name_en: string;
  branch_bn: string | null;
  branch_en: string | null;
  address_bn: string | null;
  address_en: string | null;
  phone: string | null;
  has_atm: boolean | null;
  latitude: number | null;
  longitude: number | null;
  map_url: string | null;
}

const BanksList: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    const { data } = await supabase
      .from('banks')
      .select('*')
      .eq('is_active', true)
      .order('name_en');
    if (data) setBanks(data);
    setLoading(false);
  };

  const openMap = (bank: Bank) => {
    if (bank.map_url) {
      window.open(bank.map_url, '_blank');
    } else if (bank.latitude && bank.longitude) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${bank.latitude},${bank.longitude}`, '_blank');
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-header text-white p-4 safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {language === 'bn' ? '🏧 ব্যাংক ও এটিএম' : '🏧 Banks & ATMs'}
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {banks.map((bank) => (
          <div key={bank.id} className="card-elevated p-4">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold font-bangla">
                    {language === 'bn' ? bank.name_bn : bank.name_en}
                  </h3>
                  {bank.has_atm && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> ATM
                    </span>
                  )}
                </div>
                {(bank.branch_bn || bank.branch_en) && (
                  <p className="text-sm text-muted-foreground font-bangla">
                    {language === 'bn' ? bank.branch_bn : bank.branch_en}
                  </p>
                )}
                {(bank.address_bn || bank.address_en) && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {language === 'bn' ? bank.address_bn : bank.address_en}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {bank.phone && (
                <a href={`tel:${bank.phone}`} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" /> {language === 'bn' ? 'কল করুন' : 'Call'}
                </a>
              )}
              {(bank.map_url || (bank.latitude && bank.longitude)) && (
                <button
                  onClick={() => openMap(bank)}
                  className="flex-1 bg-muted text-foreground py-2 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" /> {language === 'bn' ? 'ম্যাপ' : 'Map'}
                </button>
              )}
            </div>
          </div>
        ))}
        {banks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {language === 'bn' ? 'কোনো ব্যাংক পাওয়া যায়নি' : 'No banks found'}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default BanksList;
