import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import MagicButton from '../MagicButton';
import { fadeInUp, staggerContainer, staggerItem } from '../../utils/motion';

const Canvas = dynamic(() => import('@react-three/fiber').then((mod) => mod.Canvas), {
  ssr: false,
});
const Blob = dynamic(() => import('../Blob'), {
  ssr: false,
});
const AnimatedCircle = dynamic(() => import('../AnimatedCircle'), {
  ssr: false,
});

const Hero = ({ isAuthenticated }) => {
  return (
    <section className="relative w-full h-[60vh] min-h-[600px] max-h-[800px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* 3D Blob Canvas - Background Layer */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Blob />
        </Canvas>
      </div>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40 z-[1] pointer-events-none"></div>

      {/* Animated Circle Background */}
      <div className="absolute inset-0 opacity-20 z-[1] pointer-events-none">
        <AnimatedCircle />
      </div>

      {/* Hero Text Content - Overlay Layer */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          {/* Icon */}
          <motion.div
            variants={staggerItem}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl mb-8 border border-white/20 shadow-lg"
          >
            <TrendingUp className="h-10 w-10 text-white" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={staggerItem}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-white drop-shadow-2xl"
          >
            Welcome to PredictHub
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={staggerItem}
            className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto leading-relaxed drop-shadow-lg backdrop-blur-sm px-4"
          >
            Make predictions, compete with friends, and earn rewards in the ultimate prediction platform
          </motion.p>

          {/* Feature Tags */}
          <motion.div
            variants={staggerItem}
            className="flex flex-wrap items-center justify-center gap-3 mb-10 px-4"
          >
            {['Real-time Markets', 'Community Driven', 'Transparent Rewards', 'Advanced Analytics'].map((tag, index) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium text-white border border-white/20 hover:bg-white/20 transition-colors"
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          {!isAuthenticated && (
            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 px-4"
            >
              <MagicButton
                variant="primary"
                size="lg"
                href="/signup"
                icon={<ArrowRight className="h-5 w-5" />}
              >
                Get Started
              </MagicButton>
              <MagicButton
                variant="secondary"
                size="lg"
                href="/events"
                icon={<ArrowRight className="h-5 w-5" />}
              >
                Explore Events
              </MagicButton>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 bg-white/60 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;

