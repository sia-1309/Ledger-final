import { Canvas } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'

function Cube() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <MeshDistortMaterial color="#0066ff" speed={2} distort={0.2} />
      </mesh>
    </Float>
  )
}

export default function LoadingSpinner3D({ size = 100 }) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={1} />
        <pointLight position={[5, 5, 5]} />
        <Cube />
      </Canvas>
    </div>
  )
}
