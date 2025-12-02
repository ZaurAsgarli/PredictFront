import { memo, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';
import AnimatedSection from '../motion/AnimatedSection';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Professional Predictor',
    content: 'PredictHub has completely transformed how I approach predictions. The community insights are invaluable.',
    rating: 5,
    avatar: '👩‍💼',
  },
  {
    name: 'Michael Rodriguez',
    role: 'Trading Enthusiast',
    content: 'The real-time market updates and analytics help me make better decisions. Highly recommended!',
    rating: 5,
    avatar: '👨‍💻',
  },
  {
    name: 'Emily Johnson',
    role: 'Community Leader',
    content: 'Love the competitive aspect and the rewards system. It keeps me engaged and motivated.',
    rating: 5,
    avatar: '👩‍🎓',
  },
];

const Counter = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false });

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
      {count}{suffix}
    </span>
  );
};

const Testimonials = memo(() => {
  return (
    <section className="relative py-32 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Subtle parallax background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with animated counter */}
        <AnimatedSection direction="up" className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-6"
          >
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Testimonials
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Loved by
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              thousands of users
            </span>
          </h2>
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <Counter end={50} suffix="K+" />
              <p className="text-gray-600 dark:text-gray-400 mt-2">Active Users</p>
            </div>
            <div className="text-center">
              <Counter end={4.9} suffix="" />
              <p className="text-gray-600 dark:text-gray-400 mt-2">Average Rating</p>
            </div>
            <div className="text-center">
              <Counter end={98} suffix="%" />
              <p className="text-gray-600 dark:text-gray-400 mt-2">Satisfaction</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection
              key={testimonial.name}
              direction="up"
              delay={index * 0.1}
              className="relative"
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative h-full p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Quote icon */}
                <Quote className="absolute top-6 right-6 w-12 h-12 text-blue-500/20" />

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
});

Testimonials.displayName = 'Testimonials';

export default Testimonials;

