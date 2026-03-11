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
      className="w-full h-[100px] relative cursor-pointer active:scale-[0.98] transition-transform"
      whileHover={{ scale: 1.005 }}
    >
      {/* Water gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, #d6edf9 25%, #daeefa 55%, #e8ddd2 80%, #ede3d5 100%)',
        }}
      />

      {/* Left and right soft fade */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(90deg, white 0%, transparent 15%, transparent 85%, white 100%)',
      }} />

      {/* Top soft fade */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, white 0%, transparent 35%)',
      }} />

      {/* Bottom soft fade */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(0deg, white 0%, transparent 35%)',
      }} />

      {/* Sea creatures */}
      <div className="absolute inset-0">
        {creatures.map((c, i) => (
          <SeaCreature key={i} {...c} />
        ))}
      </div>

      {/* Bubbles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/30 rounded-full"
          style={{
            width: 2,
            height: 2,
            left: `${20 + i * 30}%`,
            bottom: '35%',
          }}
          animate={{ y: [-20, -50], opacity: [0.5, 0] }}
          transition={{
            duration: 3 + i * 0.8,
            delay: i * 1.2,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      ))}
    </motion.button>
  );
};

export default AquariumWidget;
