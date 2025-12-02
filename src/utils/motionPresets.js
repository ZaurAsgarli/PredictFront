// Optimized motion presets for performance
// Uses GPU-accelerated transforms (translate3d, scale, opacity)

export const motionPresets = {
  // Entrance animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 60, transform: 'translate3d(0, 60px, 0)' },
    animate: { opacity: 1, y: 0, transform: 'translate3d(0, 0, 0)' },
    transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] },
  },

  fadeInDown: {
    initial: { opacity: 0, y: -60, transform: 'translate3d(0, -60px, 0)' },
    animate: { opacity: 1, y: 0, transform: 'translate3d(0, 0, 0)' },
    transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.8, transform: 'scale(0.8) translate3d(0, 0, 0)' },
    animate: { opacity: 1, scale: 1, transform: 'scale(1) translate3d(0, 0, 0)' },
    transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] },
  },

  // Scroll-triggered animations
  scrollReveal: {
    initial: { opacity: 0, y: 50, transform: 'translate3d(0, 50px, 0)' },
    whileInView: { opacity: 1, y: 0, transform: 'translate3d(0, 0, 0)' },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] },
  },

  flyInLeft: {
    initial: { opacity: 0, x: -100, transform: 'translate3d(-100px, 0, 0)' },
    whileInView: { opacity: 1, x: 0, transform: 'translate3d(0, 0, 0)' },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] },
  },

  flyInRight: {
    initial: { opacity: 0, x: 100, transform: 'translate3d(100px, 0, 0)' },
    whileInView: { opacity: 1, x: 0, transform: 'translate3d(0, 0, 0)' },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] },
  },

  // Hover micro-interactions
  hoverLift: {
    whileHover: {
      y: -8,
      scale: 1.02,
      transition: { duration: 0.3, ease: [0.43, 0.13, 0.23, 0.96] },
    },
    style: { willChange: 'transform' },
  },

  hoverGlow: {
    whileHover: {
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
      transition: { duration: 0.3 },
    },
  },

  hoverScale: {
    whileHover: {
      scale: 1.05,
      transition: { duration: 0.2, ease: [0.43, 0.13, 0.23, 0.96] },
    },
    style: { willChange: 'transform' },
  },

  // Stagger container
  staggerContainer: {
    initial: { opacity: 0 },
    whileInView: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    viewport: { once: true, margin: '-100px' },
  },

  // Stagger item
  staggerItem: {
    initial: { opacity: 0, y: 20, transform: 'translate3d(0, 20px, 0)' },
    whileInView: {
      opacity: 1,
      y: 0,
      transform: 'translate3d(0, 0, 0)',
      transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] },
    },
  },
};

// Performance-optimized spring configs
export const springConfigs = {
  gentle: { type: 'spring', stiffness: 120, damping: 14 },
  smooth: { type: 'spring', stiffness: 100, damping: 15 },
  bouncy: { type: 'spring', stiffness: 300, damping: 20 },
};

// GPU-accelerated transform helpers
export const gpuTransform = {
  translate3d: (x, y, z = 0) => `translate3d(${x}px, ${y}px, ${z}px)`,
  scale: (s) => `scale(${s})`,
  rotate: (r) => `rotate(${r}deg)`,
};

