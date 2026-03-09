
import React from 'react';
import { ChevronLeft, Flag, MoreHorizontal, Camera, Image as ImageIcon, Mic, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Page } from '../types';
import AquariumWidget from './AquariumWidget';

interface ChatViewProps {
  onNavigate: (page: Page) => void;
  isHungry?: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ onNavigate, isHungry }) => {
  const friendAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80";

  return (
    <div className="flex flex-col h-full bg-white relative pt-[44px]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1 bg-white border-b border-gray-100/60 z-50 sticky top-0 h-[44px]">
        <div className="flex items-center gap-1">
          <button className="p-2 -ml-1 active:opacity-50 transition-opacity">
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 active:scale-95 transition-transform relative"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 shadow-sm bg-gray-100 flex-shrink-0">
              <img 
                src={friendAvatar} 
                alt="Chujie Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex items-center gap-1">
              <span className="font-bold text-[16px] tracking-tight text-[#161823]">Chujie</span>
              <div className="flex items-center">
                <span className="text-orange-500 scale-100 mr-0.5 text-[14px]">🔥</span>
                <span className="text-[#fe2c55] font-bold text-[14px]">133</span>
              </div>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-3.5 pr-1">
          <Flag size={22} strokeWidth={2.5} className="text-black/90" />
          <MoreHorizontal size={22} strokeWidth={2.5} className="text-black/90" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-1 no-scrollbar" style={{ paddingBottom: isHungry ? '150px' : '140px', transition: 'padding-bottom 0.4s ease-out' }}>
        <div className="flex flex-col space-y-[10px]">
          <div className="text-center text-[12px] text-gray-400 font-light tracking-tight py-1">9:18 PM</div>
          <div className="flex justify-end">
            <div className="bg-[#00adef] text-white px-3.5 py-[9px] rounded-[20px] rounded-tr-[4px] max-w-[80%] text-[15.5px] font-medium leading-[1.3]">
              Did she sing "Love Story"?
            </div>
          </div>
          <div className="text-center text-[12px] text-gray-400 font-light tracking-tight py-1">9:35 PM</div>
          <div className="flex justify-end">
            <div className="bg-[#00adef] text-white px-3.5 py-[9px] rounded-[20px] rounded-tr-[4px] max-w-[80%] text-[15.5px] font-medium leading-[1.3]">
              Nooo, what happened??? Was it amazing?
            </div>
          </div>
          <div className="text-center text-[12px] text-gray-400 font-light tracking-tight py-1">12:20 PM</div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="w-8 flex-shrink-0" />
              <div className="bg-white border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.05)] px-3.5 py-[9px] rounded-[20px] rounded-bl-[4px] text-[15.5px] font-medium leading-[1.3] text-[#161823] max-w-[80%]">
                Count me in plzz. But tickets are gonna sell out fast. We should set up a plan.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-100">
                <img 
                  onClick={() => onNavigate('profile')}
                  src={friendAvatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <span className="text-[48px] leading-none py-1 select-none">😂</span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        {/* Live Aquarium Widget */}
        <AnimatePresence>
          {isHungry && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
              className="px-3 pb-1.5"
            >
              <AquariumWidget onClick={() => onNavigate('profile')} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Input Controls */}
        <div className="bg-white border-t border-gray-50 pt-2 pb-[34px]">
          <div className="px-3 space-y-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
              {['❤️', '😂', '👍'].map((emoji, idx) => (
                <button key={idx} className="min-w-[48px] h-[38px] bg-gray-100/70 rounded-full flex items-center justify-center text-xl active:scale-90 transition-transform">
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 bg-[#00adef] rounded-full flex items-center justify-center text-white active:scale-90 transition-transform flex-shrink-0">
                <Camera size={22} strokeWidth={2.5} />
              </button>
              <div className="flex-1 min-w-0 bg-gray-100/70 rounded-full px-3.5 h-10 flex items-center gap-3 border border-gray-50/50">
                <input type="text" placeholder="Message..." className="bg-transparent flex-1 min-w-0 outline-none text-[16px] text-[#161823] placeholder:text-gray-400/80 font-medium" />
                <Smile size={22} className="text-black/90 cursor-pointer" strokeWidth={2.5} />
                <ImageIcon size={22} className="text-black/90 cursor-pointer" strokeWidth={2.5} />
              </div>
              <Mic size={24} className="text-black cursor-pointer mx-1" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
