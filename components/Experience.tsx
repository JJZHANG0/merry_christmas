
import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TreeParticles } from './TreeParticles';
import { PhotoCloud } from './PhotoCloud';
import { useStore } from '../store';

// Syncs the Hand Position (0-1) to the Three.js State Pointer (-1 to 1)
// This allows onPointerOver events to work with the hand!
const HandCursor = () => {
  const { hand } = useStore();
  const { pointer, viewport } = useThree();
  
  useFrame(() => {
    if (hand.isDetected) {
       // Map 0..1 to -1..1
       const x = (hand.position.x * 2) - 1;
       const y = -(hand.position.y * 2) + 1; // Invert Y
       
       // Smooth lerp for less jitter
       pointer.lerp(new THREE.Vector2(x, y), 0.2);
    }
  });
  
  // Optional: Visual cursor
  return (
     <mesh visible={hand.isDetected} position={[pointer.x * viewport.width / 2, pointer.y * viewport.height / 2, 5]}>
        <ringGeometry args={[0.05, 0.08, 32]} />
        <meshBasicMaterial color="#39ff14" transparent opacity={0.5} depthTest={false} />
     </mesh>
  );
};

export const Experience: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 18], fov: 45 }}
      gl={{ 
        antialias: false, 
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true
      }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#050505']} />
      
      {/* Hand Controller */}
      <HandCursor />

      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#39ff14" />
      
      {/* Core Content */}
      <TreeParticles />
      <PhotoCloud />
      
      {/* Environment */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={150} scale={20} size={2} speed={0.4} opacity={0.2} color="#FF0044" />

      {/* Post Processing for the "Glow" */}
      <EffectComposer disableNormalPass>
        <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.5}
            levels={6}
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      {/* Manual Controls Fallback (disabled zoom to keep scene stable) */}
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
};
