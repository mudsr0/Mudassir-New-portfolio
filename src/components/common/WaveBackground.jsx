import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function WaveBackground({ color = '#3b82f6', dotCount = 60 }) {
  const mountRef = useRef(null), canvasRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let destroyed = false, frameId = null

    const getSize = () => ({ width: mount.clientWidth, height: mount.clientHeight })
    let { width, height } = getSize()
    if (!width || !height) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 18, 32)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setClearColor(0x000000, 0)

    Object.assign(renderer.domElement.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none',
    })

    const spacing = 1.4, rows = dotCount, cols = dotCount, count = rows * cols
    const positions = new Float32Array(count * 3)
    const baseX = new Float32Array(count), baseZ = new Float32Array(count)

    let idx = 0
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = (i - rows / 2) * spacing
        const z = (j - cols / 2) * spacing
        const offset = idx * 3

        positions[offset] = x
        positions[offset + 1] = 0
        positions[offset + 2] = z

        baseX[idx] = x
        baseZ[idx] = z
        idx++
      }
    }

    const geometry = new THREE.BufferGeometry()
    const positionAttribute = new THREE.BufferAttribute(positions, 3)
    geometry.setAttribute('position', positionAttribute)

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color), size: 0.12, transparent: true, opacity: 0.8, sizeAttenuation: true, depthWrite: false,
    })
    scene.add(new THREE.Points(geometry, material))

    const planeGeo = new THREE.PlaneGeometry(rows * spacing * 2, cols * spacing * 2)
    const planeMat = new THREE.MeshBasicMaterial({ visible: false })
    const plane = new THREE.Mesh(planeGeo, planeMat)
    plane.rotation.x = -Math.PI / 2
    scene.add(plane)

    const raycaster = new THREE.Raycaster()
    const mouseNDC = new THREE.Vector2(-100, -100)
    const mouseTarget = new THREE.Vector3(9999, 0, 9999)
    const currentMouse = new THREE.Vector3(9999, 0, 9999)
    let mouseActive = false, sectionVisible = false

    let mountRect = mount.getBoundingClientRect()
    const updateRect = () => { mountRect = mount.getBoundingClientRect() }

    const handlePointerMove = (e) => {
      if (!sectionVisible) return

      const insideX = e.clientX >= mountRect.left && e.clientX <= mountRect.right
      const insideY = e.clientY >= mountRect.top && e.clientY <= mountRect.bottom

      if (insideX && insideY) {
        mouseNDC.x = ((e.clientX - mountRect.left) / mountRect.width) * 2 - 1
        mouseNDC.y = -(((e.clientY - mountRect.top) / mountRect.height) * 2 - 1)
        mouseActive = true
      } else {
        mouseActive = false
      }
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    let resizeRaf = null
    const handleResize = () => {
      // rAF-throttle: mobile address-bar resizes fire in bursts; coalesce to one pass/frame.
      if (resizeRaf) return
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null
        if (destroyed) return
        const size = getSize()
        if (!size.width || !size.height) return

        width = size.width
        height = size.height
        mountRect = mount.getBoundingClientRect()
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
      })
    }

    window.addEventListener('resize', handleResize, { passive: true })

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (destroyed) return
        sectionVisible = entry.isIntersecting

        if (sectionVisible) {
          updateRect()
          renderer.render(scene, camera)
          if (!frameId) frameId = requestAnimationFrame(animate)
        } else {
          if (frameId) { cancelAnimationFrame(frameId); frameId = null }
          mouseActive = false
          mouseTarget.set(9999, 0, 9999)
        }
      },
      { rootMargin: '250px 0px 250px 0px', threshold: 0 }
    )
    visibilityObserver.observe(mount)

    const REPEL_RADIUS = 9, REPEL_STRENGTH = 5.5, LIFT_STRENGTH = 2.5
    const clock = new THREE.Clock()
    const inverseRadius = 1 / REPEL_RADIUS, radiusSq = REPEL_RADIUS * REPEL_RADIUS

    const animate = () => {
      if (destroyed || !sectionVisible) { frameId = null; return }

      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      if (mouseActive) {
        raycaster.setFromCamera(mouseNDC, camera)
        const intersections = raycaster.intersectObject(plane, false)
        if (intersections.length > 0) {
          mouseTarget.copy(intersections[0].point)
          currentMouse.lerp(mouseTarget, 0.2)
        }
      } else {
        mouseTarget.set(9999, 0, 9999)
        currentMouse.lerp(mouseTarget, 0.06)
      }

      const mouseX = currentMouse.x, mouseZ = currentMouse.z, posArray = positionAttribute.array

      for (let i = 0; i < count; i++) {
        const x = baseX[i], z = baseZ[i]
        
        const wave = Math.sin(x * 0.25 + t * 1.2) * 1.2 + Math.sin(z * 0.2 + t * 0.8) * 1.2 + Math.sin((x + z) * 0.15 + t * 0.6) * 0.6
        
        const dx = x - mouseX, dz = z - mouseZ

        const distSq = dx * dx + dz * dz
        let pushX = 0, pushZ = 0, lift = 0

        if (distSq < radiusSq) {
          const dist = Math.sqrt(distSq)
          const falloff = 1 - dist * inverseRadius
          const eased = falloff * falloff

          if (dist > 0.0001) {
            const dirX = dx / dist, dirZ = dz / dist
            pushX = dirX * eased * REPEL_STRENGTH
            pushZ = dirZ * eased * REPEL_STRENGTH
          }
          lift = eased * LIFT_STRENGTH
        }

        const offset = i * 3
        posArray[offset] = x + pushX
        posArray[offset + 1] = wave + lift
        posArray[offset + 2] = z + pushZ
      }

      positionAttribute.needsUpdate = true
      renderer.render(scene, camera)
    }

    renderer.render(scene, camera)

    return () => {
      destroyed = true
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
      if (frameId) { cancelAnimationFrame(frameId); frameId = null }
      visibilityObserver.disconnect()
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointerMove)
      
      geometry.dispose(); material.dispose()
      planeGeo.dispose(); planeMat.dispose()
      renderer.dispose()
    }
  }, [color, dotCount])

  return (
    <div ref={mountRef} className="wave-bg">
      <canvas ref={canvasRef} />
    </div>
  )
}