import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text3D, Center, Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

const FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json'

function TextMesh() {
  const meshRef = useRef()
  const groupRef = useRef()
  const { viewport } = useThree()
  const [textWidth, setTextWidth] = useState(null)

  // Measure the actual rendered width of the text geometry once it's ready
  const handleTextSync = (mesh) => {
    if (!mesh || textWidth) return
    mesh.geometry.computeBoundingBox()
    const box = mesh.geometry.boundingBox
    setTextWidth(box.max.x - box.min.x)
  }

  useFrame((state) => {
    if (!meshRef.current) return
    const x = state.pointer.x * 0.15
    const y = state.pointer.y * 0.15
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x, 0.05)
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y, 0.05)

    if (groupRef.current && textWidth) {
      // Keep the text at ~80% of the visible width, on every viewport/aspect change
      const targetScale = (viewport.width * 0.8) / textWidth
      // Also cap it so it doesn't get comically huge on wide desktop screens
      const clamped = THREE.MathUtils.clamp(targetScale, 0.3, 1.4)
      groupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(groupRef.current.scale.x || clamped, clamped, 0.2)
      )
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
        <Center>
          <Text3D
            ref={(mesh) => { meshRef.current = mesh; handleTextSync(mesh) }}
            font={FONT_URL}
            size={1}
            height={0.2}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.03}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            Mudassir.
            <meshStandardMaterial
              color="#fdfdff"
              metalness={1}
              roughness={0.15}
              envMapIntensity={1.5}
            />
          </Text3D>
        </Center>
      </Float>
    </group>
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
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#ffffff" />
        <spotLight position={[-10, -5, 5]} angle={0.15} penumbra={1} intensity={1.5} color="#3b82f6" />
        <TextMesh />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  )
}