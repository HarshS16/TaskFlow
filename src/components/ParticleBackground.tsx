import React, { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  
  // Generate random particle positions
  const particleData = useMemo(() => {
    try {
      const positions = new Float32Array(2000 * 3);
      const colors = new Float32Array(2000 * 3);
      
      for (let i = 0; i < 2000; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        
        // Purple/blue gradient colors
        const intensity = Math.random();
        colors[i * 3] = 0.5 + intensity * 0.5; // Red
        colors[i * 3 + 1] = 0.2 + intensity * 0.3; // Green  
        colors[i * 3 + 2] = 0.8 + intensity * 0.2; // Blue
      }
      
      return { positions, colors };
    } catch (error) {
      console.error('Error generating particle data:', error);
      return { positions: new Float32Array(0), colors: new Float32Array(0) };
    }
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.05;
      ref.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  if (!particleData.positions.length) {
    return null;
  }

  return (
    <Points ref={ref} positions={particleData.positions} colors={particleData.colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function FallbackBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background/95 to-background/90" />
  );
}

export default function ParticleBackground() {
  try {
    return (
      <div className="fixed inset-0 -z-10">
        <Suspense fallback={<FallbackBackground />}>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 60 }}
            style={{ background: 'transparent' }}
            onCreated={({ gl }) => {
              gl.setClearColor('transparent');
            }}
          >
            <ParticleField />
          </Canvas>
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('ParticleBackground error:', error);
    return <FallbackBackground />;
  }
}