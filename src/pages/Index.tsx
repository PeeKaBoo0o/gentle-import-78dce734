import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutUsSection from '@/components/AboutUsSection';
import ScenarioSection from '@/components/ScenarioSection';
import NewsSection from '@/components/NewsSection';
import AnalysisSection from '@/components/AnalysisSection';
import IndicatorsSection from '@/components/IndicatorsSection';
import CalendarSection from '@/components/CalendarSection';
import DictionarySection from '@/components/DictionarySection';
import SocialFloating from '@/components/SocialFloating';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  useEffect(() => {
    supabase.from('page_visits').insert({ page: '/' });
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SocialFloating />
      <HeroSection />
      <AboutUsSection />
      <IndicatorsSection />
      <div className="bg-warm-yellow">
        <CalendarSection />
        <NewsSection />
        <AnalysisSection />
        <DictionarySection />
        <ScenarioSection />
      </div>
    </div>
  );
};

export default Index;
