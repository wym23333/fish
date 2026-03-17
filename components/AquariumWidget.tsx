import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

interface AquariumWidgetProps {
  onClick: () => void;
  feedTrigger?: number;
  onBaitEaten?: () => void;
}

// Entity traits define unique movement characteristics for each fish type
type EntityType = 'tropical' | 'puffer' | 'blue' | 'jellyfish' | 'octopus' | 'shrimp' | 'coral';

interface EntityTrait {
  type: EntityType;
  emoji: string;
  stiffness: number;  // Spring stiffness - higher = faster response
  damping: number;    // Spring damping - higher = less oscillation
  mass: number;       // Spring mass - higher = more inertia
  sizeScale: number;  // Size multiplier
  wanderRange: number; // How far entity wanders
}

const ENTITY_TYPES: EntityTrait[] = [
  { type: 'jellyfish', emoji: '🪼', stiffness: 3, damping: 28, mass: 2.5, sizeScale: 1.0, wanderRange: 0.6 },
  { type: 'shrimp', emoji: '🦐', stiffness: 12, damping: 40, mass: 0.8, sizeScale: 0.85, wanderRange: 0.4 },
  { type: 'octopus', emoji: '🐙', stiffness: 5, damping: 60, mass: 3, sizeScale: 0.95, wanderRange: 0.5 },
  { type: 'blue', emoji: '🐟', stiffness: 9, damping: 50, mass: 1.5, sizeScale: 0.9, wanderRange: 0.7 },
  { type: 'coral', emoji: '🪸', stiffness: 1, damping: 80, mass: 5, sizeScale: 0.85, wanderRange: 0.1 },
];

type AIState = 'wandering' | 'chasing' | 'celebrating';

interface EntityInstance extends EntityTrait {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  aiState: AIState;
  growth: number;
}

interface BaitState {
  id: number;
  x: number;
  y: number;
  status: 'dropping' | 'sinking' | 'eaten';
}

// Glow effect when bait is eaten
const EatGlowEffect: React.FC<{ x: number; y: number; onComplete: () => void }> = ({ x, y, onComplete }) => {
  return (
    <motion.div
      className="absolute pointer-events-none z-30"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 3, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      {/* Outer glow ring */}
      <div 
        className="w-[40px] h-[40px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,180,0,0.4) 40%, transparent 70%)',
          boxShadow: '0 0 20px rgba(255,200,0,0.6), 0 0 40px rgba(255,180,0,0.3)',
        }}
      />
    </motion.div>
  );
};

// Individual fish entity with spring-based movement
const FishEntity: React.FC<{ entity: EntityInstance; containerWidth: number; containerHeight: number }> = ({ 
  entity, 
  containerWidth, 
  containerHeight 
}) => {
  const isChasing = entity.aiState === 'chasing';
  const isCelebrating = entity.aiState === 'celebrating';
  
  // When chasing, increase stiffness for faster response
  const speedMultiplier = isChasing ? 2.5 : 1;
  const springConfig = useMemo(() => ({ 
    stiffness: entity.stiffness * speedMultiplier, 
    damping: entity.damping * (isChasing ? 0.7 : 1), 
    mass: entity.mass 
  }), [entity.stiffness, entity.damping, entity.mass, speedMultiplier, isChasing]);
  
  const springX = useSpring(entity.x, springConfig);
  const springY = useSpring(entity.y, springConfig);
  const prevX = useRef(entity.targetX);
  const [scaleXValue, setScaleXValue] = useState(1);

  useEffect(() => { springX.set(entity.targetX); }, [entity.targetX, springX]);
  useEffect(() => { springY.set(entity.targetY); }, [entity.targetY, springY]);

  // Update scaleX based on direction of movement (flip fish when changing direction)
  useEffect(() => {
    const unsubscribe = springX.on('change', (x: number) => {
      const delta = x - prevX.current;
      if (Math.abs(delta) > 0.5) {
        const dir = delta > 0 ? -1 : 1;
        setScaleXValue(dir);
      }
      prevX.current = x;
    });
    return () => unsubscribe();
  }, [springX]);

  const fontSize = 22 * entity.sizeScale * entity.growth;

  return (
    <motion.div
      className="absolute select-none pointer-events-none"
      style={{ 
        x: springX, 
        y: springY, 
        scaleX: scaleXValue,
        fontSize,
      }}
      animate={isCelebrating ? { 
        scale: [1, 1.3, 1],
        rotate: [0, 10, -10, 0],
      } : {}}
      transition={isCelebrating ? { duration: 0.5, ease: 'easeOut' } : {}}
    >
      {entity.emoji}
    </motion.div>
  );
};

// Bait that drops and sinks
const Bait: React.FC<{ 
  bait: BaitState; 
  containerHeight: number;
  onStateChange: (id: number, status: BaitState['status'], y: number) => void;
}> = ({ bait, containerHeight, onStateChange }) => {
  const sinkY = useSpring(10, { stiffness: 4, damping: 20 });
  const yRef = useRef(10);
  
  useEffect(() => {
    if (bait.status === 'sinking') {
      sinkY.set(containerHeight - 25);
    }
  }, [bait.status, sinkY, containerHeight]);
  
  // Track Y position for collision detection
  useEffect(() => {
    const unsubscribe = sinkY.on('change', (v: number) => {
      yRef.current = v;
    });
    return () => unsubscribe();
  }, [sinkY]);

  // Report Y position periodically for collision
  useEffect(() => {
    if (bait.status !== 'sinking') return;
    const interval = setInterval(() => {
      onStateChange(bait.id, 'sinking', yRef.current);
    }, 50);
    return () => clearInterval(interval);
  }, [bait.id, bait.status, onStateChange]);

  if (bait.status === 'eaten') return null;

  return (
    <motion.div
      initial={{ y: -30, scale: 0 }}
      animate={{ y: 10, scale: 1.1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      onAnimationComplete={() => onStateChange(bait.id, 'sinking', 10)}
      className="absolute z-20 text-[20px] drop-shadow"
      style={{ left: bait.x }}
    >
      <motion.div style={{ y: sinkY }}>
        🍪
      </motion.div>
    </motion.div>
  );
};

const WIDGET_HEIGHT = 100;

const AquariumWidget: React.FC<AquariumWidgetProps> = ({ onClick, feedTrigger = 0, onBaitEaten }) => {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [containerWidth, setContainerWidth] = useState(350);
  const lastFeedTrigger = useRef(0);

  const [entities, setEntities] = useState<EntityInstance[]>([]);
  const [baits, setBaits] = useState<BaitState[]>([]);
  const [glowEffects, setGlowEffects] = useState<{ id: number; x: number; y: number }[]>([]);
  const baitPositions = useRef<Map<number, number>>(new Map());

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Initialize fish entities
  useEffect(() => {
    const initial = ENTITY_TYPES.map((trait, i): EntityInstance => {
      const startX = 20 + (i / ENTITY_TYPES.length) * (containerWidth - 60);
      const startY = 15 + Math.random() * (WIDGET_HEIGHT - 50);
      return { 
        ...trait, 
        id: i, 
        x: startX, 
        y: startY, 
        targetX: startX, 
        targetY: startY, 
        growth: 1.0, 
        aiState: 'wandering' 
      };
    });
    setEntities(initial);
  }, [containerWidth]);

  // Wandering behavior - each fish moves based on its own wanderRange
  useEffect(() => {
    const interval = setInterval(() => {
      setEntities(prev => prev.map(e => {
        if (e.aiState === 'wandering' && Math.random() > 0.6) {
          const rangeX = containerWidth * e.wanderRange;
          const rangeY = WIDGET_HEIGHT * e.wanderRange;
          const centerX = containerWidth / 2;
          const centerY = WIDGET_HEIGHT / 2;
          
          return {
            ...e,
            targetX: Math.max(15, Math.min(containerWidth - 35, centerX + (Math.random() - 0.5) * rangeX)),
            targetY: Math.max(15, Math.min(WIDGET_HEIGHT - 35, centerY + (Math.random() - 0.5) * rangeY)),
          };
        }
        return e;
      }));
    }, 1800);
    return () => clearInterval(interval);
  }, [containerWidth]);

  // Separation behavior - prevent fish from overlapping
  useEffect(() => {
    const interval = setInterval(() => {
      setEntities(prev => {
        const updated = prev.map(e => ({ ...e }));
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const a = updated[i], b = updated[j];
            const dx = a.targetX - b.targetX;
            const dy = a.targetY - b.targetY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = (a.sizeScale + b.sizeScale) * 20;
            if (dist < minDist && dist > 0) {
              const force = ((minDist - dist) / minDist) * 0.5;
              const nx = (dx / dist) * force;
              const ny = (dy / dist) * force;
              const clampX = (v: number) => Math.max(15, Math.min(v, containerWidth - 35));
              const clampY = (v: number) => Math.max(15, Math.min(v, WIDGET_HEIGHT - 35));
              a.targetX = clampX(a.targetX + nx * 8);
              a.targetY = clampY(a.targetY + ny * 8);
              b.targetX = clampX(b.targetX - nx * 8);
              b.targetY = clampY(b.targetY - ny * 8);
            }
          }
        }
        return updated;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [containerWidth]);

  // Feed trigger - drop bait
  useEffect(() => {
    if (feedTrigger <= lastFeedTrigger.current) return;
    lastFeedTrigger.current = feedTrigger;
    
    const baitX = 30 + Math.random() * (containerWidth - 80);
    const newBait: BaitState = { id: Date.now(), x: baitX, y: -30, status: 'dropping' };
    setBaits(prev => [...prev, newBait]);

    // Fish chase bait
    setEntities(prev => prev.map(e => ({
      ...e,
      aiState: 'chasing',
      targetX: baitX + (Math.random() - 0.5) * 40,
      targetY: 20 + Math.random() * 30,
    })));
  }, [feedTrigger, containerWidth]);

  // Handle bait state changes and collision
  const handleBaitStateChange = useCallback((id: number, status: BaitState['status'], y: number) => {
    if (status === 'sinking') {
      baitPositions.current.set(id, y);
      
      // Check collision with entities
      const bait = baits.find(b => b.id === id);
      if (!bait || bait.status === 'eaten') return;
      
      for (const entity of entities) {
        const dx = entity.targetX - bait.x;
        const dy = entity.targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 28) {
          // Bait eaten!
          setBaits(prev => prev.map(b => b.id === id ? { ...b, status: 'eaten' } : b));
          baitPositions.current.delete(id);
          
          // Add glow effect at eat position
          setGlowEffects(prev => [...prev, { id: Date.now(), x: bait.x, y }]);
          
          // Celebrate and grow the fish that ate
          setEntities(prev => prev.map(e => ({
            ...e,
            aiState: e.id === entity.id ? 'celebrating' : 'wandering',
            growth: e.id === entity.id ? e.growth + 0.1 : e.growth,
            targetX: 15 + Math.random() * (containerWidth - 50),
            targetY: 15 + Math.random() * (WIDGET_HEIGHT - 50),
          })));
          
          // Return to wandering after celebration
          setTimeout(() => {
            setEntities(prev => prev.map(e => ({
              ...e,
              aiState: 'wandering',
            })));
            setBaits(prev => prev.filter(b => b.id !== id));
            onBaitEaten?.();
          }, 500);
          
          break;
        }
      }
    } else {
      setBaits(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    }
  }, [baits, entities, containerWidth, onBaitEaten]);

  // Remove glow effect after animation
  const handleGlowComplete = useCallback((id: number) => {
    setGlowEffects(prev => prev.filter(g => g.id !== id));
  }, []);

  return (
    <motion.button
      ref={containerRef}
      onClick={onClick}
      className="w-full h-[100px] relative cursor-pointer active:scale-[0.98] transition-transform overflow-hidden"
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

      {/* Fish entities with spring-based movement */}
      <div className="absolute inset-0">
        {entities.map(e => (
          <FishEntity 
            key={e.id} 
            entity={e} 
            containerWidth={containerWidth}
            containerHeight={WIDGET_HEIGHT}
          />
        ))}
      </div>

      {/* Baits */}
      {baits.map(b => (
        <Bait 
          key={b.id} 
          bait={b} 
          containerHeight={WIDGET_HEIGHT}
          onStateChange={handleBaitStateChange}
        />
      ))}

      {/* Glow effects when bait is eaten */}
      <AnimatePresence>
        {glowEffects.map(g => (
          <EatGlowEffect 
            key={g.id} 
            x={g.x} 
            y={g.y} 
            onComplete={() => handleGlowComplete(g.id)}
          />
        ))}
      </AnimatePresence>

      {/* Bubbles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/30 rounded-full pointer-events-none"
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
