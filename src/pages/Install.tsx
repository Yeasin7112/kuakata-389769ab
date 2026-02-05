 import React, { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useLanguage } from '@/contexts/LanguageContext';
 import { ArrowLeft, Download, Smartphone, Check, Share, MoreVertical } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent } from '@/components/ui/card';
 
 interface BeforeInstallPromptEvent extends Event {
   prompt: () => Promise<void>;
   userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
 }
 
 const Install: React.FC = () => {
   const { language } = useLanguage();
   const navigate = useNavigate();
   const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
   const [isInstalled, setIsInstalled] = useState(false);
   const [isIOS, setIsIOS] = useState(false);
 
   useEffect(() => {
     // Check if already installed
     if (window.matchMedia('(display-mode: standalone)').matches) {
       setIsInstalled(true);
     }
 
     // Check if iOS
     const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
     setIsIOS(isIOSDevice);
 
     // Listen for install prompt
     const handleBeforeInstallPrompt = (e: Event) => {
       e.preventDefault();
       setDeferredPrompt(e as BeforeInstallPromptEvent);
     };
 
     window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
 
     return () => {
       window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
     };
   }, []);
 
   const handleInstall = async () => {
     if (!deferredPrompt) return;
     
     deferredPrompt.prompt();
     const { outcome } = await deferredPrompt.userChoice;
     
     if (outcome === 'accepted') {
       setIsInstalled(true);
     }
     setDeferredPrompt(null);
   };
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="sticky top-0 z-10 bg-primary text-primary-foreground p-4 flex items-center gap-3 safe-area-top">
         <button onClick={() => navigate(-1)} className="p-1">
           <ArrowLeft className="w-5 h-5" />
         </button>
         <div>
           <h1 className="text-lg font-bold">
             {language === 'bn' ? '📲 অ্যাপ ইনস্টল করুন' : '📲 Install App'}
           </h1>
         </div>
       </header>
 
       <main className="p-4 max-w-lg mx-auto space-y-6">
         {/* App Preview Card */}
         <Card className="overflow-hidden">
           <CardContent className="p-6 text-center">
             <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
               <img 
                 src="/icons/icon-512.png" 
                 alt="OurKuakata" 
                 className="w-full h-full object-cover"
               />
             </div>
             <h2 className="text-xl font-bold mb-1">OurKuakata</h2>
             <p className="text-sm text-muted-foreground">
               {language === 'bn' 
                 ? 'স্মার্ট ট্যুরিস্ট গাইড' 
                 : 'Smart Tourist Guide'}
             </p>
           </CardContent>
         </Card>
 
         {/* Installation Status */}
         {isInstalled ? (
           <Card className="border-green-500 bg-green-50 dark:bg-green-950">
             <CardContent className="p-6 text-center">
               <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
                 <Check className="w-8 h-8 text-white" />
               </div>
               <h3 className="text-lg font-bold text-green-700 dark:text-green-300 mb-2">
                 {language === 'bn' ? 'ইনস্টল সম্পন্ন!' : 'Already Installed!'}
               </h3>
               <p className="text-sm text-green-600 dark:text-green-400">
                 {language === 'bn' 
                   ? 'অ্যাপটি আপনার হোম স্ক্রিনে আছে' 
                   : 'The app is on your home screen'}
               </p>
             </CardContent>
           </Card>
         ) : (
           <>
             {/* Install Button for Android/Chrome */}
             {deferredPrompt && (
               <Button 
                 onClick={handleInstall} 
                 size="lg" 
                 className="w-full gap-2 h-14 text-lg"
               >
                 <Download className="w-6 h-6" />
                 {language === 'bn' ? 'এখনই ইনস্টল করুন' : 'Install Now'}
               </Button>
             )}
 
             {/* iOS Instructions */}
             {isIOS && (
               <Card>
                 <CardContent className="p-6">
                   <h3 className="font-bold mb-4 flex items-center gap-2">
                     <Smartphone className="w-5 h-5" />
                     {language === 'bn' ? 'iPhone-এ ইনস্টল করুন' : 'Install on iPhone'}
                   </h3>
                   <ol className="space-y-4 text-sm">
                     <li className="flex items-start gap-3">
                       <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</span>
                       <div>
                         <p className="font-medium">
                           {language === 'bn' ? 'Share বাটনে ট্যাপ করুন' : 'Tap the Share button'}
                         </p>
                         <Share className="w-5 h-5 mt-1 text-muted-foreground" />
                       </div>
                     </li>
                     <li className="flex items-start gap-3">
                       <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">2</span>
                       <p className="font-medium">
                         {language === 'bn' 
                           ? '"Add to Home Screen" সিলেক্ট করুন' 
                           : 'Select "Add to Home Screen"'}
                       </p>
                     </li>
                     <li className="flex items-start gap-3">
                       <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">3</span>
                       <p className="font-medium">
                         {language === 'bn' ? '"Add" ট্যাপ করুন' : 'Tap "Add"'}
                       </p>
                     </li>
                   </ol>
                 </CardContent>
               </Card>
             )}
 
             {/* Android Manual Instructions */}
             {!isIOS && !deferredPrompt && (
               <Card>
                 <CardContent className="p-6">
                   <h3 className="font-bold mb-4 flex items-center gap-2">
                     <Smartphone className="w-5 h-5" />
                     {language === 'bn' ? 'Android-এ ইনস্টল করুন' : 'Install on Android'}
                   </h3>
                   <ol className="space-y-4 text-sm">
                     <li className="flex items-start gap-3">
                       <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</span>
                       <div>
                         <p className="font-medium">
                           {language === 'bn' ? 'মেনু আইকনে ট্যাপ করুন' : 'Tap the menu icon'}
                         </p>
                         <MoreVertical className="w-5 h-5 mt-1 text-muted-foreground" />
                       </div>
                     </li>
                     <li className="flex items-start gap-3">
                       <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">2</span>
                       <p className="font-medium">
                         {language === 'bn' 
                           ? '"Install app" বা "Add to Home screen" সিলেক্ট করুন' 
                           : 'Select "Install app" or "Add to Home screen"'}
                       </p>
                     </li>
                     <li className="flex items-start gap-3">
                       <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">3</span>
                       <p className="font-medium">
                         {language === 'bn' ? '"Install" ট্যাপ করুন' : 'Tap "Install"'}
                       </p>
                     </li>
                   </ol>
                 </CardContent>
               </Card>
             )}
           </>
         )}
 
         {/* Features */}
         <Card>
           <CardContent className="p-6">
             <h3 className="font-bold mb-4">
               {language === 'bn' ? '✨ অ্যাপের সুবিধা' : '✨ App Benefits'}
             </h3>
             <ul className="space-y-3 text-sm">
               <li className="flex items-center gap-3">
                 <Check className="w-5 h-5 text-green-500" />
                 {language === 'bn' ? 'অফলাইনে কাজ করে' : 'Works offline'}
               </li>
               <li className="flex items-center gap-3">
                 <Check className="w-5 h-5 text-green-500" />
                 {language === 'bn' ? 'দ্রুত লোড হয়' : 'Loads faster'}
               </li>
               <li className="flex items-center gap-3">
                 <Check className="w-5 h-5 text-green-500" />
                 {language === 'bn' ? 'হোম স্ক্রিনে শর্টকাট' : 'Home screen shortcut'}
               </li>
               <li className="flex items-center gap-3">
                 <Check className="w-5 h-5 text-green-500" />
                 {language === 'bn' ? 'ফুল স্ক্রিন এক্সপেরিয়েন্স' : 'Full screen experience'}
               </li>
             </ul>
           </CardContent>
         </Card>
       </main>
     </div>
   );
 };
 
 export default Install;