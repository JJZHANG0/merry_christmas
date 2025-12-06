
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { easing } from 'maath';
import { useStore } from '../store';
import { GestureType } from '../types';

const COUNT = 1200;
const RADIUS = 8;
const HEIGHT = 14;

// Helper to generate spiral tree positions
const getTreePosition = (i: number) => {
  const t = i / COUNT;
  const angle = t * 60; // How many turns
  const r = (1 - t) * 4; // Cone radius gets smaller at top
  const x = r * Math.cos(angle);
  const y = (t * HEIGHT) - (HEIGHT / 2);
  const z = r * Math.sin(angle);
  return new THREE.Vector3(x, y, z);
};

// Helper to generate random cloud positions
const getCloudPosition = () => {
  const x = (Math.random() - 0.5) * 20;
  const y = (Math.random() - 0.5) * 20;
  const z = (Math.random() - 0.5) * 10;
  return new THREE.Vector3(x, y, z);
};

export const TreeParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const { hand } = useStore();

  // Precompute positions
  const { treePositions, cloudPositions, colors } = useMemo(() => {
    const tree = new Float32Array(COUNT * 3);
    const cloud = new Float32Array(COUNT * 3);
    const cols = new Float32Array(COUNT * 3);
    const color = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      // Tree coords
      const tPos = getTreePosition(i);
      tree[i * 3] = tPos.x;
      tree[i * 3 + 1] = tPos.y;
      tree[i * 3 + 2] = tPos.z;

      // Cloud coords
      const cPos = getCloudPosition();
      cloud[i * 3] = cPos.x;
      cloud[i * 3 + 1] = cPos.y;
      cloud[i * 3 + 2] = cPos.z;

      // Colors: Mix of Gold, Green, Red
      const rand = Math.random();
      if (rand > 0.7) color.set('#FFD700'); // Gold
      else if (rand > 0.3) color.set('#39ff14'); // Neon Green
      else color.set('#FF0044'); // Red

      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.b;
    }
    return { treePositions: tree, cloudPositions: cloud, colors: cols };
  }, []);

  // Geometry references for morphing
  const bufferRef = useRef<THREE.BufferAttribute>(null);

  useFrame((state, delta) => {
    if (!bufferRef.current || !pointsRef.current) return;

    // Determine target state based on gesture
    // Closed Fist = Tree (0), Open Hand = Cloud (1)
    // Default is tree
    let targetDispersion = 0; 
    if (hand.gesture === GestureType.OPEN_HAND) targetDispersion = 1;
    
    // Smooth rotation based on Hand X movement or Rotation Angle
    // If hand is rotated (palm facing left/right), rotate the tree
    let targetRotY = state.clock.getElapsedTime() * 0.1;
    
    if (hand.isDetected) {
       // Use the X position for rotation control: Left side rotates left, right side rotates right
       const rotSpeed = (hand.position.x - 0.5) * 2; // -1 to 1
       pointsRef.current.rotation.y += rotSpeed * delta * 2;
    } else {
       pointsRef.current.rotation.y += delta * 0.1;
    }

    // Morph positions
    const positions = bufferRef.current.array as Float32Array;
    
    // Smooth global dispersion factor
    const currentDispersion = THREE.MathUtils.lerp(
      pointsRef.current.userData.dispersion || 0,
      targetDispersion,
      delta * 2 // Speed of transition
    );
    pointsRef.current.userData.dispersion = currentDispersion;

    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      const tx = treePositions[ix];
      const ty = treePositions[iy];
      const tz = treePositions[iz];

      const cx = cloudPositions[ix];
      const cy = cloudPositions[iy];
      const cz = cloudPositions[iz];

      // Lerp
      positions[ix] = THREE.MathUtils.lerp(tx, cx, currentDispersion);
      positions[iy] = THREE.MathUtils.lerp(ty, cy, currentDispersion);
      positions[iz] = THREE.MathUtils.lerp(tz, cz, currentDispersion);
      
      // Add twinkling/wobble
      if (currentDispersion > 0.1) {
          positions[ix] += (Math.random() - 0.5) * 0.05;
          positions[iy] += (Math.random() - 0.5) * 0.05;
          positions[iz] += (Math.random() - 0.5) * 0.05;
      }
    }
    
    bufferRef.current.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          ref={bufferRef}
          attach="attributes-position"
          array={new Float32Array(treePositions)} 
          count={COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
};
