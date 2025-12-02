import { useEffect, useRef } from 'react';

export default function AnimatedCircle() {
  const containerRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || !circleRef.current) return;

    let cleanup = null;

    // Import animatable and utils from animejs v4
    Promise.all([
      import('animejs/animatable'),
      import('animejs/utils')
    ]).then(([animatableModule, utilsModule]) => {
      const createAnimatable = animatableModule.default || animatableModule.createAnimatable;
      const utils = utilsModule.default || utilsModule;

      if (!createAnimatable || !utils) {
        console.error('Failed to load animejs modules');
        return;
      }

      const $demos = containerRef.current;
      const $demo = circleRef.current;

      let bounds = $demo.getBoundingClientRect();
      const refreshBounds = () => {
        bounds = $demo.getBoundingClientRect();
      };

      const rgb = [164, 255, 79];

      const circle = createAnimatable(circleRef.current, {
        x: 0,
        y: 0,
        backgroundColor: 0,
        ease: 'outExpo',
      });

      // Set initial animation
      circle.x(0, 500, 'out(2)');
      circle.y(0, 500, 'out(3)');
      circle.backgroundColor(rgb, 250);

      const onMouseMove = (e) => {
        const { width, height, left, top } = bounds;
        const hw = width / 2;
        const hh = height / 2;
        const x = utils.clamp(e.clientX - left - hw, -hw, hw);
        const y = utils.clamp(e.clientY - top - hh, -hh, hh);

        rgb[0] = utils.mapRange(x, -hw, hw, 0, 164);
        rgb[2] = utils.mapRange(x, -hw, hw, 79, 255);
        circle.x(x).y(y).backgroundColor(rgb);
      };

      window.addEventListener('mousemove', onMouseMove);
      $demos.addEventListener('scroll', refreshBounds);
      window.addEventListener('resize', refreshBounds);

      cleanup = () => {
        window.removeEventListener('mousemove', onMouseMove);
        $demos.removeEventListener('scroll', refreshBounds);
        window.removeEventListener('resize', refreshBounds);
      };
    }).catch((error) => {
      console.error('Error loading animejs modules:', error);
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="docs-demos"
      className="relative w-full h-full min-h-[400px] overflow-hidden"
    >
      <div className="docs-demo is-active absolute inset-0 w-full h-full">
        <div
          ref={circleRef}
          className="circle absolute top-1/2 left-1/2 w-32 h-32 md:w-40 md:h-40 rounded-full pointer-events-none z-0"
          style={{
            backgroundColor: 'rgb(164, 255, 79)',
            mixBlendMode: 'screen',
            filter: 'blur(60px)',
            opacity: 0.4,
            willChange: 'transform, background-color',
            transform: 'translate(-50%, -50%) translateX(0px) translateY(0px)',
          }}
        />
      </div>
    </div>
  );
}

