
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TickingCounterProps {
  count: number;
}

const TickingCounter: React.FC<TickingCounterProps> = ({ count }) => {
  const digits = String(count).split('');

  return (
    <div className="flex items-center justify-end" aria-live="polite" aria-atomic="true">
      {digits.map((digit, index) => (
        // Each digit is in a container with a fixed width and overflow hidden
        <div key={index} className="relative h-6 w-[14px] overflow-hidden text-xl font-bold">
          <AnimatePresence initial={false}>
            <motion.span
              key={digit + '-' + index} // Key includes index to handle duplicate digits
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default TickingCounter;
