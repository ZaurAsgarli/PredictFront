import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const MagicButton = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  href,
  className = '',
  icon,
  ...props
}) => {
  const [ripples, setRipples] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleClick = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
    };
    
    setRipples([...ripples, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    if (onClick) onClick(e);
  };

  const baseClasses = 'relative overflow-hidden rounded-2xl font-semibold transition-all duration-300 transform';
  
  const sizeClasses = {
    sm: 'px-6 py-2.5 text-sm',
    md: 'px-8 py-3.5 text-base',
    lg: 'px-10 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'bg-white text-gray-900 hover:bg-gray-50 shadow-lg hover:shadow-xl',
    secondary: 'border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 backdrop-blur-md bg-white/5',
    gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-2xl',
    ghost: 'text-white hover:bg-white/10 backdrop-blur-sm',
  };

  const buttonContent = (
    <motion.button
      ref={buttonRef}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {/* Gradient glow effect */}
      {variant === 'gradient' && (
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899)',
            filter: 'blur(20px)',
            zIndex: -1,
          }}
        />
      )}

      {/* Magnetic glow effect */}
      <motion.div
        className="absolute rounded-full opacity-0 pointer-events-none"
        style={{
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
          left: mousePosition.x - 100,
          top: mousePosition.y - 100,
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        animate={{
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
          animate={{
            width: 300,
            height: 300,
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon && <span className="ml-2">{icon}</span>}
      </span>
    </motion.button>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className="inline-block"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {buttonContent}
      </motion.a>
    );
  }

  return buttonContent;
};

export default MagicButton;

