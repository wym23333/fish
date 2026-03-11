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
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Water gradient background - lighter and more subtle */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #c5e8fb 0%, #d8f0fc 50%, #e6ddd2 85%, #ede3d5 100%)',
        }}
      />
      
      {/* Subtle wave pattern overlay - reduced opacity */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 40%)',
        }}
      />
      
      {/* Sea creatures */}
      <div className="absolute inset-0">
        {creatures.map((c, i) => (
          <SeaCreature key={i} {...c} />
        ))}
      </div>
      
      {/* Minimal glass effect - just a subtle top highlight */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-b from-white/40 to-transparent" />
      
      {/* Bubbles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/20 rounded-full"
          style={{
            width: 2 + Math.random() * 2,
            height: 2 + Math.random() * 2,
            left: `${20 + i * 30}%`,
            bottom: '35%',
          }}
          animate={{ y: [-20, -50], opacity: [0.4, 0] }}
          transition={{
            duration: 2.5 + Math.random() * 1.5,
            delay: i * 1,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      ))}
    </motion.button>
  );
};

export default AquariumWidget;
