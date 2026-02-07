import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { Mic, MicOff, Volume2, VolumeX, Loader2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ isOpen, onClose }) => { // v2
  const { language } = useLanguage();
  const navigate = useNavigate();
  const {
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    response,
    error,
    isSupported,
    startListening,
    stopListening,
    stopSpeaking
  } = useVoiceAssistant();

  // Handle navigation based on voice commands
  useEffect(() => {
    if (response && !isProcessing) {
      const actionMatch = response.toLowerCase();
      
      const navigationTimeout = setTimeout(() => {
        if (actionMatch.includes('hotel')) {
          navigate('/hotels');
          onClose();
        } else if (actionMatch.includes('restaurant') || actionMatch.includes('রেস্টুরেন্ট')) {
          navigate('/restaurants');
          onClose();
        } else if (actionMatch.includes('emergency') || actionMatch.includes('জরুরি')) {
          navigate('/emergency');
          onClose();
        } else if (actionMatch.includes('bank') || actionMatch.includes('ব্যাংক')) {
          navigate('/banks');
          onClose();
        } else if (actionMatch.includes('tourist') || actionMatch.includes('দর্শনীয়')) {
          navigate('/places');
          onClose();
        } else if (actionMatch.includes('weather') || actionMatch.includes('আবহাওয়া')) {
          navigate('/weather');
          onClose();
        } else if (actionMatch.includes('tide') || actionMatch.includes('জোয়ার')) {
          navigate('/beach-safety');
          onClose();
        } else if (actionMatch.includes('map') || actionMatch.includes('মানচিত্র')) {
          navigate('/tourist-map');
          onClose();
        } else if (actionMatch.includes('ar') || actionMatch.includes('ক্যামেরা')) {
          navigate('/ar-camera');
          onClose();
        }
      }, 1500);

      return () => clearTimeout(navigationTimeout);
    }
  }, [response, isProcessing, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {language === 'bn' ? '🎤 ভয়েস অ্যাসিস্ট্যান্ট' : '🎤 Voice Assistant'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!isSupported ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
              <p className="text-muted-foreground">
                {language === 'bn' 
                  ? 'আপনার ব্রাউজার ভয়েস রিকগনিশন সাপোর্ট করে না'
                  : 'Your browser does not support voice recognition'}
              </p>
            </div>
          ) : (
            <>
              {/* Microphone Button */}
              <div className="flex justify-center mb-6">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={isListening ? stopListening : startListening}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isListening 
                      ? 'bg-destructive animate-pulse' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  ) : isListening ? (
                    <MicOff className="w-10 h-10 text-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-white" />
                  )}
                </motion.button>
              </div>

              {/* Listening indicator */}
              <div className="text-center mb-4">
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                      {language === 'bn' ? 'শুনছি...' : 'Listening...'}
                    </span>
                  </motion.div>
                )}
                {!isListening && !isProcessing && !transcript && (
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' 
                      ? 'মাইক বাটনে ট্যাপ করুন এবং বলুন' 
                      : 'Tap the mic button and speak'}
                  </p>
                )}
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="bg-muted rounded-lg p-3 mb-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'bn' ? 'আপনি বললেন:' : 'You said:'}
                  </p>
                  <p className="font-medium">{transcript}</p>
                </div>
              )}

              {/* Response */}
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/10 rounded-lg p-3 mb-4"
                >
                  <div className="flex items-start gap-2">
                    {isSpeaking ? (
                      <Volume2 className="w-5 h-5 text-primary flex-shrink-0 animate-pulse" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <p className="text-sm">{response}</p>
                  </div>
                  {isSpeaking && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={stopSpeaking}
                    >
                      {language === 'bn' ? 'বন্ধ করুন' : 'Stop Speaking'}
                    </Button>
                  )}
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Sample Commands */}
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  {language === 'bn' ? 'উদাহরণ বলুন:' : 'Try saying:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {language === 'bn' ? (
                    <>
                      <span className="text-xs bg-muted px-2 py-1 rounded">"কাছের হোটেল দেখাও"</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">"সূর্যাস্ত কখন?"</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">"ম্যাপ খোলো"</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs bg-muted px-2 py-1 rounded">"Show nearby hotels"</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">"When is sunset?"</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">"Open map"</span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceAssistant;
