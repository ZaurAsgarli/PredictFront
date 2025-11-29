import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';

function RotatingChart() {
  const chartRef = useRef();
  const floatRef = useRef();

  useFrame((state) => {
    if (chartRef.current) {
      // Continuous rotation
      chartRef.current.rotation.y += 0.005;
      chartRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    
    // Floating animation
    if (floatRef.current) {
      floatRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
    }
  });

  return (
    <group ref={floatRef}>
      {/* Main rotating wheel/chart */}
      <group ref={chartRef} position={[0, 0, 0]}>
        {/* Base circle */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Chart segments/bars */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          const height = 0.5 + Math.random() * 0.8;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.8, height / 2, Math.sin(angle) * 0.8]}
            >
              <boxGeometry args={[0.2, height, 0.2]} />
              <MeshDistortMaterial
                color={i % 2 === 0 ? '#60a5fa' : '#3b82f6'}
                distort={0.1}
                speed={1}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          );
        })}
        
        {/* Center hub */}
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#1e40af" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

export default function ThreeDScene({ className = '' }) {
  return (
    <div
      className={`w-full h-[400px] md:h-[500px] relative ${className}`}
    >
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#60a5fa" />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#3b82f6" />
        
        <RotatingChart />
      </Canvas>
    </div>
  );
}
