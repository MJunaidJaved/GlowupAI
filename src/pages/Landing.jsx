import React from 'react';
import PageTransition from '../components/shared/PageTransition';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import HowItWorks from '../components/landing/HowItWorks';
import FeaturesSection from '../components/landing/FeaturesSection';
import StatsBanner from '../components/landing/StatsBanner';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

export default function Landing() {
  return (
    <PageTransition>
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <StatsBanner />
      <CTASection />
      <Footer />
    </PageTransition>
  );
}