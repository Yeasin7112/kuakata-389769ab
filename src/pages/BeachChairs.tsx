import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Phone, MapPin, Clock, DollarSign, Umbrella } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const BeachChairs: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Beach chair rental info (can be made dynamic later)
  const rentalSpots = [
    {
      id: 1,
      nameBn: 'কুয়াকাটা সেন্ট্রাল বিচ',
      nameEn: 'Kuakata Central Beach',
      priceBn: '৫০-১০০ টাকা/ঘন্টা',
      priceEn: '50-100 BDT/hour',
      timingBn: 'সকাল ৬টা - সন্ধ্যা ৭টা',
      timingEn: '6 AM - 7 PM',
      phone: '+8801712345678',
      featuresBn: ['ছাতা', 'চেয়ার', 'টেবিল'],
      featuresEn: ['Umbrella', 'Chair', 'Table'],
    },
    {
      id: 2,
      nameBn: 'পশ্চিম বিচ পয়েন্ট',
      nameEn: 'West Beach Point',
      priceBn: '৪০-৮০ টাকা/ঘন্টা',
      priceEn: '40-80 BDT/hour',
      timingBn: 'সকাল ৬টা - রাত ৮টা',
      timingEn: '6 AM - 8 PM',
      phone: '+8801812345678',
      featuresBn: ['ছাতা', 'চেয়ার', 'পানীয়'],
      featuresEn: ['Umbrella', 'Chair', 'Drinks'],
    },
    {
      id: 3,
      nameBn: 'সূর্যাস্ত পয়েন্ট',
      nameEn: 'Sunset Point',
      priceBn: '৬০-১২০ টাকা/ঘন্টা',
      priceEn: '60-120 BDT/hour',
      timingBn: 'বিকাল ৩টা - রাত ৯টা',
      timingEn: '3 PM - 9 PM',
      phone: '+8801912345678',
      featuresBn: ['প্রিমিয়াম চেয়ার', 'ছাতা', 'স্ন্যাকস'],
      featuresEn: ['Premium Chair', 'Umbrella', 'Snacks'],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-header text-white p-4 safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold font-bangla">
            {language === 'bn' ? '🏖️ কিটকট চেয়ার' : '🏖️ Beach Chairs'}
          </h1>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <Umbrella className="w-12 h-12" />
            <div>
              <h2 className="font-bold font-bangla">
                {language === 'bn' ? 'বিচে আরাম করুন' : 'Relax at the Beach'}
              </h2>
              <p className="text-sm opacity-90 font-bangla">
                {language === 'bn' 
                  ? 'চেয়ার ও ছাতা ভাড়া নিন সাশ্রয়ী মূল্যে' 
                  : 'Rent chairs and umbrellas at affordable prices'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Spots */}
      <div className="px-4 space-y-4">
        <h3 className="font-bold font-bangla">
          📍 {language === 'bn' ? 'ভাড়ার স্থানসমূহ' : 'Rental Locations'}
        </h3>
        
        {rentalSpots.map((spot) => (
          <div key={spot.id} className="card-elevated p-4">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-bold font-bangla">
                {language === 'bn' ? spot.nameBn : spot.nameEn}
              </h4>
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                🏖️
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="font-bangla">{language === 'bn' ? spot.priceBn : spot.priceEn}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="font-bangla">{language === 'bn' ? spot.timingBn : spot.timingEn}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {(language === 'bn' ? spot.featuresBn : spot.featuresEn).map((feature, idx) => (
                <span key={idx} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full font-bangla">
                  {feature}
                </span>
              ))}
            </div>

            <a
              href={`tel:${spot.phone}`}
              className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded-lg text-center text-sm font-medium flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" /> {language === 'bn' ? 'বুকিং করুন' : 'Book Now'}
            </a>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="p-4 mt-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-bold text-yellow-800 font-bangla mb-2">
            💡 {language === 'bn' ? 'টিপস' : 'Tips'}
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1 font-bangla">
            <li>• {language === 'bn' ? 'সকালে বা বিকালে যাওয়া ভালো' : 'Best to visit morning or evening'}</li>
            <li>• {language === 'bn' ? 'দর-কষাকষি করতে পারবেন' : 'You can negotiate prices'}</li>
            <li>• {language === 'bn' ? 'সানস্ক্রিন সাথে রাখুন' : 'Bring sunscreen'}</li>
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default BeachChairs;
