
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
  const SLIDE_MAX_BG = 120;
  const SLIDE_MAX_PANEL = 120;
  
  // Avatar center = 81 + 48 = 129px, panel top = 120px
  // content needs to move: 120 - 129 = -9, but we clamp to 0 minimum
  // So we let content slide just slightly: 0px (content stays, panel slides up to meet avatar)
  const CONTENT_SLIDE = 0;
  
  const springConfig = useMemo(() => ({ stiffness: 450, damping: 45, mass: 0.8 }), []);
  const pullProgress = useMotionValue(0); 
  const springPull = useSpring(pullProgress, springConfig);

  // Parallax transformations
  const backgroundY = useTransform(springPull, [0, 1], [0, SLIDE_MAX_BG]);
  const panelY = useTransform(springPull, [0, 1], [0, SLIDE_MAX_PANEL]);
  // Content moves to position avatar center at the white panel top edge
  const contentY = useTransform(springPull, [0, 1], [0, CONTENT_SLIDE]);
  const headerOpacity = useTransform(springPull, [0, 0.3], [1, 0]);
  // Border radius only appears when pulling down
  const panelBorderRadius = useTransform(springPull, [0, 0.1], [0, 24]);


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

      {/* 1. Bottom Layer: Aquarium Background */}
      <motion.div 
        style={{ y: backgroundY, translateY: '-100%' }} 
        className="absolute top-0 left-0 right-0 z-0 h-[120px]"
      >
        <AquariumOverlay pullProgress={springPull} feedTrigger={feedTrigger} onBaitEaten={handleBaitEaten} />
      </motion.div>

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

      {/* Top Navigation (fixed) - icons 24x24, padding 16px, gap 16px */}
      <motion.div 
        style={{ opacity: headerOpacity }}
        className="flex items-center justify-between px-[16px] h-[44px] shrink-0 z-[120] absolute top-[44px] left-0 right-0 pointer-events-none"
      >
        <button onClick={() => onNavigate('chat')} className="hover:bg-black/5 rounded-full transition-colors pointer-events-auto">
          {/* Back arrow - 24x24, strokeWidth 2 */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#161823" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex items-center gap-[16px] pointer-events-auto">
          <button>
            {/* Bell icon - smaller viewBox to match visual weight, strokeWidth 2 */}
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" stroke="#161823" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 9.33A7 7 0 0 0 7 9.33c0 8.17-3.5 10.5-3.5 10.5h21s-3.5-2.33-3.5-10.5" />
              <path d="M16 23.33a2.33 2.33 0 0 1-4.04 0" />
            </svg>
          </button>
          <button>
            {/* Share/forward arrow icon - 24x24, strokeWidth 2 */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#161823" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12L14 5V9C7 10 4 15 3 20C5.5 16.5 9 14.68 14 14.68V19L21 12Z" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* 2. Middle Layer: White Background Panel (moves slower than background) */}
      <motion.div 
        className="absolute top-0 left-0 right-0 bottom-[-500px] z-10 bg-white pointer-events-none"
        style={{ y: panelY, borderTopLeftRadius: panelBorderRadius, borderTopRightRadius: panelBorderRadius }}
      />

      {/* 3. Top Layer: Profile Content (moves slowest) */}
      <motion.div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex-1 relative z-20 flex flex-col overflow-hidden bg-transparent"
        style={{ y: contentY }}
      >
        {/* Profile Header - status bar (44px) + 37px = 81px from top */}
        <div className="w-full flex flex-col items-center pt-[81px] shrink-0 pointer-events-none">
          {/* Avatar - 96x96, no border/stroke */}
          <div onClick={handleFeedClick} className="relative cursor-pointer active:scale-95 transition-transform pointer-events-auto">
            <div className="w-[96px] h-[96px] rounded-full overflow-hidden">
               <img src={friendAvatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Username - 10px below avatar, 18px font, 130% line-height */}
          <h1 className="text-[18px] leading-[130%] font-bold text-[#161823] mt-[10px]">esther</h1>
          {/* Account ID - 13px font, 130% line-height */}
          <div className="text-[13px] leading-[130%] text-[#8a8b91]">@estherl0831</div>

          {/* Stats Row - 10px below username area, 45px padding on sides */}
          <div className="flex justify-center items-center mt-[10px] w-full px-[45px]">
            <div className="flex items-center w-full">
              <div className="flex-1 text-center">
                <div className="font-bold text-[17px] leading-[130%] text-[#161823]">264</div>
                <div className="text-[#8a8b91] text-[12px] leading-[130%]">Following</div>
              </div>
              <div className="w-[1px] h-[12px] bg-[#e1e1e1]" />
              <div className="flex-1 text-center">
                <div className="font-bold text-[17px] leading-[130%] text-[#161823]">101</div>
                <div className="text-[#8a8b91] text-[12px] leading-[130%]">Followers</div>
              </div>
              <div className="w-[1px] h-[12px] bg-[#e1e1e1]" />
              <div className="flex-1 text-center">
                <div className="font-bold text-[17px] leading-[130%] text-[#161823]">1,982</div>
                <div className="text-[#8a8b91] text-[12px] leading-[130%]">Likes</div>
              </div>
            </div>
          </div>

          {/* Action Buttons - 10px below stats, Message: 144px, others: 44x44, gap: 4px, no border, rounded-[8px] */}
          <div className="flex items-center gap-[4px] mt-[10px] justify-center pointer-events-auto">
            <button onClick={() => onNavigate('chat')} className="h-[44px] w-[144px] bg-[#f5f5f5] text-[#161823] rounded-[8px] font-semibold text-[15px] leading-[130%] flex items-center justify-center gap-[6px] active:scale-95 transition-all">
              <SendArrowIcon /> Message
            </button>
            <button className="w-[44px] h-[44px] bg-[#f5f5f5] rounded-[8px] flex items-center justify-center active:scale-95 transition-transform">
              {/* User with gear/settings icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#161823" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <circle cx="19" cy="11" r="2.5" />
                <path d="M19 8.5V8" />
                <path d="M19 14v-.5" />
                <path d="M16.5 11H16" />
                <path d="M22 11h-.5" />
              </svg>
            </button>
            <button className="w-[44px] h-[44px] bg-[#f5f5f5] rounded-[8px] flex items-center justify-center active:scale-95 transition-transform">
              <ChevronUp size={20} strokeWidth={2} className="text-[#161823]" />
            </button>
          </div>
        </div>

        {/* Content Tabs & Grid */}
        <div className="flex-1 relative mt-[16px] bg-white">
          <div 
            ref={scrollContainerRef}
            className="h-full overflow-y-auto no-scrollbar"
          >
            {/* Tab Bar */}
            <div className="flex items-center border-b border-[#f0f0f0] sticky top-0 bg-white z-[60]">
              {/* Left tab - grid icon with dropdown, has active indicator */}
              <div className="flex-1 flex justify-center">
                <button className="flex items-center gap-[2px] py-[12px] relative">
                  <GridIcon />
                  <ChevronDown size={12} className="text-[#161823]" />
                  {/* Active indicator line */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40px] h-[2px] bg-[#161823]" />
                </button>
              </div>
              {/* Right tab - repost arrows icon */}
              <div className="flex-1 flex justify-center">
                <button className="py-[12px]">
                  {/* Repost/exchange arrows icon */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8c8c8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 1l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Video Grid - 3 columns with 1.5px gap */}
            <div className="grid grid-cols-3 gap-[1.5px] pb-[400px]">
              {videoItems.map((item) => (
                <div key={item.id} className="aspect-[3/4] relative bg-[#f0f0f0] overflow-hidden">
                  <img src={item.url} className="w-full h-full object-cover" alt="Video" />
                  {/* Play count overlay */}
                  <div className="absolute bottom-[8px] left-[8px] flex items-center gap-[4px] text-white text-[13px] font-semibold">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{item.views}</span>
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
