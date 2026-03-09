
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, MotionValue, useMotionValueEvent, AnimatePresence, useTransform, useSpring, useMotionValue, Variants, motionValue } from 'framer-motion';
import TickingCounter from './TickingCounter';

type EntityType = 'tropical' | 'puffer' | 'blue' | 'shrimp' | 'jellyfish' | 'octopus' | 'crab' | 'whale';
type AIState = 'wandering' | 'perceiving' | 'chasing' | 'confused' | 'celebrating';

interface EntityTrait {
  type: EntityType;
  emoji: string;
  stiffness: number;
  damping: number;
  mass: number;
  sizeScale: number;
  movementStyle: 'wander' | 'pulse' | 'scuttle' | 'glide' | 'float';
}

const ENTITY_TYPES: EntityTrait[] = [
  { type: 'tropical', emoji: '🐠', stiffness: 10, damping: 55, mass: 1.2, sizeScale: 0.9, movementStyle: 'wander' },
  { type: 'puffer', emoji: '🐡', stiffness: 7, damping: 45, mass: 3, sizeScale: 1.1, movementStyle: 'wander' },
  { type: 'blue', emoji: '🐟', stiffness: 9, damping: 50, mass: 1.5, sizeScale: 1, movementStyle: 'wander' },
  { type: 'shrimp', emoji: '🦐', stiffness: 18, damping: 30, mass: 1, sizeScale: 0.7, movementStyle: 'scuttle' },
  { type: 'jellyfish', emoji: '🪼', stiffness: 3.5, damping: 28, mass: 2.5, sizeScale: 1.2, movementStyle: 'pulse' },
  { type: 'octopus', emoji: '🐙', stiffness: 5, damping: 60, mass: 3, sizeScale: 1.3, movementStyle: 'glide' },
  { type: 'crab', emoji: '🦀', stiffness: 15, damping: 40, mass: 2, sizeScale: 0.75, movementStyle: 'scuttle' },
  { type: 'whale', emoji: '🐋', stiffness: 2.5, damping: 75, mass: 8, sizeScale: 2.2, movementStyle: 'glide' },
];

interface EntityInstance extends EntityTrait {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  growth: number;
  aiState: AIState;
  swarmOffset: { x: number, y: number };
}

interface BaitState {
  id: number;
  x: number;
  y: number;
  status: 'dropping' | 'sinking' | 'eaten';
  motionY: MotionValue<number>;
}

interface RippleState {
  id: number;
  x: number;
  y: number;
}

interface AquariumOverlayProps {
  pullProgress: MotionValue<number>;
  feedTrigger: number;
  onBaitEaten?: () => void;
}

const Bubble: React.FC = () => {
    const size = useMemo(() => 2 + Math.random() * 4, []);
    const delay = useMemo(() => Math.random() * 20, []);
    const duration = useMemo(() => 8 + Math.random() * 8, []);
    const initialXPercent = useMemo(() => Math.random() * 100, []);
    const drift = useMemo(() => (Math.random() - 0.5) * 30, []);
  
    return (
      <motion.div 
        initial={{ y: 140, opacity: 0 }} 
        animate={{ y: -40, opacity: [0, 0.7, 0] }}
        transition={{ duration, repeat: Infinity, delay, ease: "linear" }}
        className="absolute bg-white/20 border border-white/40 rounded-full"
        style={{ width: size, height: size, left: `${initialXPercent}%` }}
      />
    );
};

const Seabed: React.FC = () => {
    const elements = useMemo(() => [
      { emoji: '🪨', size: 28, left: '15%', bottom: 5, rotate: -15, z: 1 },
      { emoji: '🪨', size: 20, left: '25%', bottom: 2, rotate: 10, z: 3 },
      { emoji: '🪨', size: 35, left: '70%', bottom: 8, rotate: 5, z: 1 },
      { emoji: '🪸', size: 30, left: '80%', bottom: 4, rotate: -5, z: 2 },
      { emoji: '🪸', size: 25, left: '5%', bottom: 3, rotate: 10, z: 2 },
      { emoji: '🌿', size: 22, left: '40%', bottom: 2, rotate: -8, z: 2 },
      { emoji: '🌿', size: 26, left: '55%', bottom: 3, rotate: 12, z: 1 },
      { emoji: '🌿', size: 20, left: '90%', bottom: 1, rotate: -5, z: 3 },
    ], []);
  
    return (
      <div className="absolute bottom-0 left-0 right-0 h-11 z-1 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#f0d9b5] via-[#e4ceb1] to-transparent opacity-80" />
        <div className="absolute inset-0 top-[50%] bg-[#e4ceb1] opacity-90" />
        {elements.map((el, i) => (
          <motion.span
            key={i} className="absolute"
            initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            style={{ fontSize: el.size, left: el.left, bottom: el.bottom, transform: `rotate(${el.rotate}deg)`, zIndex: el.z, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))' }}
          >
            {el.emoji}
          </motion.span>
        ))}
      </div>
    );
};

const Bait: React.FC<{ bait: BaitState; onStateChange: (id: number, status: BaitState['status']) => void }> = ({ bait, onStateChange }) => {
  return (
    <motion.div
      initial={{ y: -40, scale: 0 }}
      animate={{ y: 30, scale: 1.2 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      onAnimationComplete={() => {
        onStateChange(bait.id, 'sinking');
      }}
      className="absolute z-20 text-[28px] drop-shadow-2xl" 
      style={{ left: bait.x, y: bait.motionY }}
    >
      <motion.div
        initial={{ y: 0 }}
        animate={bait.status === 'sinking' ? { y: 54 } : {}}
        transition={bait.status === 'sinking' ? { type: "tween", duration: 8, ease: "linear" } : {}}
      >
        🍪
      </motion.div>
    </motion.div>
  );
};


const AquariumOverlay: React.FC<AquariumOverlayProps> = ({ pullProgress, feedTrigger, onBaitEaten }) => {
  const [entities, setEntities] = useState<EntityInstance[]>([]);
  const [baits, setBaits] = useState<BaitState[]>([]);
  const [ripples, setRipples] = useState<RippleState[]>([]);
  const lastFeedTrigger = useRef(feedTrigger);
  const aquariumOpacity = useTransform(pullProgress, [0, 0.1], [0, 1]);
  const [feedCount, setFeedCount] = useState(2345);
  const processingBaitRef = useRef(new Set());


  useMotionValueEvent(pullProgress, "change", (latest) => {
    if (latest < 0.05 && baits.length > 0) {
      setBaits([]);
    }
  });

  useEffect(() => {
    // Use container width for responsive positioning (default to 350 for SSR)
    const containerWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth, 430) : 350;
    const initialEntities = Array.from({ length: 14 }).map((_, i): EntityInstance => {
      const trait = ENTITY_TYPES[i % ENTITY_TYPES.length];
      const startX = 10 + Math.random() * (containerWidth - 30);
      const startY = trait.movementStyle === 'scuttle' ? 90 + Math.random() * 5 : 30 + Math.random() * 50;
      
      return { ...trait, id: i, x: startX, y: startY, targetX: startX, targetY: startY, growth: 1.0, aiState: 'wandering', swarmOffset: { x: (Math.random() - 0.5) * 40, y: (Math.random() - 0.5) * 40 } };
    });
    setEntities(initialEntities);
  }, []);

  useEffect(() => {
    if (feedTrigger > lastFeedTrigger.current) {
      lastFeedTrigger.current = feedTrigger;
      const containerWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth, 430) : 350;
      const startX = Math.random() > 0.5 ? 40 + Math.random() * 70 : (containerWidth - 115) + Math.random() * 70;
      const newBait: BaitState = { id: Date.now(), x: startX, y: -40, status: 'dropping', motionY: motionValue(-40) };
      setBaits(prev => [...prev, newBait]);
      
      setTimeout(() => {
        setRipples(prev => [...prev, { id: newBait.id, x: startX, y: 30 }]);
      }, 800);
    }
  }, [feedTrigger]);

  // Fish AI: Wandering behavior
  useEffect(() => {
    const wanderInterval = setInterval(() => {
      const containerWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth, 430) : 350;
      setEntities(prev => prev.map(e => {
        if (e.aiState === 'wandering' && Math.random() > 0.7) {
          const nTx = 10 + Math.random() * (containerWidth - 30);
          const nTy = e.movementStyle === 'scuttle' ? 90 + Math.random() * 5 : 30 + Math.random() * 50;
          return { ...e, targetX: nTx, targetY: nTy };
        }
        return e;
      }));
    }, 1500);
    return () => clearInterval(wanderInterval);
  }, []);
  
  // Fish AI: Separation behavior to avoid clumping
  useEffect(() => {
    const REPEL_STRENGTH = 0.8;
    const separationInterval = setInterval(() => {
        const containerWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth, 430) : 350;
        const maxX = containerWidth - 15;
        setEntities(currentEntities => {
            const updatedEntities = currentEntities.map(e => ({ ...e }));

            for (let i = 0; i < updatedEntities.length; i++) {
                for (let j = i + 1; j < updatedEntities.length; j++) {
                    const entity1 = updatedEntities[i];
                    const entity2 = updatedEntities[j];

                    const dx = entity1.targetX - entity2.targetX;
                    const dy = entity1.targetY - entity2.targetY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Required distance is based on their combined size
                    const requiredDistance = (entity1.sizeScale + entity2.sizeScale) * 16;

                    if (distance < requiredDistance && distance > 0) {
                        const overlap = requiredDistance - distance;
                        const force = overlap * REPEL_STRENGTH;

                        const moveX = (dx / distance) * force * 0.5;
                        const moveY = (dy / distance) * force * 0.5;
                        
                        const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));

                        // Apply repulsion to targets
                        entity1.targetX = clamp(entity1.targetX + moveX, 10, maxX);
                        const newTargetY1 = entity1.targetY + moveY;
                        entity1.targetY = entity1.movementStyle === 'scuttle' ? clamp(newTargetY1, 90, 95) : clamp(newTargetY1, 30, 85);

                        entity2.targetX = clamp(entity2.targetX - moveX, 10, maxX);
                        const newTargetY2 = entity2.targetY - moveY;
                        entity2.targetY = entity2.movementStyle === 'scuttle' ? clamp(newTargetY2, 90, 95) : clamp(newTargetY2, 30, 85);
                    }
                }
            }
            return updatedEntities;
        });
    }, 100); // Run frequently for smooth avoidance

    return () => clearInterval(separationInterval);
  }, []);

  const handleBaitStateChange = useCallback((id: number, status: BaitState['status']) => {
    setBaits(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    if (status === 'sinking') {
       // Alert nearby fish
       setEntities(prevEntities => prevEntities.map(e => {
        const bait = baits.find(b => b.id === id);
        if (!bait) return e;
        const distance = Math.sqrt(Math.pow(e.x - bait.x, 2) + Math.pow(e.y - 30, 2));
        if (distance < 150) {
          return { ...e, aiState: 'perceiving' };
        }
        return e;
      }));
    }
  }, [baits]);

  const handleChompAttempt = useCallback((entityId: number, baitId: number) => {
    // Lock: Check if bait is already being eaten. If so, exit.
    if (processingBaitRef.current.has(baitId)) {
      return;
    }
    
    // Double-check if the bait is available in the current rendered state.
    const isBaitAvailable = baits.some(b => b.id === baitId && b.status === 'sinking');
    if (!isBaitAvailable) {
      return;
    }

    // Acquire lock: Mark this bait as being processed.
    processingBaitRef.current.add(baitId);

    // This block now runs only ONCE per bait.
    onBaitEaten?.();
    setFeedCount(prev => prev + 1);
    
    // Update bait state to 'eaten'.
    setBaits(prev => prev.map(b => b.id === baitId ? { ...b, status: 'eaten' } : b));
    
    // Schedule the removal of the bait and release the lock.
    setTimeout(() => {
      setBaits(prev => prev.filter(b => b.id !== baitId));
      processingBaitRef.current.delete(baitId);
    }, 500);

    // Update entity states after the successful chomp.
    const containerWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth, 430) : 350;
    setEntities(prev => prev.map(e => {
      if (e.id === entityId) return { ...e, aiState: 'celebrating', growth: e.growth + 0.1 };
      // Other fish that were chasing become confused.
      if (e.aiState === 'chasing') {
        const newTargetX = 10 + Math.random() * (containerWidth - 30);
        const newTargetY = e.movementStyle === 'scuttle' ? 90 + Math.random() * 5 : 30 + Math.random() * 50;
        // Schedule their return to wandering state.
        setTimeout(() => setEntities(current => current.map(en => en.id === e.id ? { ...en, aiState: 'wandering' } : en)), 500 + Math.random() * 300);
        return { ...e, aiState: 'confused', targetX: newTargetX, targetY: newTargetY };
      }
      return e;
    }));

    // The winning fish returns to wandering after celebrating.
    setTimeout(() => setEntities(prev => prev.map(e => e.id === entityId ? { ...e, aiState: 'wandering' } : e)), 2000);
  }, [baits, onBaitEaten]);


  return (
    <motion.div 
      className="absolute top-0 left-0 right-0 z-0 pointer-events-none overflow-hidden"
      style={{ height: '140px', opacity: aquariumOpacity }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(25px) saturate(180%) brightness(1.2)', WebkitBackdropFilter: 'blur(25px) saturate(180%) brightness(1.2)', boxShadow: 'inset 0 0 12px rgba(255,255,255,0.08)', border: '1px solid', borderImageSource: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.2) 100%)', borderImageSlice: 1 }}/>
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-600 opacity-75" />
      <motion.div className="absolute inset-0 opacity-40 mix-blend-soft-light" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4), transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.3), transparent 35%)', backgroundSize: '300% 300%' }} animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }} transition={{ duration: 25, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }} />
      <div className="absolute inset-0 opacity-25">{Array.from({ length: 4 }).map((_, i) => (<motion.div key={`ray-${i}`} className="absolute top-[-20%] w-[25%] h-[150%] bg-white/20 blur-[50px] skew-x-[-10deg]" style={{ left: `${i * 30}%` }} animate={{ opacity: [0.1, 0.4, 0.1], x: [-20, 20, -20] }} transition={{ duration: 10 + i * 2.5, repeat: Infinity, ease: "easeInOut" }}/>))}</div>
      
      {/* Gradient Scrim */}
      <div className="absolute -bottom-6 left-0 right-0 h-6 bg-gradient-to-t from-black/20 to-transparent z-20" />

      {/* Counter */}
      <div className="absolute bottom-2 right-5 z-30 flex flex-col items-end gap-1 text-white">
        <div className="text-[10px] font-bold opacity-70 uppercase tracking-wider">
            Total Fed
        </div>
        <TickingCounter count={feedCount} />
      </div>

      <AnimatePresence>
        {ripples.map(r => (
          <motion.div
            key={r.id}
            className="absolute rounded-full border-2 border-white/80"
            initial={{ x: r.x - 10, y: r.y - 10, width: 20, height: 20, opacity: 1 }}
            animate={{ width: 80, height: 80, x: r.x - 40, y: r.y - 40, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={() => setRipples(prev => prev.filter(pr => pr.id !== r.id))}
          />
        ))}
      </AnimatePresence>
      <AnimatePresence>
        {baits.map(bait => bait.status !== 'eaten' && <Bait key={bait.id} bait={bait} onStateChange={handleBaitStateChange} />)}
      </AnimatePresence>
      <Seabed />
      {entities.map((e) => (<Entity key={e.id} data={e} baits={baits} onChompAttempt={handleChompAttempt} onPerceptionComplete={(id) => setEntities(current => current.map(en => en.id === id ? { ...en, aiState: 'chasing' } : en))}/>))}
      {Array.from({ length: 25 }).map((_, i) => <Bubble key={i} />)}
      <div className="absolute inset-0 z-50 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)' }}/>
    </motion.div>
  );
};

const Entity: React.FC<{ 
  data: EntityInstance; 
  baits: BaitState[];
  onChompAttempt: (entityId: number, baitId: number) => void; 
  onPerceptionComplete: (id: number) => void;
}> = ({ data, baits, onChompAttempt, onPerceptionComplete }) => {
  const lastX = useRef(data.x);
  const [flip, setFlip] = useState(1);

  const targetBait = useMemo(() => {
    const sinkingBaits = baits.filter(b => b.status === 'sinking');
    if (sinkingBaits.length === 0) return null;
    // Find the closest sinking bait
    let closestBait = sinkingBaits[0];
    let minDistance = Infinity;
    for (const bait of sinkingBaits) {
      const distance = Math.sqrt(Math.pow(bait.x - data.x, 2) + Math.pow(bait.motionY.get() - data.y, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestBait = bait;
      }
    }
    return closestBait;
  }, [baits, data.x, data.y]);
  
  const isChasing = data.aiState === 'chasing' && targetBait;

  const chasingStiffnessMultiplier = useMemo(() => 2.0 + Math.random() * 1.5, []);
  const chasingDampingMultiplier = useMemo(() => 0.6 + Math.random() * 0.3, []);

  const springConfig = useMemo(() => ({
    stiffness: isChasing ? data.stiffness * chasingStiffnessMultiplier : data.stiffness,
    damping: isChasing ? data.damping * chasingDampingMultiplier : data.damping,
    mass: data.mass,
  }), [isChasing, data.stiffness, data.damping, data.mass, chasingStiffnessMultiplier, chasingDampingMultiplier]);

  const targetX = useMotionValue(data.x);
  const targetY = useMotionValue(data.y);

  const motionX = useSpring(targetX, springConfig);
  const motionY = useSpring(targetY, springConfig);
  
  useEffect(() => {
    let unsubscribeY: (()=>void)|undefined;
    if (isChasing && targetBait) {
      targetX.set(targetBait.x + data.swarmOffset.x);
      targetY.set(targetBait.motionY.get() + data.swarmOffset.y);
      unsubscribeY = targetBait.motionY.onChange((latestBaitY) => {
        targetY.set(latestBaitY + data.swarmOffset.y);
      });
    } else {
      targetX.set(data.targetX);
      targetY.set(data.targetY);
    }
    return () => { unsubscribeY?.() };
  }, [data.aiState, data.targetX, data.targetY, targetBait, isChasing, targetX, targetY, data.swarmOffset]);
  
  useMotionValueEvent(motionX, "change", (latest) => {
    if (latest > lastX.current + 0.1) setFlip(1);
    else if (latest < lastX.current - 0.1) setFlip(-1);
    lastX.current = latest;
  });
  
  useEffect(() => {
    if (isChasing && targetBait) {
      const checkDistance = () => {
        const dist = Math.sqrt(Math.pow(targetBait.x - motionX.get(), 2) + Math.pow(targetBait.motionY.get() - motionY.get(), 2));
        if (dist < 18) { onChompAttempt(data.id, targetBait.id) }
      };
      const unsubscribes = [motionX.onChange(checkDistance), motionY.onChange(checkDistance), targetBait.motionY.onChange(checkDistance)];
      return () => { unsubscribes.forEach(unsubscribe => unsubscribe()); };
    }
  }, [isChasing, targetBait, motionX, motionY, onChompAttempt, data.id]);

  const cosmeticVariants: Variants = {
    perceiving: { rotate: [0, 2, -2, 2, 0], scale: [1, 1.05, 1], transition: { duration: 0.3 } },
    chasing: { rotate: [0, -5, 5, -5, 0], transition: { duration: 0.4, repeat: Infinity } },
    celebrating: { rotate: [0, -15, 15, -15, 0], scale: [1, 1.2, 1], transition: { duration: 0.6 } },
    confused: { rotate: [0, 5, -5, 0], transition: { duration: 0.5, repeat: Infinity, repeatType: "reverse" } },
    wandering: { x: 0, rotate: 0, scale: 1 }
  };

  return (
    <motion.div
      className="absolute select-none"
      style={{ x: motionX, y: motionY, zIndex: 10, scale: data.growth }}
    >
      <motion.div
        variants={cosmeticVariants}
        animate={data.aiState}
        onAnimationComplete={(definition) => {
          if (definition === 'perceiving') onPerceptionComplete(data.id);
        }}
        style={{ fontSize: `${20 * data.sizeScale}px`, transform: `scaleX(${flip})`, filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.2))" }}
      >
        <span className="relative">{data.emoji}</span>
      </motion.div>
    </motion.div>
  );
};

export default AquariumOverlay;
