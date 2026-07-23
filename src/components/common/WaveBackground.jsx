import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function WaveBackground({ color = '#3b82f6', dotCount = 60 }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth
    const height = mount.clientHeight

    // ── Scene setup ──
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 18, 32)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // ── Grid of points ── (store ORIGINAL x/z so we can push outward from a fixed base each frame)
    const spacing = 1.4
    const rows = dotCount
    const cols = dotCount
    const count = rows * cols
    const positions = new Float32Array(count * 3)
    const baseX = new Float32Array(count)
    const baseZ = new Float32Array(count)

    let idx = 0
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = (i - rows / 2) * spacing
        const z = (j - cols / 2) * spacing
        positions[idx * 3] = x
        positions[idx * 3 + 1] = 0
        positions[idx * 3 + 2] = z
        baseX[idx] = x
        baseZ[idx] = z
        idx++
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.12,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // ── Invisible plane for raycasting mouse position onto the grid ──
    const planeGeo = new THREE.PlaneGeometry(rows * spacing * 2, cols * spacing * 2)
    const planeMat = new THREE.MeshBasicMaterial({ visible: false })
    const plane = new THREE.Mesh(planeGeo, planeMat)
    plane.rotation.x = -Math.PI / 2
    scene.add(plane)

    const raycaster = new THREE.Raycaster()
    const mouseNDC = new THREE.Vector2(-100, -100)
    let mouseActive = false

    // ── Listen globally so hovering over cards (which sit on top) still updates the wave ──
    const handlePointerMove = (e) => {
      const rect = mount.getBoundingClientRect()
      const insideX = e.clientX >= rect.left && e.clientX <= rect.right
      const insideY = e.clientY >= rect.top && e.clientY <= rect.bottom

      if (insideX && insideY) {
        mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        mouseActive = true
      } else {
        mouseActive = false
      }
    }

    window.addEventListener('mousemove', handlePointerMove)

    // ── Animation loop ──
    let frameId
    const clock = new THREE.Clock()
    const currentMouse = new THREE.Vector3(9999, 0, 9999)

    // repulsion tuning
    const REPEL_RADIUS = 9      // how far the push effect reaches
    const REPEL_STRENGTH = 5.5  // how hard particles get shoved away (bigger = more dramatic)
    const LIFT_STRENGTH = 2.5   // how much particles near cursor rise up

    const animate = () => {
      const t = clock.getElapsedTime()

      if (mouseActive) {
        raycaster.setFromCamera(mouseNDC, camera)
        const hit = raycaster.intersectObject(plane)[0]
        if (hit) {
          currentMouse.lerp(hit.point, 0.2)
        }
      } else {
        currentMouse.lerp(new THREE.Vector3(9999, 0, 9999), 0.06)
      }

      const posAttr = geometry.attributes.position

      for (let i = 0; i < count; i++) {
        const x = baseX[i]
        const z = baseZ[i]

        // ambient wave (base motion, always running)
        const wave =
          Math.sin(x * 0.25 + t * 1.2) * 1.2 +
          Math.sin(z * 0.2 + t * 0.8) * 1.2 +
          Math.sin((x + z) * 0.15 + t * 0.6) * 0.6

        // vector from cursor to this particle
        const dx = x - currentMouse.x
        const dz = z - currentMouse.z
        const dist = Math.sqrt(dx * dx + dz * dz)

        let pushX = 0
        let pushZ = 0
        let lift = 0

        if (dist < REPEL_RADIUS) {
          const falloff = 1 - dist / REPEL_RADIUS // 1 at center, 0 at edge
          const eased = falloff * falloff          // sharper falloff = more "punchy" feel
          const dirX = dist > 0.0001 ? dx / dist : 0
          const dirZ = dist > 0.0001 ? dz / dist : 0

          pushX = dirX * eased * REPEL_STRENGTH
          pushZ = dirZ * eased * REPEL_STRENGTH
          lift = eased * LIFT_STRENGTH
        }

        posAttr.array[i * 3] = x + pushX
        posAttr.array[i * 3 + 1] = wave + lift
        posAttr.array[i * 3 + 2] = z + pushZ
      }
      posAttr.needsUpdate = true

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handlePointerMove)
      geometry.dispose()
      material.dispose()
      planeGeo.dispose()
      planeMat.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [color, dotCount])

  return <div ref={mountRef} className="wave-bg" />
}