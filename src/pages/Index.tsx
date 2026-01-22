import React from 'react';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import NoticeBar from '@/components/NoticeBar';
import QuickActions from '@/components/QuickActions';
import FeatureGrid from '@/components/FeatureGrid';
import PopularPlaces from '@/components/PopularPlaces';
import BottomNav from '@/components/BottomNav';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <main className="max-w-lg mx-auto">
        <Banner />
        <NoticeBar />
        <QuickActions />
        <FeatureGrid />
        <PopularPlaces />
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
