import React, { useState } from 'react';
import { Phone, X, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const TOURIST_POLICE_NUMBER = '01769-690844'; // Kuakata Tourist Police

const FloatingSOS: React.FC = () => {
  const { language } = useLanguage();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCall = () => {
    window.location.href = `tel:${TOURIST_POLICE_NUMBER}`;
    setShowConfirm(false);
  };

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onClick={() => setShowConfirm(true)}
        className="fixed bottom-24 right-4 z-50 bg-destructive text-white p-4 rounded-full shadow-lg hover:bg-destructive/90 active:scale-95 transition-all animate-pulse"
        aria-label="Emergency SOS"
      >
        <Shield className="w-6 h-6" />
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-destructive/10 p-3 rounded-full">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <button 
                onClick={() => setShowConfirm(false)}
                className="p-2 hover:bg-muted rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold font-bangla mb-2">
              {language === 'bn' ? '🚨 জরুরি কল' : '🚨 Emergency Call'}
            </h3>
            
            <p className="text-muted-foreground font-bangla mb-4">
              {language === 'bn' 
                ? 'কুয়াকাটা ট্যুরিস্ট পুলিশে কল করতে চান?' 
                : 'Call Kuakata Tourist Police?'}
            </p>

            <div className="bg-muted/50 rounded-xl p-4 mb-4">
              <p className="text-sm text-muted-foreground font-bangla">
                {language === 'bn' ? 'ট্যুরিস্ট পুলিশ কুয়াকাটা' : 'Tourist Police Kuakata'}
              </p>
              <p className="text-2xl font-bold text-destructive">{TOURIST_POLICE_NUMBER}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-border font-medium font-bangla hover:bg-muted transition-colors"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleCall}
                className="flex-1 py-3 px-4 rounded-xl bg-destructive text-white font-medium font-bangla flex items-center justify-center gap-2 hover:bg-destructive/90 transition-colors"
              >
                <Phone className="w-5 h-5" />
                {language === 'bn' ? 'কল করুন' : 'Call Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingSOS;
