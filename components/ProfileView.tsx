
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, Bell, Share2, UserPlus, ChevronDown, Play, ChevronUp, Repeat2 } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, animate, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Page } from '../types';
import AquariumOverlay from './AquariumOverlay';

// Grid icon component matching the design
const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="4" x2="4" y2="16" />
    <line x1="10" y1="4" x2="10" y2="16" />
    <line x1="16" y1="4" x2="16" y2="16" />
  </svg>
);

// Send/Arrow icon for message button
const SendArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

interface ProfileViewProps {
  onNavigate: (page: Page) => void;
  onThemeChange?: (theme: 'light' | 'dark') => void;
  isHungry?: boolean;
  onFeedComplete?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate, onThemeChange, isHungry, onFeedComplete }) => {
  // Avatar image - two people in a circular frame
  const friendAvatar = "https://images.unsplash.com/photo-1523264939339-c89f9dadde2e?w=400&h=400&fit=crop&q=80";
  
  const [isAquariumMode, setIsAquariumMode] = useState(false);
  const [feedTrigger, setFeedTrigger] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const initialFeedDone = useRef(false);

  // Parallax configuration constants
  const TRIGGER_DISTANCE = 50; 
  const SLIDE_MAX_BG = 140;
  const SLIDE_MAX_PANEL = 140;
  
  const springConfig = useMemo(() => ({ stiffness: 450, damping: 45, mass: 0.8 }), []);
  const pullProgress = useMotionValue(0); 
  const springPull = useSpring(pullProgress, springConfig);

  // Parallax transformations
  const backgroundY = useTransform(springPull, [0, 1], [0, SLIDE_MAX_BG]);
  const panelY = useTransform(springPull, [0, 1], [0, SLIDE_MAX_PANEL]);
  // Final content Y is calculated to center the avatar (position 74px from top) on the dividing line (140px)
  // So, 140 - 74 = 66
  const contentY = useTransform(springPull, [0, 1], [0, 66]);
  const headerOpacity = useTransform(springPull, [0, 0.3], [1, 0]);


  useMotionValueEvent(springPull, "change", (latest) => {
    if (latest > 0.1) onThemeChange?.('light');
    else onThemeChange?.('dark');
  });

  const enterAquarium = useCallback(() => {
    setIsAquariumMode(prev => {
      if (prev) return true; // Already in aquarium mode, do nothing.
      animate(pullProgress, 1, springConfig);
      return true;
    });
  }, [pullProgress, springConfig]);

  useEffect(() => {
    let enterTimeoutId: ReturnType<typeof setTimeout>;
    let feedTimeoutId: ReturnType<typeof setTimeout>;

    if (isHungry && !initialFeedDone.current) {
      initialFeedDone.current = true;
      enterTimeoutId = setTimeout(() => {
        enterAquarium();
        feedTimeoutId = setTimeout(() => setFeedTrigger(c => c + 1), 500); // Auto-feed once on arrival
      }, 600);
    }

    // Cleanup function to clear timeouts if component unmounts
    return () => {
      clearTimeout(enterTimeoutId);
      clearTimeout(feedTimeoutId);
    };
  }, [isHungry, enterAquarium]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scrollContainerRef.current?.scrollTop === 0 || isAquariumMode) {
      startY.current = e.clientY;
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || startY.current === null) return;
    const deltaY = e.clientY - startY.current;
    
    if (!isAquariumMode && deltaY > 0) {
      const progress = Math.min(deltaY / TRIGGER_DISTANCE, 1.1);
      pullProgress.set(progress);
    } else if (isAquariumMode && deltaY < 0) {
      pullProgress.set(Math.max(0, 1 + deltaY / TRIGGER_DISTANCE));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const currentVal = pullProgress.get();
    
    if (!isAquariumMode) {
      if (currentVal > 0.6) enterAquarium(); 
      else animate(pullProgress, 0, springConfig);
    } else {
      if (currentVal < 0.4) exitAquarium();
      else animate(pullProgress, 1, springConfig);
    }
    setIsDragging(false);
  };

  const handleBaitEaten = useCallback(() => {
    onFeedComplete?.();
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2400);
  }, [onFeedComplete]);

  const handleFeedClick = useCallback(() => {
    enterAquarium();
    setFeedTrigger(c => c + 1);
  }, [enterAquarium]);

  const exitAquarium = () => {
    setIsAquariumMode(false);
    animate(pullProgress, 0, springConfig);
  };

  // Video items with view counts matching the design
  const videoItems = useMemo(() => [
    { id: 0, views: '882', url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&q=80' },
    { id: 1, views: '1813', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&q=80' },
    { id: 2, views: '2136', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&q=80' },
    { id: 3, views: '2790', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&q=80' },
    { id: 4, views: '3408', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop&q=80' },
    { id: 5, views: '3573', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&q=80' },
    { id: 6, views: '1.2K', url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&q=80' },
    { id: 7, views: '2.5K', url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=600&fit=crop&q=80' },
    { id: 8, views: '4.1K', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&q=80' },
  ], []);

  return (
    <div className="flex flex-col h-full relative touch-none overflow-hidden bg-white">
      
      {/* FIX: Replaced typo AnsiTransition with AnimatePresence. */}
      <AnimatePresence>
        {showSuccessToast && (
          <div className="absolute top-[50px] left-0 right-0 z-[200] flex justify-center pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="bg-black/20 backdrop-blur-lg px-4 py-2 rounded-full shadow-xl shadow-cyan-400/10 border border-white/10 flex items-center justify-center"
            >
              <span className="text-sm font-bold text-white drop-shadow">Fed!</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. Bottom Layer: Aquarium Background (moves fastest) */}
      <motion.div 
        style={{ y: backgroundY, translateY: '-100%' }} 
        className="absolute top-0 left-0 right-0 z-0 h-[140px]"
      >
        <AquariumOverlay pullProgress={springPull} feedTrigger={feedTrigger} onBaitEaten={handleBaitEaten} />
      </motion.div>
      
      {/* Sand Base Extension */}
      <motion.div
        style={{ y: panelY }}
        className="absolute top-0 left-0 right-0 z-[1] h-10 bg-[#e4ceb1]"
      />

      {/* Hide Aquarium Tip */}
      {/* FIX: Replaced typo AnsiTransition with AnimatePresence. */}
      <AnimatePresence>
        {isAquariumMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-[32px] left-0 right-0 z-50 flex justify-center"
          >
            <button 
              onClick={exitAquarium}
              className="flex flex-col items-center text-white/30 hover:text-white/60 active:scale-95 transition-all p-2 rounded-lg"
            >
              <ChevronUp size={14} className="mb-0.5" />
              <span className="text-[7px] font-bold uppercase tracking-[0.4em]">Hide Aquarium</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation (fixed) */}
      <motion.div 
        style={{ opacity: headerOpacity }}
        className="flex items-center justify-between px-4 h-[44px] shrink-0 z-[120] absolute top-[44px] left-0 right-0 pointer-events-none"
      >
        <button onClick={() => onNavigate('chat')} className="hover:bg-black/5 rounded-full transition-colors pointer-events-auto">
          <ChevronLeft size={28} strokeWidth={1.5} className="text-[#161823]" />
        </button>
        <div className="flex items-center gap-5 pointer-events-auto">
          <button>
            <Bell size={26} strokeWidth={1.5} className="text-[#161823]" />
          </button>
          <button>
            {/* Share/Forward arrow icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#161823" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* 2. Middle Layer: White Background Panel (moves slower than background) */}
      <motion.div 
        className="absolute top-0 left-0 right-0 bottom-[-500px] z-10 bg-white rounded-t-[24px] pointer-events-none"
        style={{ y: panelY }}
      />

      {/* 3. Top Layer: Profile Content (moves slowest) */}
      <motion.div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex-1 relative z-20 flex flex-col overflow-hidden bg-transparent"
        style={{ y: contentY }}
      >
        {/* Profile Header */}
        <div className="w-full flex flex-col items-center pt-6 pb-4 shrink-0 pointer-events-none">
          {/* Avatar - large circular frame matching design */}
          <div onClick={handleFeedClick} className="relative mb-2 cursor-pointer active:scale-95 transition-transform pointer-events-auto">
            <div className="w-[110px] h-[110px] rounded-full p-[3px] bg-gradient-to-b from-[#f0f0f0] to-[#e0e0e0] overflow-hidden">
               <img src={friendAvatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>

          {/* Username */}
          <h1 className="text-[17px] font-bold text-[#161823] tracking-tight leading-tight">esther</h1>
          <div className="text-[14px] text-[#979797] mt-0.5">
            @estherl0831
          </div>

          {/* Stats Row with dividers */}
          <div className="flex justify-center items-center mt-4 w-full">
            <div className="flex items-center">
              <div className="text-center px-5">
                <div className="font-bold text-[17px] text-[#161823]">264</div>
                <div className="text-[#979797] text-[12px]">Following</div>
              </div>
              <div className="w-[1px] h-[14px] bg-[#d8d8d8]" />
              <div className="text-center px-5">
                <div className="font-bold text-[17px] text-[#161823]">101</div>
                <div className="text-[#979797] text-[12px]">Followers</div>
              </div>
              <div className="w-[1px] h-[14px] bg-[#d8d8d8]" />
              <div className="text-center px-5">
                <div className="font-bold text-[17px] text-[#161823]">1,982</div>
                <div className="text-[#979797] text-[12px]">Likes</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 mt-4 px-6 w-full justify-center pointer-events-auto">
            <button onClick={() => onNavigate('chat')} className="h-[42px] px-10 bg-[#f6f6f6] text-[#161823] rounded-[4px] font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all border border-[#ebebeb]">
              <SendArrowIcon /> Message
            </button>
            <button className="w-[42px] h-[42px] bg-[#f6f6f6] rounded-[4px] flex items-center justify-center border border-[#ebebeb] active:scale-95 transition-transform">
              <UserPlus size={18} className="text-[#161823]" />
            </button>
            <button className="w-[42px] h-[42px] bg-[#f6f6f6] rounded-[4px] flex items-center justify-center border border-[#ebebeb] active:scale-95 transition-transform">
              <ChevronDown size={18} className="text-[#161823] rotate-180" />
            </button>
          </div>
        </div>

        {/* Content Tabs & Grid */}
        <div className="flex-1 relative mt-2 bg-white">
          <div 
            ref={scrollContainerRef}
            className="h-full overflow-y-auto no-scrollbar"
          >
            {/* Tab Bar */}
            <div className="flex items-center justify-between px-4 border-b border-[#ebebeb] sticky top-0 bg-white z-[60]">
              <button className="flex items-center gap-1 py-3 border-b-2 border-[#161823]">
                <GridIcon />
                <ChevronDown size={14} className="text-[#161823]" />
              </button>
              <button className="py-3 text-[#d8d8d8]">
                <Repeat2 size={22} />
              </button>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-3 gap-[1px] pb-[400px]">
              {videoItems.map((item) => (
                <div key={item.id} className="aspect-[3/4] relative bg-gray-100 overflow-hidden group">
                  <img src={item.url} className="w-full h-full object-cover" alt="Video" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[13px] font-semibold drop-shadow-md">
                    <Play size={12} fill="white" strokeWidth={0} /> {item.views}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileView;
