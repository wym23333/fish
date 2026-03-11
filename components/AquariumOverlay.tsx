import React, { useMemo } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

interface AquariumOverlayProps {
  pullProgress: MotionValue<number>;
  feedTrigger: number;
  onBaitEaten?: () => void;
}

// Simple floating sea creature component
const SeaCreature: React.FC<{
  emoji: string;
  size: number;
  initialX: string;
  initialY: number;
  floatRange: number;
  duration: number;
  delay: number;
}> = ({ emoji, size, initialX, initialY, floatRange, duration, delay }) => {
  return (
    <motion.div
      className="absolute select-none"
      style={{ fontSize: size, left: initialX, top: initialY }}
      animate={{
        y: [-floatRange, floatRange, -floatRange],
        x: [-8, 8, -8],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      {emoji}
    </motion.div>
  );
};

// Bottom decorations - coral and seaweed
const BottomDecorations: React.FC = () => {
  const decorations = useMemo(() => [
    { emoji: '🪸', size: 26, left: '2%', bottom: -4 },
    { emoji: '🌿', size: 22, left: '12%', bottom: -2 },
    { emoji: '🪸', size: 30, left: '82%', bottom: -4 },
    { emoji: '🌿', size: 18, left: '94%', bottom: -2 },
  ], []);

  return (
    <>
      {decorations.map((d, i) => (
        <motion.div
          key={i}
          className="absolute z-10"
          style={{ fontSize: d.size, left: d.left, bottom: d.bottom }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
        >
          {d.emoji}
        </motion.div>
      ))}
    </>
  );
};

const AquariumOverlay: React.FC<AquariumOverlayProps> = ({ pullProgress }) => {
  const aquariumOpacity = useTransform(pullProgress, [0, 0.1], [0, 1]);

  // Sea creatures configuration matching the design
  const creatures = useMemo(() => [
    { emoji: '🪼', size: 32, initialX: '18%', initialY: 35, floatRange: 8, duration: 4, delay: 0 },      // Jellyfish
    { emoji: '🐙', size: 28, initialX: '42%', initialY: 25, floatRange: 6, duration: 5, delay: 0.5 },    // Octopus
    { emoji: '🐟', size: 30, initialX: '72%', initialY: 40, floatRange: 10, duration: 3.5, delay: 1 },   // Fish
  ], []);

  return (
    <motion.div 
      className="absolute top-0 left-0 right-0 z-0 pointer-events-none overflow-hidden"
      style={{ height: '140px', opacity: aquariumOpacity }}
    >
      {/* Light blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#e8f4fc] via-[#d4ecf9] to-[#c5e4f5]" />
      
      {/* Subtle light rays */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div 
            key={`ray-${i}`} 
            className="absolute top-0 w-[20%] h-full bg-gradient-to-b from-white/40 to-transparent blur-[20px]"
            style={{ left: `${20 + i * 25}%` }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Sea creatures */}
      {creatures.map((creature, i) => (
        <SeaCreature key={i} {...creature} />
      ))}

      {/* Bottom decorations */}
      <BottomDecorations />

      {/* Bottom gradient fade for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-[20px] bg-gradient-to-t from-white/50 to-transparent z-20" />
    </motion.div>
  );
};

export default AquariumOverlay;
