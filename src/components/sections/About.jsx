import { memo } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import FlyIn from '../motion/FlyIn';
import AnimatedSection from '../motion/AnimatedSection';
import ScrambledText from '../ScrambledText';

const features = [
  'Real-time market predictions',
  'Community-driven insights',
  'Transparent reward system',
  'Advanced analytics dashboard',
];

const About = memo(() => {
  return (
    <section className="relative py-32 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <FlyIn direction="left" delay={0.2}>
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-6"
              >
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  About PredictHub
                </span>
              </motion.div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                The future of
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  prediction markets
                </span>
              </h2>

              <div className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                <ScrambledText
                  className="scrambled-text-about"
                  radius={100}
                  duration={1.2}
                  speed={0.5}
                  scrambleChars=".:"
                  style={{
                    fontSize: 'inherit',
                    color: 'inherit',
                    fontFamily: 'inherit'
                  }}
                >
                  PredictHub is a cutting-edge platform that combines the excitement of prediction
                  markets with the power of community intelligence. Make informed predictions,
                  compete with others, and earn rewards.
                </ScrambledText>
              </div>

              {/* Feature List */}
              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <AnimatedSection
                    key={feature}
                    delay={0.1 * index}
                    direction="left"
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </AnimatedSection>
                ))}
              </ul>
            </div>
          </FlyIn>

          {/* Right: Visual Element */}
          <FlyIn direction="right" delay={0.4}>
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 border border-gray-200 dark:border-gray-800"
              >
                {/* Tablet-like Image Container with Real Dashboard Image */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-900 border-2 border-gray-800 dark:border-gray-700 shadow-2xl">
                  {/* Real Analytics Dashboard Image - Data visualization dashboard */}
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=90"
                    alt="PredictHub Analytics Dashboard"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to alternative analytics dashboard images
                      const fallbacks = [
                        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=90',
                        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=90',
                      ];
                      let attempts = parseInt(e.target.dataset.attempts || '0');
                      if (attempts < fallbacks.length) {
                        e.target.dataset.attempts = (attempts + 1).toString();
                        e.target.src = fallbacks[attempts];
                      }
                    }}
                    data-attempts="0"
                  />
                  
                  {/* Subtle gradient overlay to enhance the dashboard look */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-purple-900/30 pointer-events-none"></div>
                  
                  {/* Interactive Preview Badge */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                      className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
                    >
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Interactive Preview
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Decorative glow elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl"
                  animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                  }}
                />
              </motion.div>
            </div>
          </FlyIn>
        </div>
      </div>
    </section>
  );
});

About.displayName = 'About';

export default About;

