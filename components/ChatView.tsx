
import React from 'react';
import { ChevronLeft, Flag, MoreHorizontal, Camera, Image as ImageIcon, Mic, Smile, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Page } from '../types';
import AquariumWidget from './AquariumWidget';

interface ChatViewProps {
  onNavigate: (page: Page, options?: { autoFeed?: boolean }) => void;
  isHungry?: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ onNavigate, isHungry }) => {
  const friendAvatar = "https://images.unsplash.com/photo-1523264939339-c89f9dadde2e?w=400&h=400&fit=crop&q=80";

  return (
    <div className="flex flex-col h-full bg-white relative pt-[44px]">
      {/* Header */}
      <div className="flex items-center justify-between px-[16px] py-1 bg-white border-b border-gray-100/60 z-50 sticky top-0 h-[56px]">
        <div className="flex items-center gap-[12px]">
          <button className="active:opacity-50 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#161823" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-[10px] active:scale-95 transition-transform relative"
          >
            {/* Avatar with online indicator */}
            <div className="relative">
              <div className="w-[44px] h-[44px] rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  src={friendAvatar} 
                  alt="esther Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Green online indicator */}
              <div className="absolute bottom-0 left-0 w-[14px] h-[14px] bg-[#1dd765] rounded-full border-2 border-white" />
            </div>
            
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-[4px]">
                <span className="font-bold text-[16px] tracking-tight text-[#161823]">esther</span>
                <span className="text-[14px]">🔥</span>
                <span className="text-[#fe2c55] font-bold text-[14px]">3</span>
              </div>
              <span className="text-[12px] text-[#8a8b91]">Active now</span>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-[20px]">
          <Flag size={24} strokeWidth={2} className="text-[#161823]" />
          <MoreHorizontal size={24} strokeWidth={2} className="text-[#161823]" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Aquarium Background Layer - z-0, behind everything */}
        <AnimatePresence>
          {isHungry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute left-0 right-0 z-0"
              style={{ bottom: '128px', height: '120px' }}
            >
              <AquariumWidget onClick={() => onNavigate('profile', { autoFeed: true })} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transparent click target for aquarium - z-20, above scroll layer */}
        <AnimatePresence>
          {isHungry && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute left-0 right-0 z-20 cursor-pointer"
              style={{ bottom: '128px', height: '120px' }}
              onClick={() => onNavigate('profile', { autoFeed: true })}
            />
          )}
        </AnimatePresence>

        {/* Messages Scroll Area - z-10, normal pointer-events for scrolling */}
        <div 
          className="absolute inset-0 overflow-y-auto px-[16px] pt-[16px] no-scrollbar z-10" 
          style={{ paddingBottom: isHungry ? '240px' : '170px', transition: 'padding-bottom 0.4s ease-out' }}
        >
          <div className="flex flex-col space-y-[16px]">
            {/* Other person's message */}
            <div className="flex items-end gap-[10px]">
              <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  onClick={() => onNavigate('profile')}
                  src={friendAvatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <div className="bg-[#f5f5f5] px-[14px] py-[10px] rounded-[18px] rounded-bl-[4px] max-w-[70%] text-[15px] leading-[1.4] text-[#161823]">
                Wowww! She always knows how to captivate her audience.
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-center text-[13px] text-[#8a8b91] py-[4px]">9:20 PM</div>

            {/* Other person's message */}
            <div className="flex items-end gap-[10px]">
              <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  onClick={() => onNavigate('profile')}
                  src={friendAvatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <div className="bg-[#f5f5f5] px-[14px] py-[10px] rounded-[18px] rounded-bl-[4px] max-w-[70%] text-[15px] leading-[1.4] text-[#161823]">
                Wanna buy ticket together?
              </div>
            </div>

            {/* My message */}
            <div className="flex justify-end">
              <div className="bg-[#20d5ec] text-white px-[14px] py-[10px] rounded-[18px] rounded-br-[4px] max-w-[70%] text-[15px] leading-[1.4]">
                Count me in plzz. But tickets are gonna sell out fast. We should set up a plan.
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-center text-[13px] text-[#8a8b91] py-[4px]">9:21 PM</div>

            {/* Other person's message */}
            <div className="flex items-end gap-[10px]">
              <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  onClick={() => onNavigate('profile')}
                  src={friendAvatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <div className="bg-[#f5f5f5] px-[14px] py-[10px] rounded-[18px] rounded-bl-[4px] max-w-[70%] text-[15px] leading-[1.4] text-[#161823]">
                Hahah, ok!
              </div>
            </div>

            {/* My message */}
            <div className="flex justify-end">
              <div className="bg-[#20d5ec] text-white px-[14px] py-[10px] rounded-[18px] rounded-br-[4px] max-w-[70%] text-[15px] leading-[1.4]">
                Count me in plzz. But tickets are gonna sell out fast. We should set up a plan.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-white pt-[8px] pb-[34px]">
        <div className="px-[12px] space-y-[10px]">
          {/* Quick action buttons */}
          <div className="flex gap-[8px] overflow-x-auto no-scrollbar py-[4px]">
            <button className="min-w-[48px] h-[36px] bg-[#f5f5f5] rounded-full flex items-center justify-center text-[18px] active:scale-90 transition-transform">
              ❤️
            </button>
            <button className="min-w-[48px] h-[36px] bg-[#f5f5f5] rounded-full flex items-center justify-center text-[18px] active:scale-90 transition-transform">
              😆
            </button>
            <button className="min-w-[48px] h-[36px] bg-[#f5f5f5] rounded-full flex items-center justify-center text-[18px] active:scale-90 transition-transform">
              👍
            </button>
            <button className="h-[36px] px-[12px] bg-[#f5f5f5] rounded-full flex items-center justify-center gap-[6px] active:scale-90 transition-transform">
              <Gamepad2 size={18} className="text-[#8a5cf5]" />
              <span className="text-[14px] font-medium text-[#161823]">Games</span>
            </button>
            <button className="h-[36px] px-[12px] bg-[#f5f5f5] rounded-full flex items-center justify-center gap-[6px] active:scale-90 transition-transform whitespace-nowrap">
              <span className="text-[14px] font-bold text-[#fe2c55]">AI</span>
              <span className="text-[14px] font-medium text-[#161823]">Group Sh...</span>
            </button>
          </div>
          {/* Message input row */}
          <div className="flex items-center gap-[8px]">
            <button className="w-[40px] h-[40px] bg-[#20d5ec] rounded-full flex items-center justify-center text-white active:scale-90 transition-transform flex-shrink-0">
              <Camera size={20} strokeWidth={2} />
            </button>
            <div className="flex-1 min-w-0 bg-[#f5f5f5] rounded-full px-[14px] h-[40px] flex items-center gap-[12px]">
              <input type="text" placeholder="Message..." className="bg-transparent flex-1 min-w-0 outline-none text-[15px] text-[#161823] placeholder:text-[#8a8b91]" />
              <Smile size={24} className="text-[#161823] cursor-pointer" strokeWidth={1.5} />
              <ImageIcon size={24} className="text-[#161823] cursor-pointer" strokeWidth={1.5} />
            </div>
            <Mic size={24} className="text-[#161823] cursor-pointer flex-shrink-0" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
