import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './ScrambledText.css';

// Note: SplitText and ScrambleTextPlugin are GSAP premium plugins
// If not available, the component will gracefully degrade
let SplitText, ScrambleTextPlugin;

if (typeof window !== 'undefined') {
  try {
    SplitText = require('gsap/SplitText').SplitText;
    ScrambleTextPlugin = require('gsap/ScrambleTextPlugin').ScrambleTextPlugin;
    if (SplitText && ScrambleTextPlugin) {
      gsap.registerPlugin(SplitText, ScrambleTextPlugin);
    }
  } catch (e) {
    console.warn('GSAP premium plugins not available. ScrambledText will use fallback.');
  }
}

const ScrambledText = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = '.:',
  className = '',
  style = {},
  children
}) => {
  const rootRef = useRef(null);
  const charsRef = useRef([]);

  useEffect(() => {
    if (!rootRef.current || typeof window === 'undefined') return;
    if (!SplitText || !ScrambleTextPlugin) {
      console.warn('GSAP premium plugins required for ScrambledText effect');
      return;
    }

    const paragraph = rootRef.current.querySelector('p');
    if (!paragraph) return;

    let split;
    try {
      split = SplitText.create(paragraph, {
        type: 'chars',
        charsClass: 'char'
      });

      charsRef.current = split.chars;

      charsRef.current.forEach(c => {
        gsap.set(c, {
          display: 'inline-block',
          attr: { 'data-content': c.innerHTML }
        });
      });

      const handleMove = e => {
        charsRef.current.forEach(c => {
          const { left, top, width, height } = c.getBoundingClientRect();
          const dx = e.clientX - (left + width / 2);
          const dy = e.clientY - (top + height / 2);
          const dist = Math.hypot(dx, dy);

          if (dist < radius) {
            gsap.to(c, {
              overwrite: true,
              duration: duration * (1 - dist / radius),
              scrambleText: {
                text: c.dataset.content || '',
                chars: scrambleChars,
                speed
              },
              ease: 'none'
            });
          }
        });
      };

      const el = rootRef.current;
      el.addEventListener('pointermove', handleMove);

      return () => {
        el.removeEventListener('pointermove', handleMove);
        if (split && split.revert) {
          split.revert();
        }
      };
    } catch (error) {
      console.error('Error initializing ScrambledText:', error);
    }
  }, [radius, duration, speed, scrambleChars]);

  return (
    <div ref={rootRef} className={`text-block ${className}`} style={style}>
      <p>{children}</p>
    </div>
  );
};

export default ScrambledText;

