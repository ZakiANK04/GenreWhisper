"use client";
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, PerspectiveCamera, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function BookModel() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      // Gentle rotation
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
      group.current.rotation.x = Math.max(0, Math.sin(state.clock.elapsedTime * 0.3) * 0.05);
    }
  });

  return (
    <group ref={group} position={[0, -1.1, 0]} scale={1.62}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={1.1} floatingRange={[-0.08, 0.08]}>
        {/* Spine */}
        <mesh position={[0, -0.1, -0.3]}>
          <boxGeometry args={[0.5, 3.2, 0.4]} />
          <meshStandardMaterial color="#3e2723" roughness={0.9} />
        </mesh>
        
        {/* Left Page block */}
        <mesh position={[-1.4, 0, 0]} rotation={[0, 0.15, 0]}>
          <boxGeometry args={[2.8, 3, 0.2]} />
          <meshStandardMaterial color="#f5f0e1" roughness={1} />
        </mesh>
        {/* Left Cover */}
        <mesh position={[-1.4, -0.15, 0]} rotation={[0, 0.15, 0]}>
          <boxGeometry args={[2.9, 3.1, 0.1]} />
          <meshStandardMaterial color="#4e342e" roughness={0.8} />
        </mesh>

        {/* Right Page block */}
        <mesh position={[1.4, 0, 0]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[2.8, 3, 0.2]} />
          <meshStandardMaterial color="#f5f0e1" roughness={1} />
        </mesh>
        {/* Right Cover */}
        <mesh position={[1.4, -0.15, 0]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[2.9, 3.1, 0.1]} />
          <meshStandardMaterial color="#4e342e" roughness={0.8} />
        </mesh>
        
        {/* Glowing magical core inside the book */}
        <pointLight position={[0, 0.5, 0.5]} intensity={1.5} color="#d4af37" distance={5} />
      </Float>
    </group>
  );
}

export default function ThreeDBook() {
  return (
    <div className="w-full h-full min-h-[400px] relative">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0.35, 4.9]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#fff" castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#d4af37" />
        
        <BookModel />
        
        {/* Magical Gold Particles */}
        <Sparkles count={150} scale={6} size={3} speed={0.4} opacity={0.6} color="#d4af37" />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
