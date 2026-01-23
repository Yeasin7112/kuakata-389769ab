import React from 'react';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import NoticeBar from '@/components/NoticeBar';
import FeatureGrid from '@/components/FeatureGrid';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto">
        <Banner />
        <NoticeBar />
        <FeatureGrid />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
