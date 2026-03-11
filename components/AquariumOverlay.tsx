import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, MotionValue, useTransform, useSpring, useMotionValue, motionValue } from 'framer-motion';

type EntityType = 'tropical' | 'puffer' | 'blue' | 'jellyfish' | 'octopus';
type AIState = 'wandering' | 'chasing' | 'confused' | 'celebrating';

interface EntityTrait {
  type: EntityType;
  emoji: string;
  stiffness: number;
  damping: number;
  mass: number;
  sizeScale: number;
}

const ENTITY_TYPES: EntityTrait[] = [
  { type: 'tropical', emoji: '🐠', stiffness: 10, damping: 55, mass: 1.2, sizeScale: 0.9 },
  { type: 'puffer',   emoji: '🐡', stiffness: 7,  damping: 45, mass: 3,   sizeScale: 1.1 },
  { type: 'blue',     emoji: '🐟', stiffness: 9,  damping: 50, mass: 1.5, sizeScale: 1.0 },
  { type: 'jellyfish',emoji: '🪼', stiffness: 3,  damping: 28, mass: 2.5, sizeScale: 1.2 },
  { type: 'octopus',  emoji: '🐙', stiffness: 5,  damping: 60, mass: 3,   sizeScale: 1.3 },
];

interface EntityInstance extends EntityTrait {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  growth: number;
  aiState: AIState;
}

interface BaitState {
  id: number;
  x: number;
  y: number;
  status: 'dropping' | 'sinking' | 'eaten';
  motionY: MotionValue<number>;
}

interface AquariumOverlayProps {
  pullProgress: MotionValue<number>;
  feedTrigger: number;
  onBaitEaten?: () => void;
}

const AQUARIUM_HEIGHT = 120;

// Individual fish entity with spring-based movement
const FishEntity: React.FC<{ entity: EntityInstance }> = ({ entity }) => {
  const springConfig = { stiffness: entity.stiffness, damping: entity.damping, mass: entity.mass };
  const springX = useSpring(entity.x, springConfig);
  const springY = useSpring(entity.y, springConfig);
  const prevX = useRef(entity.x);

  useEffect(() => { springX.set(entity.targetX); }, [entity.targetX, springX]);
  useEffect(() => { springY.set(entity.targetY); }, [entity.targetY, springY]);

  const scaleX = useTransform(springX, (x) => {
    const dir = x - prevX.current > 0 ? -1 : 1;
    prevX.current = x;
    return dir * entity.sizeScale * entity.growth;
  });

  const fontSize = `${22 * entity.sizeScale * entity.growth}px`;

  return (
    <motion.div
      className="absolute select-none pointer-events-none"
      style={{ x: springX, y: springY, scaleX, fontSize }}
    >
      {entity.emoji}
    </motion.div>
  );
};

// Bait cookie
const Bait: React.FC<{ bait: BaitState; onStateChange: (id: number, status: BaitState['status']) => void }> = ({ bait, onStateChange }) => {
  return (
    <motion.div
      initial={{ y: -30, scale: 0 }}
      animate={{ y: 10, scale: 1.1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      onAnimationComplete={() => onStateChange(bait.id, 'sinking')}
      className="absolute z-20 text-[22px] drop-shadow"
      style={{ left: bait.x, y: bait.motionY }}
    >
      <motion.div
        animate={bait.status === 'sinking' ? { y: AQUARIUM_HEIGHT } : {}}
        transition={bait.status === 'sinking' ? { duration: 6, ease: 'linear' } : {}}
      >
        🍪
      </motion.div>
    </motion.div>
  );
};

// Bottom coral/seaweed decorations - no sand, just plants
const BottomDecorations: React.FC = () => {
  const decorations = useMemo(() => [
    { emoji: '🪸', size: 24, left: '3%' },
    { emoji: '🌿', size: 20, left: '12%' },
    { emoji: '🌿', size: 18, left: '60%' },
    { emoji: '🪸', size: 28, left: '82%' },
    { emoji: '🌿', size: 16, left: '93%' },
  ], []);
  return (
    <>
      {decorations.map((d, i) => (
        <div key={i} className="absolute bottom-0 z-10 select-none pointer-events-none" style={{ fontSize: d.size, left: d.left }}>
          {d.emoji}
        </div>
      ))}
    </>
  );
};

const AquariumOverlay: React.FC<AquariumOverlayProps> = ({ pullProgress, feedTrigger, onBaitEaten }) => {
  const aquariumOpacity = useTransform(pullProgress, [0, 0.15], [0, 1]);
  const lastFeedTrigger = useRef(0);

  const [entities, setEntities] = useState<EntityInstance[]>([]);
  const [baits, setBaits] = useState<BaitState[]>([]);

  // Init fish
  useEffect(() => {
    const containerWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth, 430) : 350;
    const initial = Array.from({ length: 8 }).map((_, i): EntityInstance => {
      const trait = ENTITY_TYPES[i % ENTITY_TYPES.length];
      const startX = 20 + Math.random() * (containerWidth - 60);
      const startY = 10 + Math.random() * (AQUARIUM_HEIGHT - 40);
      return { ...trait, id: i, x: startX, y: startY, targetX: startX, targetY: startY, growth: 1.0, aiState: 'wandering' };
    });
    setEntities(initial);
  }, []);

  // Wander behavior
  useEffect(() => {
    const containerWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth, 430) : 350;
    const interval = setInterval(() => {
      setEntities(prev => prev.map(e => {
        if (e.aiState === 'wandering' && Math.random() > 0.65) {
          return {
            ...e,
            targetX: 10 + Math.random() * (containerWidth - 40),
            targetY: 8 + Math.random() * (AQUARIUM_HEIGHT - 36),
          };
        }
        return e;
      }));
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  // Separation behavior
  useEffect(() => {
    const containerWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth, 430) : 350;
    const interval = setInterval(() => {
      setEntities(prev => {
        const updated = prev.map(e => ({ ...e }));
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const a = updated[i], b = updated[j];
            const dx = a.targetX - b.targetX;
            const dy = a.targetY - b.targetY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = (a.sizeScale + b.sizeScale) * 18;
            if (dist < minDist && dist > 0) {
              const force = ((minDist - dist) / minDist) * 0.6;
              const nx = (dx / dist) * force;
              const ny = (dy / dist) * force;
              const clampX = (v: number) => Math.max(10, Math.min(v, containerWidth - 40));
              const clampY = (v: number) => Math.max(8, Math.min(v, AQUARIUM_HEIGHT - 36));
              a.targetX = clampX(a.targetX + nx * 10);
              a.targetY = clampY(a.targetY + ny * 10);
              b.targetX = clampX(b.targetX - nx * 10);
              b.targetY = clampY(b.targetY - ny * 10);
            }
          }
        }
        return updated;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Feed bait drop
  useEffect(() => {
    if (feedTrigger <= lastFeedTrigger.current) return;
    lastFeedTrigger.current = feedTrigger;
    const containerWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth, 430) : 350;
    const baitX = 40 + Math.random() * (containerWidth - 100);
    const newBait: BaitState = { id: Date.now(), x: baitX, y: -30, status: 'dropping', motionY: motionValue(-30) };
    setBaits(prev => [...prev, newBait]);

    // Fish chase bait
    setEntities(prev => prev.map(e => ({
      ...e,
      aiState: 'chasing',
      targetX: baitX + (Math.random() - 0.5) * 30,
      targetY: 15 + Math.random() * 30,
    })));
  }, [feedTrigger]);

  const handleBaitStateChange = useCallback((id: number, status: BaitState['status']) => {
    setBaits(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    if (status === 'sinking') {
      // After a delay, treat as eaten
      setTimeout(() => {
        setBaits(prev => prev.filter(b => b.id !== id));
        onBaitEaten?.();
        const containerWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth, 430) : 350;
        setEntities(prev => prev.map(e => ({
          ...e,
          aiState: 'wandering',
          growth: e.id === 0 ? e.growth + 0.08 : e.growth,
          targetX: 10 + Math.random() * (containerWidth - 40),
          targetY: 8 + Math.random() * (AQUARIUM_HEIGHT - 36),
        })));
      }, 2000);
    }
  }, [onBaitEaten]);

  return (
    <motion.div
      className="absolute top-0 left-0 right-0 z-0 overflow-hidden"
      style={{ height: AQUARIUM_HEIGHT, opacity: aquariumOpacity }}
    >
      {/* Ocean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#daf0fc] via-[#c2e8f8] to-[#a8dcf4]" />

      {/* Subtle light rays */}
      {[0.15, 0.45, 0.75].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute top-0 h-full w-[18%] bg-gradient-to-b from-white/30 to-transparent blur-2xl"
          style={{ left: `${pos * 100}%` }}
          animate={{ opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 5 + i * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
        />
      ))}

      {/* Fish entities */}
      {entities.map(e => <FishEntity key={e.id} entity={e} />)}

      {/* Bait */}
      {baits.map(b => <Bait key={b.id} bait={b} onStateChange={handleBaitStateChange} />)}

      {/* Bottom plants (no sand) */}
      <BottomDecorations />

      {/* Liquid glass overlay effect */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {/* Frosted glass layer */}
        <div className="absolute inset-0 backdrop-blur-[1px]" style={{ backdropFilter: 'blur(0.8px) saturate(1.4)' }} />
        {/* Top specular highlight - mimics glass reflection */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        {/* Wavy glass distortion lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="none">
          <filter id="glass-distort">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="3" seed="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <rect width="100%" height="100%" fill="rgba(255,255,255,0.15)" filter="url(#glass-distort)" />
        </svg>
        {/* Horizontal shimmer bands */}
        <motion.div
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
          style={{ top: '30%' }}
          animate={{ opacity: [0.3, 0.7, 0.3], y: [-1, 2, -1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ top: '65%' }}
          animate={{ opacity: [0.2, 0.5, 0.2], y: [1, -2, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        {/* Bottom edge glass rim */}
        <div className="absolute bottom-0 left-0 right-0 h-[6px] bg-gradient-to-b from-transparent to-white/20" />
      </div>
    </motion.div>
  );
};

export default AquariumOverlay;
