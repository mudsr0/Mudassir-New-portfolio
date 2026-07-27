import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text3D, Center, Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

//Loads right from Three.js CDN to avoid local font config issues
const FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json'

function TextMesh() {
  const meshRef = useRef()

  // Subtle mouse tracking for parallax effect
  useFrame((state) => {
    if (!meshRef.current) return
    const x = state.pointer.x * 0.15
    const y = state.pointer.y * 0.15
    // Smoothly interpolate rotation
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x, 0.05)
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y, 0.05)
  })

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <Center>
        <Text3D
          ref={meshRef}
          font={FONT_URL}
          size={1.2}
          height={0.2} // 3D depth/extrusion
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          Mudassir.
          {/* Premium Dark Glass / Metallic Material */}
          <meshStandardMaterial
            color="#fdfdff"
            metalness={1}
            roughness={0.15}
            envMapIntensity={1.5}
          />
        </Text3D>
      </Center>
    </Float>
  )
}

export default function Footer3DText() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ width: '100%', height: '100%', flex: '1 1 100%' }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        {/* Dynamic lighting to catch the metallic edges */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#ffffff" />
        <spotLight position={[-10, -5, 5]} angle={0.15} penumbra={1} intensity={1.5} color="#3b82f6" /> {/* Subtle blue glow */}
        
        <TextMesh />
        
        {/* Adds realistic reflections to the metal */}
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  )
}