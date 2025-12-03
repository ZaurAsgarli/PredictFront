import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const ScrollReveal = ({ 
  children, 
  className = '',
  parallaxSpeed = 0.5,
  fadeIn = true
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [50 * parallaxSpeed, -50 * parallaxSpeed]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], fadeIn ? [0, 1, 1] : [1, 1, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;


