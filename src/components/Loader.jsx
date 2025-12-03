import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = ({ variant = 'gradient-ring' }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide loader after page loads
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const renderLoader = () => {
    switch (variant) {
      case 'blob':
        return <BlobLoader />;
      case 'svg':
        return <SVGLoader />;
      case 'dots':
        return <DotWaveLoader />;
      case 'gradient-ring':
      default:
        return <GradientRingLoader />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        >
          {renderLoader()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Gradient Neon Ring Loader
const GradientRingLoader = () => {
  return (
    <div className="relative w-24 h-24">
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-transparent"
        style={{
          background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b)',
          backgroundClip: 'padding-box',
          WebkitBackgroundClip: 'padding-box',
          borderImage: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b) 1',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-2 rounded-full bg-gray-900"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-2 h-2 rounded-full bg-blue-500" />
      </motion.div>
    </div>
  );
};

// 3D Blob Morph Loader
const BlobLoader = () => {
  return (
    <div className="relative w-32 h-32">
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        animate={{
          scale: [1, 1.2, 1],
          borderRadius: ['50%', '30%', '50%'],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ filter: 'blur(20px)' }}
      />
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
        animate={{
          scale: [1.2, 1, 1.2],
          borderRadius: ['30%', '50%', '30%'],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
        style={{ filter: 'blur(20px)', opacity: 0.7 }}
      />
    </div>
  );
};

// SVG Path Animation Loader
const SVGLoader = () => {
  return (
    <div className="w-24 h-24">
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M 20,50 Q 50,20 80,50 Q 50,80 20,50"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 0.5 },
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Dot Wave Loader
const DotWaveLoader = () => {
  const dots = [0, 1, 2, 3, 4];

  return (
    <div className="flex items-center gap-2">
      {dots.map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-full bg-blue-500"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default Loader;


