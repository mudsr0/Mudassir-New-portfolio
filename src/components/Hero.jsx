import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'

export default function Hero() {
  const mountRef = useRef(null)
  const mouse    = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const rafRef   = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = window.innerWidth
    const H = window.innerHeight

    // ── Renderer ───────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)
    Object.assign(renderer.domElement.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none',
    })

    // ── Scene / Camera ─────────────────────────────────────
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200)
    camera.position.set(0, 0, 4.5)

    // ── Groups ─────────────────────────────────────────────
    const orbGroup = new THREE.Group()
    const envGroup = new THREE.Group()
    scene.add(orbGroup, envGroup)

    // ── 1. Core sphere particles ───────────────────────────
    const CORE = 1800
    const cPos  = new Float32Array(CORE * 3)
    for (let i = 0; i < CORE; i++) {
      const u = Math.random(), v = Math.random()
      const theta = 2 * Math.PI * u
      const phi   = Math.acos(2 * v - 1)
      const jitter = 0.96 + Math.random() * 0.08
      cPos[i*3]   = jitter * Math.sin(phi) * Math.cos(theta)
      cPos[i*3+1] = jitter * Math.sin(phi) * Math.sin(theta)
      cPos[i*3+2] = jitter * Math.cos(phi)
    }
    const cGeo = new THREE.BufferGeometry()
    cGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3))
    const cMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.022, transparent: true, opacity: 0.85, sizeAttenuation: true, depthWrite: false })
    const corePts = new THREE.Points(cGeo, cMat)
    orbGroup.add(corePts)

    // ── 2. Neural connection lines ─────────────────────────
    const lineVerts = []
    const SAMPLE = 400 // only compare a subset for performance
    for (let i = 0; i < SAMPLE; i++) {
      for (let j = i + 1; j < SAMPLE; j++) {
        const dx = cPos[i*3] - cPos[j*3]
        const dy = cPos[i*3+1] - cPos[j*3+1]
        const dz = cPos[i*3+2] - cPos[j*3+2]
        if (dx*dx + dy*dy + dz*dz < 0.18) {
          lineVerts.push(cPos[i*3], cPos[i*3+1], cPos[i*3+2])
          lineVerts.push(cPos[j*3], cPos[j*3+1], cPos[j*3+2])
        }
      }
    }
    const lGeo = new THREE.BufferGeometry()
    lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3))
    const lMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, depthWrite: false })
    const neuralLines = new THREE.LineSegments(lGeo, lMat)
    orbGroup.add(neuralLines)

    // ── 3. Inner glow sphere ───────────────────────────────
    const glowGeo = new THREE.SphereGeometry(0.72, 32, 32)
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.025, side: THREE.FrontSide })
    orbGroup.add(new THREE.Mesh(glowGeo, glowMat))

    // ── 4. Wireframe shell ─────────────────────────────────
    const wfGeo = new THREE.IcosahedronGeometry(1.04, 2)
    const wfMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.055 })
    orbGroup.add(new THREE.Mesh(wfGeo, wfMat))

    // ── 5. Orbit rings ─────────────────────────────────────
    const addRing = (r, op, rx, ry, rz) => {
      const g = new THREE.TorusGeometry(r, 0.003, 6, 120)
      const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: op })
      const mesh = new THREE.Mesh(g, m)
      mesh.rotation.set(rx, ry, rz)
      orbGroup.add(mesh)
      return mesh
    }
    const ring1 = addRing(1.32, 0.25, Math.PI / 2,   0,            0)
    const ring2 = addRing(1.55, 0.14, Math.PI / 3.5, Math.PI / 5,  0)
    const ring3 = addRing(1.8,  0.07, Math.PI / 6,   Math.PI / 3,  Math.PI / 8)

    // ── 6. Outer halo particles (background field) ─────────
    const HALO = 500
    const hPos  = new Float32Array(HALO * 3)
    for (let i = 0; i < HALO; i++) {
      const r = 2.2 + Math.random() * 3.5
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      hPos[i*3]   = r * Math.sin(phi) * Math.cos(theta)
      hPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
      hPos[i*3+2] = r * Math.cos(phi)
    }
    const hGeo = new THREE.BufferGeometry()
    hGeo.setAttribute('position', new THREE.BufferAttribute(hPos, 3))
    const hMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.014, transparent: true, opacity: 0.3, sizeAttenuation: true, depthWrite: false })
    envGroup.add(new THREE.Points(hGeo, hMat))

    // ── 7. Floating ambient dust (deep background) ─────────
    const DUST = 800
    const dPos  = new Float32Array(DUST * 3)
    for (let i = 0; i < DUST; i++) {
      dPos[i*3]   = (Math.random() - 0.5) * 20
      dPos[i*3+1] = (Math.random() - 0.5) * 20
      dPos[i*3+2] = (Math.random() - 0.5) * 8 - 2
    }
    const dGeo = new THREE.BufferGeometry()
    dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3))
    const dMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.008, transparent: true, opacity: 0.15, depthWrite: false })
    const dust = new THREE.Points(dGeo, dMat)
    scene.add(dust)

    // ── Intro entrance ─────────────────────────────────────
    orbGroup.scale.set(0.001, 0.001, 0.001)
    cMat.opacity = 0
    lMat.opacity = 0
    gsap.to(orbGroup.scale, { x: 1, y: 1, z: 1, duration: 2.2, ease: 'expo.out', delay: 0.3 })
    gsap.to(cMat,  { opacity: 0.85, duration: 2.5, ease: 'power2.out', delay: 0.2 })
    gsap.to(lMat,  { opacity: 0.18, duration: 3.5, ease: 'power2.out', delay: 0.8 })

    // ── Mouse parallax ─────────────────────────────────────
    const onMove = (e) => {
      mouse.current.tx = (e.clientX / W - 0.5) * 2
      mouse.current.ty = -(e.clientY / H - 0.5) * 2
    }
    const onTouch = (e) => {
      mouse.current.tx = (e.touches[0].clientX / W - 0.5) * 2
      mouse.current.ty = -(e.touches[0].clientY / H - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove,  { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })

    // ── Resize ─────────────────────────────────────────────
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Main loop ──────────────────────────────────────────
    let t = 0
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      t += 0.008

      // Smooth damp mouse
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.045
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.045

      // Orb rotation
      orbGroup.rotation.y += 0.003 + mouse.current.x * 0.0008
      orbGroup.rotation.x  = mouse.current.y * 0.15
      orbGroup.rotation.z += 0.0005

      // Camera drift
      camera.position.x += (mouse.current.x * 0.35 - camera.position.x) * 0.04
      camera.position.y += (mouse.current.y * 0.25 - camera.position.y) * 0.04

      // Ring spin
      ring1.rotation.z += 0.004
      ring2.rotation.z -= 0.002
      ring3.rotation.x += 0.001

      // Breathe
      const breathe = 1 + Math.sin(t * 0.7) * 0.018
      orbGroup.scale.set(breathe, breathe, breathe)

      // Halo slow drift
      envGroup.rotation.y += 0.0006
      dust.rotation.y     -= 0.0002

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('resize', onResize)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="hero-section">
      {/* Three.js canvas mount */}
      <div ref={mountRef} className="hero-canvas-wrap" aria-hidden="true" />

      {/* Radial gradient overlay - depth effect */}
      <div className="hero-vignette" aria-hidden="true" />

      {/* Content */}
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="eyebrow-line" />
          agentic ai · automations · 3d web
          <span className="eyebrow-line" />
        </div>

        <h1 className="hero-h1">
          I build what<br />
          <em>doesn't exist</em><br />
          yet.
        </h1>

        <p className="hero-caption">
          AI Agents · Autonomous Systems · Full-stack SaaS · 3D Experiences<br />
          DevRolin · Eylina · Based in Pakistan · Serving globally
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={() => scrollTo('work')}>view work</button>
          <button className="btn-ghost"   onClick={() => scrollTo('contact')}>start a project →</button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-hint" aria-hidden="true">
        <span className="scroll-label">scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}
