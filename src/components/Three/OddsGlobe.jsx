import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Html, Environment, Sphere } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { useTheme } from '../../contexts/ThemeContext';

// Outcome Point Component
function OutcomePoint({ outcome, position, onSelect, isDark }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Spring animation for hover scale
  const { scale, glowIntensity } = useSpring({
    scale: hovered ? 1.5 : 1,
    glowIntensity: hovered ? 1.5 : 0.8,
    config: { tension: 300, friction: 20 }
  });

  // Floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => {
      setClicked(false);
      onSelect(outcome.id);
    }, 200);
  };

  // Theme-based colors
  const colors = isDark
    ? {
        primary: '#8b5cf6', // purple
        secondary: '#3b82f6', // blue
        glow: '#a78bfa',
      }
    : {
        primary: '#14b8a6', // teal
        secondary: '#f97316', // orange
        glow: '#2dd4bf',
      };

  return (
    <group position={position}>
      {/* Glowing orb */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <animated.mesh
          ref={meshRef}
          scale={scale}
          onClick={handleClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          cursor="pointer"
        >
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color={colors.primary}
            emissive={colors.glow}
            emissiveIntensity={glowIntensity}
            metalness={0.8}
            roughness={0.2}
          />
        </animated.mesh>
      </Float>

      {/* Glow effect on hover */}
      {hovered && (
        <mesh position={position}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color={colors.glow}
            transparent
            opacity={0.3}
            emissive={colors.glow}
            emissiveIntensity={2}
          />
        </mesh>
      )}

      {/* Floating text label */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.15}
          color={isDark ? '#e0e7ff' : '#0f172a'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor={isDark ? '#1e1b4b' : '#ffffff'}
        >
          {outcome.name}
        </Text>
      </Float>

      {/* Odds number */}
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
        <Html
          position={[0, -0.3, 0]}
          center
          transform
          occlude
          style={{ pointerEvents: 'none' }}
        >
          <div
            className={`px-2 py-1 rounded-lg text-xs font-bold ${
              isDark
                ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30'
                : 'bg-teal-500/20 text-teal-800 border border-teal-400/30'
            } backdrop-blur-sm`}
          >
            {outcome.odds?.toFixed(2) || 'N/A'}
          </div>
        </Html>
      </Float>

      {/* Connection line to sphere */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, position[0], position[1], position[2]])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={hovered ? colors.glow : colors.primary}
          opacity={hovered ? 0.6 : 0.3}
          transparent
          linewidth={2}
        />
      </line>
    </group>
  );
}

// Main Globe Component
function Globe({ outcomes, size, autoRotate, onSelect, isDark }) {
  const globeRef = useRef();

  // Auto-rotate the globe
  useFrame((state, delta) => {
    if (autoRotate && globeRef.current) {
      globeRef.current.rotation.y += delta * 0.2;
      globeRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  // Calculate positions using spherical coordinates
  const positions = useMemo(() => {
    if (!outcomes || outcomes.length === 0) return [];
    
    const positions = [];
    const count = outcomes.length;
    
    // Use Fibonacci sphere algorithm for even distribution
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians
    
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
      const radius = Math.sqrt(1 - y * y); // radius at y
      const theta = goldenAngle * i; // golden angle increment
      
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      
      // Scale by sphere radius (size)
      positions.push([x * size * 1.2, y * size * 1.2, z * size * 1.2]);
    }
    
    return positions;
  }, [outcomes, size]);

  const colors = isDark
    ? {
        sphere: '#4c1d95',
        wireframe: '#7c3aed',
      }
    : {
        sphere: '#0d9488',
        wireframe: '#14b8a6',
      };

  return (
    <group ref={globeRef}>
      {/* Main sphere - semi-transparent */}
      <Sphere args={[size, 32, 32]}>
        <meshStandardMaterial
          color={colors.sphere}
          transparent
          opacity={0.15}
          metalness={0.3}
          roughness={0.7}
        />
      </Sphere>

      {/* Wireframe sphere */}
      <Sphere args={[size, 32, 32]}>
        <meshStandardMaterial
          color={colors.wireframe}
          wireframe
          transparent
          opacity={0.2}
        />
      </Sphere>

      {/* Outcome points */}
      {outcomes?.map((outcome, index) => (
        <OutcomePoint
          key={outcome.id}
          outcome={outcome}
          position={positions[index] || [0, 0, 0]}
          onSelect={onSelect}
          isDark={isDark}
        />
      ))}
    </group>
  );
}

// Main Component
export default function OddsGlobe({
  outcomes = [],
  size = 3,
  autoRotate = true,
  onSelect = () => {},
  className = '',
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [canvasHeight, setCanvasHeight] = useState(600);

  // Responsive height
  useEffect(() => {
    const updateHeight = () => {
      setCanvasHeight(window.innerWidth < 768 ? 400 : 600);
    };
    
    if (typeof window !== 'undefined') {
      updateHeight();
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, []);

  return (
    <div className={`w-full ${className}`} style={{ height: `${canvasHeight}px` }}>
      <Canvas
        camera={{ position: [0, 0, size * 3], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 // Limit pixel ratio for performance
        }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color={isDark ? '#8b5cf6' : '#14b8a6'} />
        <pointLight position={[0, 5, 0]} intensity={0.8} color={isDark ? '#3b82f6' : '#f97316'} />

        {/* Environment for reflections */}
        <Environment preset={isDark ? 'night' : 'sunset'} />

        {/* Globe */}
        <Globe
          outcomes={outcomes}
          size={size}
          autoRotate={autoRotate}
          onSelect={onSelect}
          isDark={isDark}
        />

        {/* Orbit Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          minDistance={size * 2}
          maxDistance={size * 5}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
        />
      </Canvas>
    </div>
  );
}

