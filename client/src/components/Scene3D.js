import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { useRef } from 'react';

// Floating 3D Box
function FloatingBox({ position, color, speed = 1 }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    meshRef.current.rotation.x += 0.01 * speed;
    meshRef.current.rotation.y += 0.015 * speed;

    meshRef.current.position.y =
      position[1] +
      Math.sin(state.clock.elapsedTime * speed) * 0.3;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />

      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

// Paint Bucket
function PaintBucket({ position }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    meshRef.current.rotation.y += 0.01;

    meshRef.current.position.y =
      position[1] +
      Math.sin(state.clock.elapsedTime) * 0.2;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.5, 0.4, 0.8, 16]} />

      <meshStandardMaterial
        color="#e17055"
        metalness={0.5}
        roughness={0.3}
      />
    </mesh>
  );
}

// Ring
function Ring({ position }) {
  const meshRef = useRef(null);

  useFrame(() => {
    if (!meshRef.current) return;

    meshRef.current.rotation.x += 0.02;
    meshRef.current.rotation.z += 0.01;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[0.6, 0.1, 16, 100]} />

      <meshStandardMaterial
        color="#0984e3"
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

export default function Scene3D() {
  return (
    <Canvas
      style={{
        width: '100%',
        height: '300px',
      }}
      camera={{
        position: [0, 0, 6],
        fov: 60,
      }}
    >
      {/* Lights */}
      <ambientLight intensity={0.5} />

      <pointLight
        position={[10, 10, 10]}
        intensity={1}
      />

      <pointLight
        position={[-10, -10, -10]}
        color="#e17055"
        intensity={0.5}
      />

      {/* Objects */}
      <Float
        speed={2}
        rotationIntensity={0.5}
        floatIntensity={0.5}
      >
        <FloatingBox
          position={[-2.5, 0, 0]}
          color="#e17055"
          speed={1}
        />
      </Float>

      <Float
        speed={1.5}
        rotationIntensity={0.3}
        floatIntensity={0.8}
      >
        <PaintBucket position={[0, 0.5, 0]} />
      </Float>

      <Float
        speed={3}
        rotationIntensity={1}
        floatIntensity={0.3}
      >
        <FloatingBox
          position={[2.5, -0.5, 0]}
          color="#00b894"
          speed={0.8}
        />
      </Float>

      <Float
        speed={2}
        rotationIntensity={0.8}
      >
        <Ring position={[1, 1.5, -1]} />
      </Float>

      <Float
        speed={1.8}
        rotationIntensity={0.6}
      >
        <FloatingBox
          position={[-1.5, -1.5, -0.5]}
          color="#6c5ce7"
          speed={1.2}
        />
      </Float>

      {/* Controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}