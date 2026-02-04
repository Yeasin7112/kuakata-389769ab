import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import NoticeBar from '@/components/NoticeBar';
import FeatureGrid from '@/components/FeatureGrid';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import NotificationBanner from '@/components/NotificationBanner';
import FloatingSOS from '@/components/FloatingSOS';
import { useNotificationSubscription } from '@/hooks/useNotifications';

const Index: React.FC = () => {
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);

  // Subscribe to real-time notifications
  useNotificationSubscription();

  useEffect(() => {
    // Show notification banner after 3 seconds if not dismissed before
    const dismissed = localStorage.getItem('notification-banner-dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setShowNotificationBanner(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissNotification = () => {
    setShowNotificationBanner(false);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full">
        <Banner />
        {showNotificationBanner && (
          <NotificationBanner onDismiss={handleDismissNotification} />
        )}
        <NoticeBar />
        <FeatureGrid />
      </main>
      <Footer />
      <FloatingSOS />
      <BottomNav />
    </div>
  );
};

export default Index;
