// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface VoiceCommand {
  patterns: {
    bn: RegExp[];
    en: RegExp[];
  };
  action: string;
  response: {
    bn: string;
    en: string;
  };
}

const voiceCommands: VoiceCommand[] = [
  {
    patterns: {
      bn: [/কাছের হোটেল/i, /নিকটতম হোটেল/i, /হোটেল দেখাও/i, /হোটেল খুঁজি/i],
      en: [/nearby hotel/i, /show hotel/i, /find hotel/i, /hotels near/i]
    },
    action: 'navigate_hotels',
    response: { bn: 'কাছের হোটেলগুলো দেখাচ্ছি', en: 'Showing nearby hotels' }
  },
  {
    patterns: {
      bn: [/সূর্যাস্ত কখন/i, /সূর্য ডোবে কখন/i, /সন্ধ্যা কখন/i],
      en: [/sunset.*when/i, /when.*sunset/i, /sunset time/i]
    },
    action: 'get_sunset',
    response: { bn: 'আজকের সূর্যাস্তের সময় জানাচ্ছি', en: 'Getting today\'s sunset time' }
  },
  {
    patterns: {
      bn: [/সূর্যোদয় কখন/i, /সূর্য ওঠে কখন/i, /সকাল কখন/i],
      en: [/sunrise.*when/i, /when.*sunrise/i, /sunrise time/i]
    },
    action: 'get_sunrise',
    response: { bn: 'আজকের সূর্যোদয়ের সময় জানাচ্ছি', en: 'Getting today\'s sunrise time' }
  },
  {
    patterns: {
      bn: [/জরুরি/i, /ইমার্জেন্সি/i, /এম্বুলেন্স/i, /পুলিশ/i, /ফায়ার/i],
      en: [/emergency/i, /ambulance/i, /police/i, /fire/i, /help/i]
    },
    action: 'navigate_emergency',
    response: { bn: 'জরুরি সেবা দেখাচ্ছি', en: 'Showing emergency services' }
  },
  {
    patterns: {
      bn: [/কাছের রেস্টুরেন্ট/i, /খাবার/i, /রেস্তোরাঁ/i, /খেতে চাই/i],
      en: [/nearby restaurant/i, /food/i, /restaurant/i, /where.*eat/i]
    },
    action: 'navigate_restaurants',
    response: { bn: 'কাছের রেস্টুরেন্টগুলো দেখাচ্ছি', en: 'Showing nearby restaurants' }
  },
  {
    patterns: {
      bn: [/ব্যাংক/i, /এটিএম/i, /টাকা/i],
      en: [/bank/i, /atm/i, /money/i, /cash/i]
    },
    action: 'navigate_banks',
    response: { bn: 'কাছের ব্যাংক ও এটিএম দেখাচ্ছি', en: 'Showing nearby banks and ATMs' }
  },
  {
    patterns: {
      bn: [/দর্শনীয় স্থান/i, /ঘুরতে/i, /পর্যটন/i, /কোথায় যাব/i],
      en: [/tourist.*spot/i, /places.*visit/i, /sightseeing/i, /attraction/i]
    },
    action: 'navigate_places',
    response: { bn: 'দর্শনীয় স্থানগুলো দেখাচ্ছি', en: 'Showing tourist spots' }
  },
  {
    patterns: {
      bn: [/আবহাওয়া/i, /বৃষ্টি/i, /তাপমাত্রা/i],
      en: [/weather/i, /rain/i, /temperature/i, /forecast/i]
    },
    action: 'navigate_weather',
    response: { bn: 'আবহাওয়ার তথ্য দেখাচ্ছি', en: 'Showing weather information' }
  },
  {
    patterns: {
      bn: [/জোয়ার/i, /ভাটা/i, /টাইড/i],
      en: [/tide/i, /high tide/i, /low tide/i]
    },
    action: 'navigate_beach_safety',
    response: { bn: 'জোয়ার-ভাটার তথ্য দেখাচ্ছি', en: 'Showing tide information' }
  },
  {
    patterns: {
      bn: [/মানচিত্র/i, /ম্যাপ/i, /লোকেশন/i],
      en: [/map/i, /location/i, /navigate/i, /direction/i]
    },
    action: 'navigate_map',
    response: { bn: 'মানচিত্র খুলছি', en: 'Opening map' }
  },
  {
    patterns: {
      bn: [/এআর/i, /ক্যামেরা/i, /আর্ক্যামেরা/i],
      en: [/ar/i, /camera/i, /ar camera/i, /augmented/i]
    },
    action: 'navigate_ar',
    response: { bn: 'এআর ক্যামেরা খুলছি', en: 'Opening AR camera' }
  },
  {
    patterns: {
      bn: [/নামাজ/i, /সালাত/i, /আজান/i, /প্রার্থনা/i],
      en: [/prayer/i, /namaz/i, /salat/i, /pray/i]
    },
    action: 'get_prayer_times',
    response: { bn: 'নামাজের সময় জানাচ্ছি', en: 'Getting prayer times' }
  }
];

export const useVoiceAssistant = () => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;
    
    recognitionRef.current = new SpeechRecognitionClass();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language === 'bn' ? 'bn-BD' : 'en-US';

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript;
      setTranscript(text);
      
      if (result.isFinal) {
        processCommand(text);
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error === 'not-allowed' 
        ? (language === 'bn' ? 'মাইক্রোফোন অনুমতি দিন' : 'Please allow microphone access')
        : (language === 'bn' ? 'কিছু সমস্যা হয়েছে' : 'Something went wrong'));
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, isSupported]);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    }
  }, [language]);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const processCommand = useCallback(async (text: string) => {
    setIsProcessing(true);
    setError(null);
    
    const lowerText = text.toLowerCase();
    let matchedCommand: VoiceCommand | null = null;
    
    // Check for matching command
    for (const cmd of voiceCommands) {
      const patterns = language === 'bn' ? cmd.patterns.bn : cmd.patterns.en;
      const matched = patterns.some(pattern => pattern.test(lowerText));
      if (matched) {
        matchedCommand = cmd;
        break;
      }
    }

    if (matchedCommand) {
      const responseText = language === 'bn' ? matchedCommand.response.bn : matchedCommand.response.en;
      
      // Handle dynamic data fetching
      if (matchedCommand.action === 'get_sunset' || matchedCommand.action === 'get_sunrise') {
        try {
          const today = new Date().toISOString().split('T')[0];
          const { data: sunTimes } = await supabase
            .from('sun_times')
            .select('*')
            .eq('date', today)
            .single();
          
          if (sunTimes) {
            const time = matchedCommand.action === 'get_sunset' ? sunTimes.sunset : sunTimes.sunrise;
            const timeLabel = matchedCommand.action === 'get_sunset' 
              ? (language === 'bn' ? 'সূর্যাস্ত' : 'Sunset')
              : (language === 'bn' ? 'সূর্যোদয়' : 'Sunrise');
            const fullResponse = language === 'bn' 
              ? `আজকের ${timeLabel} হবে ${time}` 
              : `Today's ${timeLabel} is at ${time}`;
            setResponse(fullResponse);
            speak(fullResponse);
          } else {
            const notFoundText = language === 'bn' ? 'তথ্য পাওয়া যায়নি' : 'Information not available';
            setResponse(notFoundText);
            speak(notFoundText);
          }
        } catch (e) {
          const errorText = language === 'bn' ? 'তথ্য লোড করতে সমস্যা হয়েছে' : 'Failed to load information';
          setResponse(errorText);
          speak(errorText);
        }
      } else if (matchedCommand.action === 'get_prayer_times') {
        try {
          const today = new Date().toISOString().split('T')[0];
          const { data: prayerTimes } = await supabase
            .from('prayer_times')
            .select('*')
            .eq('date', today)
            .single();
          
          if (prayerTimes) {
            const fullResponse = language === 'bn'
              ? `ফজর ${prayerTimes.fajr}, যোহর ${prayerTimes.dhuhr}, আসর ${prayerTimes.asr}, মাগরিব ${prayerTimes.maghrib}, ইশা ${prayerTimes.isha}`
              : `Fajr ${prayerTimes.fajr}, Dhuhr ${prayerTimes.dhuhr}, Asr ${prayerTimes.asr}, Maghrib ${prayerTimes.maghrib}, Isha ${prayerTimes.isha}`;
            setResponse(fullResponse);
            speak(fullResponse);
          } else {
            const notFoundText = language === 'bn' ? 'নামাজের সময় পাওয়া যায়নি' : 'Prayer times not available';
            setResponse(notFoundText);
            speak(notFoundText);
          }
        } catch (e) {
          const errorText = language === 'bn' ? 'তথ্য লোড করতে সমস্যা হয়েছে' : 'Failed to load information';
          setResponse(errorText);
          speak(errorText);
        }
      } else {
        setResponse(responseText);
        speak(responseText);
      }
      
      setIsProcessing(false);
      return { action: matchedCommand.action, response: responseText };
    } else {
      const fallback = language === 'bn' 
        ? 'দুঃখিত, আমি বুঝতে পারিনি। অনুগ্রহ করে আবার বলুন।' 
        : 'Sorry, I didn\'t understand. Please try again.';
      setResponse(fallback);
      speak(fallback);
      setIsProcessing(false);
      return { action: null, response: fallback };
    }
  }, [language, speak]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError(language === 'bn' ? 'এই ব্রাউজারে সাপোর্ট নেই' : 'Not supported in this browser');
      return;
    }
    
    setError(null);
    setTranscript('');
    setResponse('');
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error('Failed to start recognition:', e);
      setError(language === 'bn' ? 'মাইক্রোফোন চালু করতে সমস্যা হয়েছে' : 'Failed to start microphone');
    }
  }, [isSupported, language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    response,
    error,
    isSupported,
    startListening,
    stopListening,
    stopSpeaking,
    speak
  };
};
