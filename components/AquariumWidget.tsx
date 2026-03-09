
import React from 'react';
import { motion } from 'framer-motion';

interface AquariumWidgetProps {
  onClick: () => void;
}

const AquariumWidget: React.FC<AquariumWidgetProps> = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="w-full h-[52px] rounded-2xl overflow-hidden relative flex items-center px-4 text-left cursor-pointer active:scale-[0.98] transition-transform"
      style={{
        background: 'linear-gradient(135deg, #a7e7ff 0%, #44a3ff 100%)',
        boxShadow: '0 4px 15px rgba(0, 120, 255, 0.2), inset 0 1px 2px rgba(255,255,255,0.5)',
        border: '1px solid rgba(255,255,255,0.3)',
      }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Caustic light effect */}
      <motion.div
        className="absolute inset-0 opacity-20 mix-blend-soft-light"
        style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6), transparent 50%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.5), transparent 45%)',
          backgroundSize: '400% 400%',
        }}
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      
      {/* Text Content */}
      <div className="relative z-10">
        <p className="text-white font-bold text-sm drop-shadow">
          View profile to feed
        </p>
      </div>
      
      {/* Fish Animation Area */}
      <div className="absolute top-0 right-0 w-28 h-full">
        <motion.div
          className="absolute text-3xl"
          style={{ top: '50%', y: '-50%', left: 0 }}
          animate={{
            x: [10, 32, 10],
            scaleX: [1, 1, -1, -1, 1],
            y: ['-50%', '-30%', '-50%'],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.45, 0.5, 0.95, 1],
          }}
        >
          <div className="relative">
            <span style={{ display: 'inline-block' }}>🐡</span>

            {/* Speech Bubble: Attached to fish */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 left-[calc(100%_+_4px)] z-20"
              animate={{
                scaleX: [1, 1, -1, -1, 1],
              }}
              transition={{
                scaleX: {
                  duration: 12,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.45, 0.5, 0.95, 1]
                }
              }}
            >
              <div className="relative bg-white text-black text-[8px] font-bold px-1 py-[2px] leading-none rounded shadow-md whitespace-nowrap">
                Hungry!
                {/* Arrow pointing left (visible initially) */}
                <motion.div
                  className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-0 h-0 border-y-[1px] border-y-transparent border-r-[2px] border-r-white"
                  animate={{ opacity: [1, 1, 0, 0, 1] }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: 'linear',
                    times: [0, 0.499, 0.5, 0.999, 1],
                  }}
                />
                {/* Arrow pointing right (hidden initially) */}
                <motion.div
                  className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-0 h-0 border-y-[1px] border-y-transparent border-l-[2px] border-l-white"
                  animate={{ opacity: [0, 0, 1, 1, 0] }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: 'linear',
                    times: [0, 0.499, 0.5, 0.999, 1],
                  }}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Bubbles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/20 rounded-full"
            style={{
              width: 2 + Math.random() * 2,
              height: 2 + Math.random() * 2,
              left: `${10 + Math.random() * 80}%`,
              bottom: 0,
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -52, opacity: [0, 0.7, 0] }}
            transition={{
              duration: 4 + Math.random() * 3,
              delay: Math.random() * 5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        ))}
      </div>
    </motion.button>
  );
};

export default AquariumWidget;
