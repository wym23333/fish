
import React from 'react';
import { ChevronLeft, Flag, MoreHorizontal, Camera, Image as ImageIcon, Mic, Smile, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Page } from '../types';
import AquariumWidget from './AquariumWidget';

interface ChatViewProps {
  onNavigate: (page: Page) => void;
  isHungry?: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ onNavigate, isHungry }) => {
  const friendAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80";
  const friendName = "Chujie";
  const streakCount = 133;

  return (
    <div className="flex flex-col h-full bg-white relative pt-[44px]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-100/60 z-50 sticky top-0 h-[56px]">
        <div className="flex items-center gap-2">
          <button className="p-1 -ml-1 active:opacity-50 transition-opacity">
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-3 active:scale-95 transition-transform relative"
          >
            {/* Avatar with online status */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm bg-gray-100 flex-shrink-0">
                <img 
                  src={friendAvatar} 
                  alt={`${friendName} Avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#1dd765] rounded-full border-2 border-white" />
            </div>
            
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                <span className="font-bold text-[17px] tracking-tight text-[#161823]">{friendName}</span>
                <span className="text-orange-500 scale-100 text-[14px]">🔥</span>
                <span className="text-[#fe2c55] font-bold text-[14px]">{streakCount}</span>
              </div>
              <span className="text-[12px] text-gray-400 font-normal">Active now</span>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-4 pr-1">
          <Flag size={22} strokeWidth={2.5} className="text-black/90" />
          <MoreHorizontal size={22} strokeWidth={2.5} className="text-black/90" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-1 no-scrollbar bg-[#f9f9f9]" style={{ paddingBottom: isHungry ? '180px' : '170px', transition: 'padding-bottom 0.4s ease-out' }}>
        <div className="flex flex-col gap-3">
          {/* Friend message with avatar */}
          <div className="flex items-end gap-2">
            <div 
              onClick={() => onNavigate('profile')}
              className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-100 cursor-pointer"
            >
              <img 
                src={friendAvatar} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white px-4 py-3 rounded-[20px] rounded-bl-[4px] text-[15px] leading-[1.4] text-[#161823] max-w-[75%] shadow-sm">
              Wowww! She always knows how to captivate her audience.
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-center text-[13px] text-gray-400 font-normal py-2">9:20 PM</div>

          {/* Friend message with avatar */}
          <div className="flex items-end gap-2">
            <div 
              onClick={() => onNavigate('profile')}
              className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-100 cursor-pointer"
            >
              <img 
                src={friendAvatar} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white px-4 py-3 rounded-[20px] rounded-bl-[4px] text-[15px] leading-[1.4] text-[#161823] max-w-[75%] shadow-sm">
              Wanna buy ticket together?
            </div>
          </div>

          {/* User message (right side) */}
          <div className="flex justify-end">
            <div className="bg-[#01a1da] text-white px-4 py-3 rounded-[20px] rounded-br-[4px] max-w-[75%] text-[15px] leading-[1.4]">
              Count me in plzz. But tickets are gonna sell out fast. We should set up a plan.
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-center text-[13px] text-gray-400 font-normal py-2">9:21 PM</div>

          {/* Friend message with avatar */}
          <div className="flex items-end gap-2">
            <div 
              onClick={() => onNavigate('profile')}
              className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-100 cursor-pointer"
            >
              <img 
                src={friendAvatar} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white px-4 py-3 rounded-[20px] rounded-bl-[4px] text-[15px] leading-[1.4] text-[#161823] max-w-[75%] shadow-sm">
              Hahah, ok!
            </div>
          </div>

          {/* User message (right side) */}
          <div className="flex justify-end">
            <div className="bg-[#01a1da] text-white px-4 py-3 rounded-[20px] rounded-br-[4px] max-w-[75%] text-[15px] leading-[1.4]">
              Count me in plzz. But tickets are gonna sell out fast. We should set up a plan.
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-white">
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
        <div className="bg-white pt-2 pb-[34px]">
          <div className="px-3 space-y-3">
            {/* Quick actions row */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
              {/* Emoji reactions */}
              <button className="min-w-[52px] h-[38px] bg-gray-100 rounded-full flex items-center justify-center text-xl active:scale-90 transition-transform">
                ❤️
              </button>
              <button className="min-w-[52px] h-[38px] bg-gray-100 rounded-full flex items-center justify-center text-xl active:scale-90 transition-transform">
                😂
              </button>
              <button className="min-w-[52px] h-[38px] bg-gray-100 rounded-full flex items-center justify-center text-xl active:scale-90 transition-transform">
                👍
              </button>
              {/* Games button */}
              <button className="h-[38px] px-4 bg-gray-100 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <Gamepad2 size={18} className="text-[#6372f7]" />
                <span className="text-[14px] font-medium text-[#161823]">Games</span>
              </button>
              {/* Group Share button */}
              <button className="h-[38px] px-4 bg-gray-100 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform whitespace-nowrap">
                <span className="text-[12px] font-bold text-[#fe2c55] bg-[#fe2c55]/10 px-1.5 py-0.5 rounded">AI</span>
                <span className="text-[14px] font-medium text-[#161823]">Group Sh...</span>
              </button>
            </div>
            
            {/* Message input row */}
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 bg-[#01a1da] rounded-full flex items-center justify-center text-white active:scale-90 transition-transform flex-shrink-0">
                <Camera size={20} strokeWidth={2.5} />
              </button>
              <div className="flex-1 min-w-0 bg-gray-100 rounded-full px-4 h-10 flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Message..." 
                  className="bg-transparent flex-1 min-w-0 outline-none text-[15px] text-[#161823] placeholder:text-gray-400 font-normal" 
                />
                <Smile size={22} className="text-gray-500 cursor-pointer" strokeWidth={2} />
                <ImageIcon size={22} className="text-gray-500 cursor-pointer" strokeWidth={2} />
              </div>
              <button className="w-10 h-10 flex items-center justify-center active:scale-90 transition-transform">
                <Mic size={22} className="text-[#161823]" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
