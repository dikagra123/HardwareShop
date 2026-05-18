import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { useRef } from 'react';

function Box({ position, color, speed = 1 }) {
  const ref = useRef();
  useFrame(() => {
    ref.current.rotation.x += 0.01 * speed;
    ref.current.rotation.y += 0.015 * speed;
  });
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

function Bucket({ position }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y += 0.01;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
  });
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.5, 0.4, 0.8, 16]} />
      <meshStandardMaterial color="#e17055" metalness={0.5} roughness={0.3} />
    </mesh>
  );
}

function Ring({ position }) {
  const ref = useRef();
  useFrame(() => {
    ref.current.rotation.x += 0.02;
    ref.current.rotation.z += 0.01;
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[0.6, 0.1, 16, 100]} />
      <meshStandardMaterial color="#0984e3" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

export default function Scene3D() {
  return (
    <Canvas style={{ width: '100%', height: '280px' }}
      camera={{ position: [0, 0, 6], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#e17055" intensity={0.5} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Box position={[-2.5, 0, 0]} color="#e17055" speed={1} />
      </Float>
      <Float speed={1.5} floatIntensity={0.8}>
        <Bucket position={[0, 0.5, 0]} />
      </Float>
      <Float speed={3} rotationIntensity={1}>
        <Box position={[2.5, -0.5, 0]} color="#00b894" speed={0.8} />
      </Float>
      <Float speed={2} rotationIntensity={0.8}>
        <Ring position={[1, 1.5, -1]} />
      </Float>
      <Float speed={1.8}>
        <Box position={[-1.5, -1.5, -0.5]} color="#6c5ce7" speed={1.2} />
      </Float>

      <OrbitControls enableZoom={false} enablePan={false}
        autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
}