import { Canvas } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'

function Cube() {
  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <MeshDistortMaterial color="#0066ff" speed={1} distort={0.15} opacity={0.3} transparent />
      </mesh>
    </Float>
  )
}

export default function FloatingCube({ className = '' }) {
  return (
    <div className={`w-16 h-16 ${className}`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} />
        <Cube />
      </Canvas>
    </div>
  )
}
