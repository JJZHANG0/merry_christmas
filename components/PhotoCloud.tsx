
import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { GestureType } from '../types';
import { easing } from 'maath';

const PHOTOS_COUNT = 8; // Reduced count for performance/context safety
const RADIUS = 3.5;
const HEIGHT = 10;

interface PhotoData {
  id: number;
  url: string;
  treePos: THREE.Vector3;
  cloudPos: THREE.Vector3;
}

export const PhotoCloud: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const { hand } = useStore();
  const [hovered, setHovered] = useState<number | null>(null);

  const photos = useMemo(() => {
    const data: PhotoData[] = [];
    for (let i = 0; i < PHOTOS_COUNT; i++) {
      const t = i / PHOTOS_COUNT;
      const angle = t * Math.PI * 6; // Spiral
      const y = (t * HEIGHT) - (HEIGHT / 2) + 1; // Offset slightly
      const r = (1 - t * 0.8) * RADIUS; 
      
      const treePos = new THREE.Vector3(
        Math.cos(angle) * r,
        y,
        Math.sin(angle) * r
      );

      const cloudPos = new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5 + 3 
      );

      data.push({
        id: i,
        // Using a more reliable image source or different seeds
        url: `https://picsum.photos/seed/${i + 100}/400/400`,
        treePos,
        cloudPos
      });
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const targetDispersion = hand.gesture === GestureType.OPEN_HAND ? 1 : 0;
    
    // Sync rotation with tree particles logic
    if (hand.isDetected) {
       const rotSpeed = (hand.position.x - 0.5) * 2; 
       groupRef.current.rotation.y += rotSpeed * delta * 2;
    } else {
       groupRef.current.rotation.y += delta * 0.1;
    }

    // Update global dispersion tracking
    const currentDispersion = THREE.MathUtils.lerp(
        groupRef.current.userData.dispersion || 0,
        targetDispersion,
        delta * 2
    );
    groupRef.current.userData.dispersion = currentDispersion;
  });

  return (
    <group ref={groupRef}>
      {photos.map((photo) => (
        <PhotoItem 
            key={photo.id} 
            photo={photo} 
            isHovered={hovered === photo.id}
            onHover={setHovered}
        />
      ))}
    </group>
  );
};

const PhotoItem: React.FC<{ 
    photo: PhotoData, 
    isHovered: boolean, 
    onHover: (id: number | null) => void 
}> = ({ photo, isHovered, onHover }) => {
    const ref = useRef<THREE.Group>(null);
    const { hand } = useStore();

    useFrame((state, delta) => {
        if (!ref.current || !ref.current.parent) return;
        
        const dispersion = ref.current.parent.userData.dispersion || 0;
        
        // Calculate target position based on dispersion
        const targetPos = new THREE.Vector3().lerpVectors(
            photo.treePos,
            photo.cloudPos,
            dispersion
        );

        // Animate position
        easing.damp3(ref.current.position, targetPos, 0.5, delta);
        
        // Scale logic:
        // Base scale depends on mode (larger in cloud)
        let targetScale = dispersion > 0.5 ? 2.0 : 1.0; 
        
        // GRAB GESTURE LOGIC:
        // If hovered AND gesture is PINCH (Grab), scale up significantly
        // Also if hovered in general, scale up slightly
        if (isHovered) {
            targetScale *= 1.2; // Hover effect
            if (hand.gesture === GestureType.PINCH) {
                targetScale *= 2.0; // "Grab" effect (Enlarge)
            }
        }

        easing.damp(ref.current.scale, 'x', targetScale, 0.3, delta);
        easing.damp(ref.current.scale, 'y', targetScale, 0.3, delta);
    });

    return (
        <group ref={ref}>
            <Billboard>
                <Image 
                    url={photo.url} 
                    transparent 
                    opacity={0.9}
                    onPointerOver={() => onHover(photo.id)}
                    onPointerOut={() => onHover(null)}
                    color={isHovered ? '#ffffff' : '#dddddd'}
                    side={THREE.DoubleSide}
                />
                {/* Frame border */}
                <mesh position={[0, 0, -0.01]}>
                    <planeGeometry args={[1.05, 1.05]} />
                    <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} />
                </mesh>
            </Billboard>
        </group>
    )
}
