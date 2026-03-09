
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, Bell, Share2, CheckCircle2, UserPlus, Grid3X3, RotateCcw, Play, SendHorizontal, ChevronUp } from 'lucide-react';
// FIX: Corrected typo from Anisotransition to AnimatePresence.
import { motion, useMotionValue, useSpring, useTransform, animate, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Page } from '../types';
import AquariumOverlay from './AquariumOverlay';

interface ProfileViewProps {
  onNavigate: (page: Page) => void;
  onThemeChange?: (theme: 'light' | 'dark') => void;
  isHungry?: boolean;
  onFeedComplete?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate, onThemeChange, isHungry, onFeedComplete }) => {
  const friendAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80";
  
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

  const videoItems = useMemo(() => Array.from({ length: 9 }).map((_, i) => ({
    id: i,
    views: Math.floor(Math.random() * 200) + 'K',
    url: `https://picsum.photos/seed/${i + 80}/400/600`
  })), []);

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
        <button onClick={() => onNavigate('chat')} className="p-1 hover:bg-black/5 rounded-full transition-colors pointer-events-auto">
          <ChevronLeft size={28} strokeWidth={2.5} className="text-[#161823]" />
        </button>
        <div className="flex items-center gap-5 pr-1 pointer-events-auto">
          <Bell size={24} strokeWidth={2.5} className="text-[#161823]" />
          <Share2 size={24} strokeWidth={2.5} className="text-[#161823]" />
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
        <div className="w-full flex flex-col items-center pt-8 pb-4 shrink-0 pointer-events-none">
          {/* Avatar */}
          <div onClick={handleFeedClick} className="relative mb-2.5 cursor-pointer active:scale-95 transition-transform pointer-events-auto">
            <div className="w-[84px] h-[84px] rounded-full p-[2px] border-2 border-gray-50 bg-white shadow-lg overflow-hidden">
               <img src={friendAvatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-[#161823] tracking-tight leading-tight">Chujie</h1>
          <div className="flex items-center gap-1.5 text-sm font-medium text-[#161823]/40 mt-1">
            <span>@zhangchujie</span>
            <CheckCircle2 size={12} fill="#00BFFF" color="white" />
          </div>

          {/* Stats & Actions */}
          <div className="px-6 w-full mt-6">
            <div className="flex justify-center items-center gap-10 mb-6 w-full">
              <div className="text-center">
                <div className="font-bold text-[18px] text-[#161823]">38</div>
                <div className="text-[#161823]/30 text-[9px] uppercase font-bold tracking-[0.18em]">Following</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-[18px] text-[#161823]">2,598</div>
                <div className="text-[#161823]/30 text-[9px] uppercase font-bold tracking-[0.18em]">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-[18px] text-[#161823]">509K</div>
                <div className="text-[#161823]/30 text-[9px] uppercase font-bold tracking-[0.18em]">Likes</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full pointer-events-auto">
              <button onClick={() => onNavigate('chat')} className="flex-1 h-11 bg-[#fe2c55] text-white rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                <SendHorizontal size={18} className="-rotate-45" /> Message
              </button>
              <button className="w-11 h-11 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 active:scale-95 transition-transform">
                <UserPlus size={20} className="text-[#161823]" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Tabs & Grid */}
        <div className="flex-1 relative mt-1 bg-white">
          <div 
            ref={scrollContainerRef}
            className="h-full overflow-y-auto no-scrollbar"
          >
            <div className="flex border-b border-gray-100 sticky top-0 bg-white z-[60]">
              <button className="flex-1 py-4 flex justify-center border-b-2 border-black">
                <Grid3X3 size={22} className="text-black" />
              </button>
              <button className="flex-1 py-4 flex justify-center text-gray-200">
                <RotateCcw size={22} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-[1px] bg-gray-50 pb-[400px]">
              {videoItems.map((item) => (
                <div key={item.id} className="aspect-[3/4] relative bg-gray-200 overflow-hidden group">
                  <img src={item.url} className="w-full h-full object-cover" alt="Video" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[11px] font-bold drop-shadow-sm">
                    <Play size={10} fill="white" strokeWidth={0} /> {item.views}
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
