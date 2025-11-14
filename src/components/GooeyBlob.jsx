import { useEffect, useRef, useState } from 'react';

export default function GooeyBlob() {
  const containerRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const blob3Ref = useRef(null);
  const animationFrameRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const mousePositionRef = useRef({ x: null, y: null });
  const blobPositionsRef = useRef({
    blob1: { x: 0, y: 0 },
    blob2: { x: 0, y: 0 },
    blob3: { x: 0, y: 0 },
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mousePositionRef.current = { x, y };
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Initialize blob positions at center
    const container = containerRef.current;
    if (container && blob1Ref.current && blob2Ref.current && blob3Ref.current) {
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Set initial positions
      blobPositionsRef.current = {
        blob1: { x: centerX - 100, y: centerY - 100 },
        blob2: { x: centerX + 100, y: centerY + 100 },
        blob3: { x: centerX, y: centerY },
      };

      // Apply initial positions immediately
      blob1Ref.current.style.left = `${centerX - 100}px`;
      blob1Ref.current.style.top = `${centerY - 100}px`;
      blob2Ref.current.style.left = `${centerX + 100}px`;
      blob2Ref.current.style.top = `${centerY + 100}px`;
      blob3Ref.current.style.left = `${centerX}px`;
      blob3Ref.current.style.top = `${centerY}px`;

      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const animate = () => {
      if (!blob1Ref.current || !blob2Ref.current || !blob3Ref.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const lerp = (start, end, factor) => start + (end - start) * factor;

      const updateBlob = (blobRef, offsetX, offsetY, speed, positionKey) => {
        if (!blobRef.current) return;
        
        const container = containerRef.current;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Use mouse position if available, otherwise use center
        const hasMousePosition = mousePositionRef.current.x !== null;
        const targetX = hasMousePosition ? mousePositionRef.current.x + offsetX : centerX + offsetX;
        const targetY = hasMousePosition ? mousePositionRef.current.y + offsetY : centerY + offsetY;
        
        const currentPos = blobPositionsRef.current[positionKey];
        const newX = lerp(currentPos.x, targetX, speed);
        const newY = lerp(currentPos.y, targetY, speed);
        
        blobPositionsRef.current[positionKey] = { x: newX, y: newY };
        blobRef.current.style.left = `${newX}px`;
        blobRef.current.style.top = `${newY}px`;
      };

      updateBlob(blob1Ref, -100, -100, 0.03, 'blob1');
      updateBlob(blob2Ref, 100, 100, 0.04, 'blob2');
      updateBlob(blob3Ref, 0, 0, 0.035, 'blob3');

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized]);

  return (
    <div className="w-full min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl h-[400px] md:h-[500px] overflow-hidden rounded-2xl bg-slate-800"
        style={{
          filter: 'blur(40px) contrast(150%)',
        }}
      >
        {/* Blob 1 */}
        <div
          ref={blob1Ref}
          className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full opacity-70"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.6) 100%)',
            transform: 'translate(-50%, -50%)',
            willChange: 'transform',
          }}
        />
        
        {/* Blob 2 */}
        <div
          ref={blob2Ref}
          className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(96, 165, 250, 0.7) 0%, rgba(59, 130, 246, 0.5) 100%)',
            transform: 'translate(-50%, -50%)',
            willChange: 'transform',
          }}
        />
        
        {/* Blob 3 */}
        <div
          ref={blob3Ref}
          className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full opacity-65"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.75) 0%, rgba(29, 78, 216, 0.55) 100%)',
            transform: 'translate(-50%, -50%)',
            willChange: 'transform',
          }}
        />
      </div>
    </div>
  );
}