import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { WakeSequence } from './WakeSequence';
import { ScrollTransition } from './ScrollTransition';
import { Capabilities } from './Capabilities';
import { ComparisonSection } from './ComparisonSection';
import { ArchitecturePreview } from './ArchitecturePreview';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';
import { useSmoothScroll, useLenis } from '../SmoothScroll';
import { CinematicIntro } from '../CinematicIntro';

interface LandingPageProps {
  onEnterDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard }) => {
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return false;
      return !sessionStorage.getItem('kaizen_intro_seen');
    }
    return true;
  });

  const [isWaking, setIsWaking] = useState(false);
  const [coreState, setCoreState] = useState<'idle' | 'active' | 'awakening'>('idle');
  const [activeSection, setActiveSection] = useState('hero');
  const { scrollToSection } = useSmoothScroll();

  const handleIntroComplete = () => {
    setShowIntro(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kaizen_intro_seen', 'true');
    }
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  // Trigger wake sequence
  const handleWakeTrigger = () => {
    setIsWaking(true);
    setCoreState('awakening');
  };

  // Skip wake sequence
  const handleSkipWake = () => {
    setIsWaking(false);
    setCoreState('active');
    if (onEnterDashboard) {
      onEnterDashboard();
    } else {
      scrollToSection('capabilities', { offset: -60, duration: 1.2 });
    }
  };

  // Complete wake sequence
  const handleCompleteWake = () => {
    setIsWaking(false);
    setCoreState('active');
    if (onEnterDashboard) {
      onEnterDashboard();
    } else {
      scrollToSection('capabilities', { offset: -60, duration: 1.2 });
    }
  };

  // Track active section on scroll
  const checkActiveSection = (scrollPos: number) => {
    const sections = ['hero', 'capabilities', 'architecture', 'experience'];
    const targetPos = scrollPos + 220;

    for (const sectionId of sections) {
      const el = document.getElementById(sectionId);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (targetPos >= top && targetPos < top + height) {
          setActiveSection(sectionId);
          break;
        }
      }
    }
  };

  useLenis((lenis) => {
    checkActiveSection(lenis.scroll);
  });

  useEffect(() => {
    const handleScroll = () => {
      checkActiveSection(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0c0e] text-[#f8fafc] relative selection:bg-amber-500/30 selection:text-amber-200 font-sans overflow-x-hidden">
      {/* Global Cyber Mesh Grid Background */}
      <div className="fixed inset-0 pointer-events-none cyber-grid opacity-40 z-0" />

      {/* Ambient background soft glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-amber-500/10 via-amber-700/10 to-transparent rounded-full blur-[160px]" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-600/10 via-amber-800/10 to-transparent rounded-full blur-[170px]" />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-gradient-to-t from-amber-700/10 via-transparent to-transparent rounded-full blur-[180px]" />
      </div>

      {/* Floating Header */}
      <Navbar 
        onEnterSystem={handleWakeTrigger} 
        activeSection={activeSection} 
      />

      {/* Main Sections */}
      <main className="relative z-10">
        {/* 1. Hero Section */}
        <Hero 
          onWake={handleWakeTrigger} 
          coreState={coreState}
          onReplayIntro={handleReplayIntro}
        />

        {/* 2. Scroll Transition */}
        <ScrollTransition />

        {/* 3. Capabilities Section ("ONE SYSTEM. MULTIPLE INTELLIGENCES.") */}
        <Capabilities />

        {/* 4. Comparison Section ("NOT JUST A CHATBOT.") */}
        <ComparisonSection />

        {/* 5. Architecture Preview ("INSIDE KAIZEN") */}
        <ArchitecturePreview />

        {/* 6. Final CTA ("MORE THAN AN ASSISTANT.") */}
        <FinalCTA onEnter={handleWakeTrigger} />
      </main>

      {/* 7. Footer */}
      <Footer />

      {/* Cinematic Wake KAIZEN Initialization HUD Modal */}
      {isWaking && (
        <WakeSequence 
          onComplete={handleCompleteWake} 
          onSkip={handleSkipWake} 
        />
      )}

      {/* Cinematic GSAP + Three.js Intro Sequence */}
      {showIntro && (
        <CinematicIntro onComplete={handleIntroComplete} />
      )}
    </div>
  );
};
