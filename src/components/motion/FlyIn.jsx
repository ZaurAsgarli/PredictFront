import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const FlyIn = ({ 
  children, 
  direction = 'left',
  delay = 0,
  duration = 0.8,
  className = '',
  distance = 100
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -distance, y: 0, opacity: 0 };
      case 'right':
        return { x: distance, y: 0, opacity: 0 };
      case 'up':
        return { x: 0, y: distance, opacity: 0 };
      case 'down':
        return { x: 0, y: -distance, opacity: 0 };
      default:
        return { x: -distance, y: 0, opacity: 0 };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={getInitialPosition()}
      animate={isInView ? { x: 0, y: 0, opacity: 1 } : getInitialPosition()}
      transition={{
        duration,
        delay,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FlyIn;

