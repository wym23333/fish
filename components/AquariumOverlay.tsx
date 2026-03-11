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
// Speed multiplier based on AI state: chasing = faster movement
const FishEntity: React.FC<{ entity: EntityInstance }> = ({ entity }) => {
  const isChasing = entity.aiState === 'chasing';
  // When chasing, increase stiffness for faster response
  const speedMultiplier = isChasing ? 3 : 1;
  const springConfig = useMemo(() => ({ 
    stiffness: entity.stiffness * speedMultiplier, 
    damping: entity.damping * (isChasing ? 0.8 : 1), 
    mass: entity.mass 
  }), [entity.stiffness, entity.damping, entity.mass, speedMultiplier, isChasing]);
  
  const springX = useSpring(entity.x, springConfig);
  const springY = useSpring(entity.y, springConfig);
  const prevX = useRef(entity.targetX);
  const [scaleXValue, setScaleXValue] = useState(1);

  useEffect(() => { springX.set(entity.targetX); }, [entity.targetX, springX]);
  useEffect(() => { springY.set(entity.targetY); }, [entity.targetY, springY]);

  // Update scaleX based on direction of movement
  useEffect(() => {
    const unsubscribe = springX.on('change', (x: number) => {
      const dir = x > prevX.current ? -1 : 1;
      prevX.current = x;
      setScaleXValue(dir);
    });
    return () => unsubscribe();
  }, [springX]);

  const fontSize = `${22 * entity.sizeScale * entity.growth}px`;

  return (
    <motion.div
      className="absolute select-none pointer-events-none"
      style={{ 
        x: springX, 
        y: springY, 
        scaleX: scaleXValue,
        fontSize
      }}
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

      {/* Liquid glass edge refraction effect - edges only, no center blur */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {/* Top glass edge - thick refraction band */}
        <div className="absolute top-0 left-0 right-0 h-[8px]">
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-transparent" />
          <div className="absolute top-[1px] left-0 right-0 h-[1px] bg-white/60" />
        </div>
        
        {/* Left edge refraction */}
        <div className="absolute top-0 left-0 bottom-0 w-[6px]">
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
        </div>
        
        {/* Right edge refraction */}
        <div className="absolute top-0 right-0 bottom-0 w-[6px]">
          <div className="absolute inset-0 bg-gradient-to-l from-white/30 via-white/10 to-transparent" />
        </div>
        
        {/* Bottom glass edge - thicker for depth */}
        <div className="absolute bottom-0 left-0 right-0 h-[10px]">
          <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-white/20 to-transparent" />
          <div className="absolute bottom-[1px] left-0 right-0 h-[2px] bg-white/40" />
        </div>
        
        {/* Corner highlights for glass thickness */}
        <div className="absolute top-0 left-0 w-[12px] h-[12px] bg-gradient-to-br from-white/50 to-transparent rounded-br-full" />
        <div className="absolute top-0 right-0 w-[12px] h-[12px] bg-gradient-to-bl from-white/50 to-transparent rounded-bl-full" />
        
        {/* Subtle horizontal shimmer on glass surface */}
        <motion.div
          className="absolute left-[6px] right-[6px] h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ top: '25%' }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
};

export default AquariumOverlay;
