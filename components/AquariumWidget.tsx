import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface AquariumWidgetProps {
  onClick: () => void;
}

// Floating sea creature with gentle animation
const SeaCreature: React.FC<{
  emoji: string;
  size: number;
  x: string;
  y: string;
  duration: number;
  delay: number;
}> = ({ emoji, size, x, y, duration, delay }) => {
  return (
    <motion.div
      className="absolute select-none"
      style={{ fontSize: size, left: x, top: y }}
      animate={{
        y: [-3, 3, -3],
        x: [-2, 2, -2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      {emoji}
    </motion.div>
  );
};

const AquariumWidget: React.FC<AquariumWidgetProps> = ({ onClick }) => {
  // Sea creatures positioned to match design
  const creatures = useMemo(() => [
    { emoji: '🪼', size: 24, x: '8%', y: '15%', duration: 3.5, delay: 0 },
    { emoji: '🦐', size: 20, x: '25%', y: '55%', duration: 4, delay: 0.5 },
    { emoji: '🐙', size: 22, x: '42%', y: '10%', duration: 3.8, delay: 0.3 },
    { emoji: '🐟', size: 22, x: '62%', y: '45%', duration: 4.2, delay: 0.8 },
    { emoji: '🪸', size: 20, x: '80%', y: '55%', duration: 3.2, delay: 0.2 },
  ], []);

  return (
    <motion.button
      onClick={onClick}
      className="w-full h-[80px] rounded-[16px] overflow-hidden relative cursor-pointer active:scale-[0.98] transition-transform"
      whileHover={{ scale: 1.01 }}
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Water gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #b8e4f8 0%, #d4eef9 50%, #e8dcc8 85%, #e4d4b8 100%)',
        }}
      />
      
      {/* Subtle wave pattern overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.3) 0%, transparent 40%)',
        }}
      />
      
      {/* Sea creatures */}
      <div className="absolute inset-0">
        {creatures.map((c, i) => (
          <SeaCreature key={i} {...c} />
        ))}
      </div>
      
      {/* Glass edge effect - top */}
      <div className="absolute top-0 left-0 right-0 h-[6px]">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/60" />
      </div>
      
      {/* Glass edge effect - bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[6px]">
        <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
      </div>
      
      {/* Glass edge effect - left */}
      <div className="absolute top-0 left-0 bottom-0 w-[4px]">
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent" />
      </div>
      
      {/* Glass edge effect - right */}
      <div className="absolute top-0 right-0 bottom-0 w-[4px]">
        <div className="absolute inset-0 bg-gradient-to-l from-white/40 to-transparent" />
      </div>
      
      {/* Corner highlights */}
      <div className="absolute top-0 left-0 w-[12px] h-[12px] bg-gradient-to-br from-white/50 to-transparent rounded-br-full" />
      <div className="absolute top-0 right-0 w-[12px] h-[12px] bg-gradient-to-bl from-white/50 to-transparent rounded-bl-full" />
      
      {/* Bubbles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/30 rounded-full"
          style={{
            width: 3 + Math.random() * 3,
            height: 3 + Math.random() * 3,
            left: `${15 + i * 20}%`,
            bottom: '30%',
          }}
          animate={{ y: [-20, -50], opacity: [0.5, 0] }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: i * 0.8,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      ))}
    </motion.button>
  );
};

export default AquariumWidget;
