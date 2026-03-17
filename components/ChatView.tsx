import React from 'react';
import { Camera, Image as ImageIcon, Mic, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Page } from '../types';
import AquariumWidget from './AquariumWidget';

interface ChatViewProps {
  onNavigate: (page: Page, options?: { autoFeed?: boolean }) => void;
  isHungry?: boolean;
}

// Design specs from Figma (390pt base width)
const DESIGN = {
  // Status bar
  statusBarHeight: 44,
  
  // Header
  headerHeight: 56,
  headerPaddingX: 16,
  avatarSize: 44,
  avatarOnlineIndicatorSize: 14,
  avatarOnlineIndicatorOffset: 0,
  headerNameFontSize: 16,
  headerSubtitleFontSize: 12,
  headerIconGap: 20,
  
  // Messages
  messagePaddingX: 16,
  messageAvatarSize: 36,
  messageAvatarGap: 10,
  messageBubblePaddingX: 14,
  messageBubblePaddingY: 10,
  messageBubbleRadius: 18,
  messageBubbleSmallRadius: 4,
  messageFontSize: 15,
  messageLineHeight: 1.4,
  messageMaxWidth: '70%',
  messageGap: 16,
  timestampFontSize: 13,
  
  // Input area
  inputAreaPaddingX: 12,
  inputAreaPaddingTop: 8,
  inputAreaPaddingBottom: 34, // Safe area + padding
  quickActionHeight: 36,
  quickActionMinWidth: 48,
  quickActionPaddingX: 12,
  quickActionGap: 8,
  quickActionFontSize: 18,
  quickActionTextFontSize: 14,
  cameraButtonSize: 40,
  inputHeight: 40,
  inputPaddingX: 14,
  inputFontSize: 15,
  inputIconSize: 24,
  inputIconGap: 12,
  inputRowGap: 8,
  
  // Aquarium
  aquariumHeight: 120,
  aquariumBottomOffset: 128, // Above input area
  
  // Colors
  colors: {
    background: '#ffffff',
    text: '#161823',
    textSecondary: '#8a8b91',
    bubbleOther: '#f5f5f5',
    bubbleMine: '#20d5ec',
    bubbleMineText: '#ffffff',
    online: '#1dd765',
    streak: '#fe2c55',
    inputBg: '#f5f5f5',
    border: 'rgba(243, 243, 243, 0.6)',
    purple: '#8a5cf5',
  },
};

const ChatView: React.FC<ChatViewProps> = ({ onNavigate, isHungry }) => {
  const friendAvatar = "https://images.unsplash.com/photo-1523264939339-c89f9dadde2e?w=400&h=400&fit=crop&q=80";

  // Calculate input area total height for bottom padding
  const inputAreaHeight = DESIGN.inputAreaPaddingTop + DESIGN.quickActionHeight + 10 + DESIGN.inputHeight + DESIGN.inputAreaPaddingBottom;
  const bottomPadding = isHungry ? inputAreaHeight + DESIGN.aquariumHeight : inputAreaHeight;

  return (
    <div 
      className="flex flex-col h-full relative"
      style={{ 
        backgroundColor: DESIGN.colors.background,
        // Status bar is handled by IOSStatusBar component, padding top is 44px
        paddingTop: `${DESIGN.statusBarHeight}px`,
      }}
    >
      {/* Header - 56pt height */}
      <div 
        className="flex items-center justify-between bg-white z-50 flex-shrink-0"
        style={{
          height: `${DESIGN.headerHeight}px`,
          paddingLeft: `${DESIGN.headerPaddingX}px`,
          paddingRight: `${DESIGN.headerPaddingX}px`,
          borderBottom: `1px solid ${DESIGN.colors.border}`,
        }}
      >
        {/* Left side: Back + Avatar + Name */}
        <div className="flex items-center" style={{ gap: `${12}px` }}>
          {/* Back button */}
          <button className="active:opacity-50 transition-opacity p-1 -ml-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DESIGN.colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          
          {/* Avatar + Name */}
          <button 
            onClick={() => onNavigate('profile')}
            className="flex items-center active:scale-95 transition-transform"
            style={{ gap: `${10}px` }}
          >
            {/* Avatar with online indicator */}
            <div className="relative">
              <div 
                className="rounded-full overflow-hidden bg-gray-100 flex-shrink-0"
                style={{ width: `${DESIGN.avatarSize}px`, height: `${DESIGN.avatarSize}px` }}
              >
                <img 
                  src={friendAvatar} 
                  alt="esther Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Green online indicator - bottom left */}
              <div 
                className="absolute rounded-full border-2 border-white"
                style={{ 
                  width: `${DESIGN.avatarOnlineIndicatorSize}px`, 
                  height: `${DESIGN.avatarOnlineIndicatorSize}px`,
                  backgroundColor: DESIGN.colors.online,
                  bottom: 0,
                  left: 0,
                }}
              />
            </div>
            
            {/* Name and status */}
            <div className="flex flex-col items-start">
              <div className="flex items-center" style={{ gap: '4px' }}>
                <span 
                  className="font-bold tracking-tight"
                  style={{ fontSize: `${DESIGN.headerNameFontSize}px`, color: DESIGN.colors.text }}
                >
                  esther
                </span>
                <span style={{ fontSize: '14px' }}>🔥</span>
                <span 
                  className="font-bold"
                  style={{ fontSize: '14px', color: DESIGN.colors.streak }}
                >
                  3
                </span>
              </div>
              <span style={{ fontSize: `${DESIGN.headerSubtitleFontSize}px`, color: DESIGN.colors.textSecondary }}>
                Active now
              </span>
            </div>
          </button>
        </div>
        
        {/* Right side: Icons */}
        <div className="flex items-center" style={{ gap: `${DESIGN.headerIconGap}px` }}>
          {/* Flag icon */}
          <button className="active:opacity-50 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DESIGN.colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </button>
          {/* More options */}
          <button className="active:opacity-50 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DESIGN.colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Aquarium Background Layer */}
      <AnimatePresence>
        {isHungry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 right-0 z-10"
            style={{ bottom: `${DESIGN.aquariumBottomOffset}px`, height: `${DESIGN.aquariumHeight}px` }}
          >
            <AquariumWidget onClick={() => onNavigate('profile', { autoFeed: true })} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aquarium click target */}
      <AnimatePresence>
        {isHungry && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 right-0 z-30 cursor-pointer"
            style={{ bottom: `${DESIGN.aquariumBottomOffset}px`, height: `${DESIGN.aquariumHeight}px` }}
            onClick={() => onNavigate('profile', { autoFeed: true })}
          />
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          className="absolute inset-0 overflow-y-auto no-scrollbar z-20"
          style={{ 
            paddingLeft: `${DESIGN.messagePaddingX}px`,
            paddingRight: `${DESIGN.messagePaddingX}px`,
            paddingTop: `${DESIGN.messageGap}px`,
            paddingBottom: `${bottomPadding}px`,
            transition: 'padding-bottom 0.4s ease-out',
          }}
        >
          <div className="flex flex-col" style={{ gap: `${DESIGN.messageGap}px` }}>
            {/* Message from other person */}
            <div className="flex items-end" style={{ gap: `${DESIGN.messageAvatarGap}px` }}>
              <div 
                className="rounded-full overflow-hidden bg-gray-100 flex-shrink-0"
                style={{ width: `${DESIGN.messageAvatarSize}px`, height: `${DESIGN.messageAvatarSize}px` }}
              >
                <img 
                  onClick={() => onNavigate('profile')}
                  src={friendAvatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <div 
                style={{
                  backgroundColor: DESIGN.colors.bubbleOther,
                  paddingLeft: `${DESIGN.messageBubblePaddingX}px`,
                  paddingRight: `${DESIGN.messageBubblePaddingX}px`,
                  paddingTop: `${DESIGN.messageBubblePaddingY}px`,
                  paddingBottom: `${DESIGN.messageBubblePaddingY}px`,
                  borderRadius: `${DESIGN.messageBubbleRadius}px`,
                  borderBottomLeftRadius: `${DESIGN.messageBubbleSmallRadius}px`,
                  maxWidth: DESIGN.messageMaxWidth,
                  fontSize: `${DESIGN.messageFontSize}px`,
                  lineHeight: DESIGN.messageLineHeight,
                  color: DESIGN.colors.text,
                }}
              >
                Wowww! She always knows how to captivate her audience.
              </div>
            </div>

            {/* Timestamp */}
            <div 
              className="text-center"
              style={{ fontSize: `${DESIGN.timestampFontSize}px`, color: DESIGN.colors.textSecondary, padding: '4px 0' }}
            >
              9:20 PM
            </div>

            {/* Message from other person */}
            <div className="flex items-end" style={{ gap: `${DESIGN.messageAvatarGap}px` }}>
              <div 
                className="rounded-full overflow-hidden bg-gray-100 flex-shrink-0"
                style={{ width: `${DESIGN.messageAvatarSize}px`, height: `${DESIGN.messageAvatarSize}px` }}
              >
                <img 
                  onClick={() => onNavigate('profile')}
                  src={friendAvatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <div 
                style={{
                  backgroundColor: DESIGN.colors.bubbleOther,
                  paddingLeft: `${DESIGN.messageBubblePaddingX}px`,
                  paddingRight: `${DESIGN.messageBubblePaddingX}px`,
                  paddingTop: `${DESIGN.messageBubblePaddingY}px`,
                  paddingBottom: `${DESIGN.messageBubblePaddingY}px`,
                  borderRadius: `${DESIGN.messageBubbleRadius}px`,
                  borderBottomLeftRadius: `${DESIGN.messageBubbleSmallRadius}px`,
                  maxWidth: DESIGN.messageMaxWidth,
                  fontSize: `${DESIGN.messageFontSize}px`,
                  lineHeight: DESIGN.messageLineHeight,
                  color: DESIGN.colors.text,
                }}
              >
                Wanna buy ticket together?
              </div>
            </div>

            {/* My message */}
            <div className="flex justify-end">
              <div 
                style={{
                  backgroundColor: DESIGN.colors.bubbleMine,
                  color: DESIGN.colors.bubbleMineText,
                  paddingLeft: `${DESIGN.messageBubblePaddingX}px`,
                  paddingRight: `${DESIGN.messageBubblePaddingX}px`,
                  paddingTop: `${DESIGN.messageBubblePaddingY}px`,
                  paddingBottom: `${DESIGN.messageBubblePaddingY}px`,
                  borderRadius: `${DESIGN.messageBubbleRadius}px`,
                  borderBottomRightRadius: `${DESIGN.messageBubbleSmallRadius}px`,
                  maxWidth: DESIGN.messageMaxWidth,
                  fontSize: `${DESIGN.messageFontSize}px`,
                  lineHeight: DESIGN.messageLineHeight,
                }}
              >
                Count me in plzz. But tickets are gonna sell out fast. We should set up a plan.
              </div>
            </div>

            {/* Timestamp */}
            <div 
              className="text-center"
              style={{ fontSize: `${DESIGN.timestampFontSize}px`, color: DESIGN.colors.textSecondary, padding: '4px 0' }}
            >
              9:21 PM
            </div>

            {/* Message from other person */}
            <div className="flex items-end" style={{ gap: `${DESIGN.messageAvatarGap}px` }}>
              <div 
                className="rounded-full overflow-hidden bg-gray-100 flex-shrink-0"
                style={{ width: `${DESIGN.messageAvatarSize}px`, height: `${DESIGN.messageAvatarSize}px` }}
              >
                <img 
                  onClick={() => onNavigate('profile')}
                  src={friendAvatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <div 
                style={{
                  backgroundColor: DESIGN.colors.bubbleOther,
                  paddingLeft: `${DESIGN.messageBubblePaddingX}px`,
                  paddingRight: `${DESIGN.messageBubblePaddingX}px`,
                  paddingTop: `${DESIGN.messageBubblePaddingY}px`,
                  paddingBottom: `${DESIGN.messageBubblePaddingY}px`,
                  borderRadius: `${DESIGN.messageBubbleRadius}px`,
                  borderBottomLeftRadius: `${DESIGN.messageBubbleSmallRadius}px`,
                  maxWidth: DESIGN.messageMaxWidth,
                  fontSize: `${DESIGN.messageFontSize}px`,
                  lineHeight: DESIGN.messageLineHeight,
                  color: DESIGN.colors.text,
                }}
              >
                Hahah, ok!
              </div>
            </div>

            {/* My message */}
            <div className="flex justify-end">
              <div 
                style={{
                  backgroundColor: DESIGN.colors.bubbleMine,
                  color: DESIGN.colors.bubbleMineText,
                  paddingLeft: `${DESIGN.messageBubblePaddingX}px`,
                  paddingRight: `${DESIGN.messageBubblePaddingX}px`,
                  paddingTop: `${DESIGN.messageBubblePaddingY}px`,
                  paddingBottom: `${DESIGN.messageBubblePaddingY}px`,
                  borderRadius: `${DESIGN.messageBubbleRadius}px`,
                  borderBottomRightRadius: `${DESIGN.messageBubbleSmallRadius}px`,
                  maxWidth: DESIGN.messageMaxWidth,
                  fontSize: `${DESIGN.messageFontSize}px`,
                  lineHeight: DESIGN.messageLineHeight,
                }}
              >
                Count me in plzz. But tickets are gonna sell out fast. We should set up a plan.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div 
        className="absolute left-0 right-0 z-50 bg-white"
        style={{ 
          bottom: 0,
          paddingTop: `${DESIGN.inputAreaPaddingTop}px`,
          paddingBottom: `max(env(safe-area-inset-bottom, 0px), ${DESIGN.inputAreaPaddingBottom}px)`,
          paddingLeft: `${DESIGN.inputAreaPaddingX}px`,
          paddingRight: `${DESIGN.inputAreaPaddingX}px`,
        }}
      >
        {/* Quick action buttons */}
        <div 
          className="flex overflow-x-auto no-scrollbar"
          style={{ gap: `${DESIGN.quickActionGap}px`, paddingTop: '4px', paddingBottom: '4px' }}
        >
          <button 
            className="flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
            style={{ 
              minWidth: `${DESIGN.quickActionMinWidth}px`, 
              height: `${DESIGN.quickActionHeight}px`,
              backgroundColor: DESIGN.colors.inputBg,
              borderRadius: '9999px',
              fontSize: `${DESIGN.quickActionFontSize}px`,
            }}
          >
            ❤️
          </button>
          <button 
            className="flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
            style={{ 
              minWidth: `${DESIGN.quickActionMinWidth}px`, 
              height: `${DESIGN.quickActionHeight}px`,
              backgroundColor: DESIGN.colors.inputBg,
              borderRadius: '9999px',
              fontSize: `${DESIGN.quickActionFontSize}px`,
            }}
          >
            😆
          </button>
          <button 
            className="flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
            style={{ 
              minWidth: `${DESIGN.quickActionMinWidth}px`, 
              height: `${DESIGN.quickActionHeight}px`,
              backgroundColor: DESIGN.colors.inputBg,
              borderRadius: '9999px',
              fontSize: `${DESIGN.quickActionFontSize}px`,
            }}
          >
            👍
          </button>
          <button 
            className="flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
            style={{ 
              height: `${DESIGN.quickActionHeight}px`,
              paddingLeft: `${DESIGN.quickActionPaddingX}px`,
              paddingRight: `${DESIGN.quickActionPaddingX}px`,
              backgroundColor: DESIGN.colors.inputBg,
              borderRadius: '9999px',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '18px' }}>🎮</span>
            <span style={{ fontSize: `${DESIGN.quickActionTextFontSize}px`, fontWeight: 500, color: DESIGN.colors.text }}>
              Games
            </span>
          </button>
          <button 
            className="flex items-center justify-center active:scale-90 transition-transform flex-shrink-0 whitespace-nowrap"
            style={{ 
              height: `${DESIGN.quickActionHeight}px`,
              paddingLeft: `${DESIGN.quickActionPaddingX}px`,
              paddingRight: `${DESIGN.quickActionPaddingX}px`,
              backgroundColor: DESIGN.colors.inputBg,
              borderRadius: '9999px',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: `${DESIGN.quickActionTextFontSize}px`, fontWeight: 700, color: DESIGN.colors.streak }}>
              AI
            </span>
            <span style={{ fontSize: `${DESIGN.quickActionTextFontSize}px`, fontWeight: 500, color: DESIGN.colors.text }}>
              Group Sh...
            </span>
          </button>
        </div>

        {/* Message input row */}
        <div 
          className="flex items-center"
          style={{ gap: `${DESIGN.inputRowGap}px`, marginTop: '10px' }}
        >
          {/* Camera button */}
          <button 
            className="flex items-center justify-center text-white active:scale-90 transition-transform flex-shrink-0"
            style={{ 
              width: `${DESIGN.cameraButtonSize}px`, 
              height: `${DESIGN.cameraButtonSize}px`,
              backgroundColor: DESIGN.colors.bubbleMine,
              borderRadius: '9999px',
            }}
          >
            <Camera size={20} strokeWidth={2} />
          </button>

          {/* Text input */}
          <div 
            className="flex-1 min-w-0 flex items-center"
            style={{ 
              backgroundColor: DESIGN.colors.inputBg,
              borderRadius: '9999px',
              paddingLeft: `${DESIGN.inputPaddingX}px`,
              paddingRight: `${DESIGN.inputPaddingX}px`,
              height: `${DESIGN.inputHeight}px`,
              gap: `${DESIGN.inputIconGap}px`,
            }}
          >
            <input 
              type="text" 
              placeholder="Message..." 
              className="bg-transparent flex-1 min-w-0 outline-none"
              style={{ 
                fontSize: `${DESIGN.inputFontSize}px`, 
                color: DESIGN.colors.text,
              }}
            />
            <Smile size={DESIGN.inputIconSize} className="cursor-pointer flex-shrink-0" strokeWidth={1.5} style={{ color: DESIGN.colors.text }} />
            <ImageIcon size={DESIGN.inputIconSize} className="cursor-pointer flex-shrink-0" strokeWidth={1.5} style={{ color: DESIGN.colors.text }} />
          </div>

          {/* Mic button */}
          <Mic size={DESIGN.inputIconSize} className="cursor-pointer flex-shrink-0" strokeWidth={1.5} style={{ color: DESIGN.colors.text }} />
        </div>
      </div>
    </div>
  );
};

export default ChatView;
