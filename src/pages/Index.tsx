import React from 'react';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import NoticeBar from '@/components/NoticeBar';
import FeatureGrid from '@/components/FeatureGrid';
import BottomNav from '@/components/BottomNav';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="max-w-lg mx-auto">
        <Banner />
        <NoticeBar />
        <FeatureGrid />
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
