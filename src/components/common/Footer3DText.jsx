import { useEffect, useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text3D, Center, Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

const FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json'

function TextMesh({ isVisible }) {
  const meshRef = useRef(), groupRef = useRef()
  const { viewport } = useThree()
  const [textWidth, setTextWidth] = useState(null)

  const handleTextSync = (mesh) => {
    if (!mesh || textWidth) return
    mesh.geometry.computeBoundingBox()
    const box = mesh.geometry.boundingBox
    if (box) setTextWidth(box.max.x - box.min.x)
  }

  useFrame((state) => {
    if (!isVisible || !meshRef.current) return
    const x = state.pointer.x * 0.15, y = state.pointer.y * 0.15

    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, x, 0.05)
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -y, 0.05)

    if (groupRef.current && textWidth) {
      const targetScale = (viewport.width * 0.8) / textWidth
      const clamped = THREE.MathUtils.clamp(targetScale, 0.3, 1.4)
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x || clamped, clamped, 0.2))
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
            curveSegments={8}
            bevelEnabled
            bevelThickness={0.03}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={3}
          >
            Mudassir.
            <meshStandardMaterial color="#fdfdff" metalness={1} roughness={0.15} envMapIntensity={1.5} />
          </Text3D>
        </Center>
      </Float>
    </group>
  )
}

export default function Footer3DText() {
  const wrapperRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = wrapperRef.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.01 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ width: '100%', height: '100%', flex: '1 1 100%' }}
        dpr={[1, 1.5]}
        frameloop={isVisible ? 'always' : 'never'}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#ffffff" />
          <spotLight position={[-10, -5, 5]} angle={0.15} penumbra={1} intensity={1.5} color="#3b82f6" />
          <TextMesh isVisible={isVisible} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}