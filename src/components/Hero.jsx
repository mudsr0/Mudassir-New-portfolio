import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from '../data.json'

gsap.registerPlugin(ScrollTrigger)

/* ─────────────────────────────────────────────────────────────
   Run expensive work when the browser is idle.
   This allows the critical Hero HTML/H1 to paint first.
───────────────────────────────────────────────────────────── */
const runWhenIdle = (callback) => {
  if ('requestIdleCallback' in window) return window.requestIdleCallback(callback, { timeout: 1200 })
  return window.setTimeout(callback, 100)
}

const cancelIdle = (id) => {
  if (id == null) return
  if ('cancelIdleCallback' in window) window.cancelIdleCallback(id)
  else window.clearTimeout(id)
}

export default function Hero() {
  const mountRef = useRef(null)
  const heroContentRef = useRef(null)
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const rafRef = useRef(null)
  const tlRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const heroContent = heroContentRef.current
    if (!mount || !heroContent) return

    let cancelled = false
    let idleId = null

    // Keep the viewport values outside the deferred initializer. 
    // This avoids unnecessary work before the browser paints.
    let W = window.innerWidth
    let H = window.innerHeight

    /* ─────────────────────────────────────────────────────────
       THREE.JS INITIALIZATION
    ───────────────────────────────────────────────────────── */
    const initThree = () => {
      if (cancelled) return
      W = window.innerWidth
      H = window.innerHeight

      /* ─── WebGL renderer ─── */
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
      renderer.setSize(W, H)
      // 1.5x is enough for a fullscreen decorative WebGL scene and significantly cheaper than allowing 2x on Retina.
      // Mobile uses 1x to reduce GPU pressure.
      renderer.setPixelRatio(window.innerWidth < 768 ? 1 : Math.min(window.devicePixelRatio, 1.5))
      renderer.setClearColor(0x000000, 0)
      mount.appendChild(renderer.domElement)

      Object.assign(renderer.domElement.style, {
        position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none',
      })

      /* ─── Scene + camera ─── */
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200)
      camera.position.set(0, 0, 4.5)

      /* ─── Main scene groups ─── */
      const orbGroup = new THREE.Group()
      // Separate group keeps the breathing animation independent from the GSAP entrance scale.
      const innerGroup = new THREE.Group()
      const envGroup = new THREE.Group()
      orbGroup.add(innerGroup)
      scene.add(orbGroup, envGroup)

      /* ========================================================
         1. CORE SPHERE PARTICLES
      ======================================================== */
      const CORE = 1800
      const cPos = new Float32Array(CORE * 3)

      for (let i = 0; i < CORE; i++) {
        const u = Math.random(), v = Math.random()
        const theta = 2 * Math.PI * u
        const phi = Math.acos(2 * v - 1)
        const jitter = 0.96 + Math.random() * 0.08

        cPos[i * 3] = jitter * Math.sin(phi) * Math.cos(theta)
        cPos[i * 3 + 1] = jitter * Math.sin(phi) * Math.sin(theta)
        cPos[i * 3 + 2] = jitter * Math.cos(phi)
      }

      const cGeo = new THREE.BufferGeometry()
      cGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3))
      const cMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.022, transparent: true, opacity: 0, sizeAttenuation: true, depthWrite: false })
      const corePts = new THREE.Points(cGeo, cMat)
      innerGroup.add(corePts)

      /* ========================================================
         2. NEURAL CONNECTION LINES
      ======================================================== */
      const lineVerts = []
      // Kept at 100 exactly as in your current version. No visual reduction here.
      const SAMPLE = 100

      for (let i = 0; i < SAMPLE; i++) {
        for (let j = i + 1; j < SAMPLE; j++) {
          const dx = cPos[i * 3] - cPos[j * 3]
          const dy = cPos[i * 3 + 1] - cPos[j * 3 + 1]
          const dz = cPos[i * 3 + 2] - cPos[j * 3 + 2]

          if (dx * dx + dy * dy + dz * dz < 0.18) {
            lineVerts.push(
              cPos[i * 3], cPos[i * 3 + 1], cPos[i * 3 + 2],
              cPos[j * 3], cPos[j * 3 + 1], cPos[j * 3 + 2]
            )
          }
        }
      }

      const lGeo = new THREE.BufferGeometry()
      lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3))
      const lMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })
      const neuralLines = new THREE.LineSegments(lGeo, lMat)
      innerGroup.add(neuralLines)

      /* ========================================================
         3. INNER GLOW SPHERE
      ======================================================== */
      const glowGeo = new THREE.SphereGeometry(0.72, 32, 32)
      const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.025, side: THREE.FrontSide })
      innerGroup.add(new THREE.Mesh(glowGeo, glowMat))

      /* ========================================================
         4. WIREFRAME SHELL
      ======================================================== */
      const wfGeo = new THREE.IcosahedronGeometry(1.04, 2)
      const wfMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.055 })
      innerGroup.add(new THREE.Mesh(wfGeo, wfMat))

      /* ========================================================
         5. ORBIT RINGS
      ======================================================== */
      const addRing = (r, op, rx, ry, rz) => {
        const g = new THREE.TorusGeometry(r, 0.003, 6, 120)
        const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: op })
        const mesh = new THREE.Mesh(g, m)
        mesh.rotation.set(rx, ry, rz)
        innerGroup.add(mesh)
        return mesh
      }

      const ring1 = addRing(1.32, 0.25, Math.PI / 2, 0, 0)
      const ring2 = addRing(1.55, 0.14, Math.PI / 3.5, Math.PI / 5, 0)
      const ring3 = addRing(1.8, 0.07, Math.PI / 6, Math.PI / 3, Math.PI / 8)

      /* ========================================================
         6. OUTER HALO PARTICLES
      ======================================================== */
      const HALO = 500
      const hPos = new Float32Array(HALO * 3)

      for (let i = 0; i < HALO; i++) {
        const r = 2.2 + Math.random() * 3.5
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)

        hPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        hPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        hPos[i * 3 + 2] = r * Math.cos(phi)
      }

      const hGeo = new THREE.BufferGeometry()
      hGeo.setAttribute('position', new THREE.BufferAttribute(hPos, 3))
      const hMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.014, transparent: true, opacity: 0.3, sizeAttenuation: true, depthWrite: false })
      envGroup.add(new THREE.Points(hGeo, hMat))

      /* ========================================================
         7. FLOATING AMBIENT DUST
      ======================================================== */
      const DUST = 1000
      const dPos = new Float32Array(DUST * 3)

      for (let i = 0; i < DUST; i++) {
        dPos[i * 3] = (Math.random() - 0.5) * 20
        dPos[i * 3 + 1] = (Math.random() - 0.5) * 20
        dPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
      }

      const dGeo = new THREE.BufferGeometry()
      dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3))
      const dMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.008, transparent: true, opacity: 0.15, depthWrite: false })
      const dust = new THREE.Points(dGeo, dMat)
      scene.add(dust)

      /* ─── Initial orb state ─── */
      orbGroup.scale.set(0.001, 0.001, 0.001)

      /* ========================================================
         SCROLLTRIGGER
      ======================================================== */
      gsap.to(camera.position, {
        z: -1.5, ease: 'none',
        scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true },
      })

      gsap.to(heroContent, {
        y: -120, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true },
      })

      /* ========================================================
         MOUSE / TOUCH
      ======================================================== */
      const onMove = (e) => {
        mouse.current.tx = (e.clientX / W - 0.5) * 2
        mouse.current.ty = -(e.clientY / H - 0.5) * 2
      }

      const onTouch = (e) => {
        if (!e.touches[0]) return
        mouse.current.tx = (e.touches[0].clientX / W - 0.5) * 2
        mouse.current.ty = -(e.touches[0].clientY / H - 0.5) * 2
      }

      window.addEventListener('mousemove', onMove, { passive: true })
      window.addEventListener('touchmove', onTouch, { passive: true })

      /* ========================================================
         RESIZE
      ======================================================== */
      const onResize = () => {
        const w = window.innerWidth
        const h = window.innerHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
        // Keep the existing adaptive pixel ratio.
        renderer.setPixelRatio(w < 768 ? 1 : Math.min(window.devicePixelRatio, 1.5))
      }

      window.addEventListener('resize', onResize)

      /* ========================================================
         RENDER LOOP
      ======================================================== */
      let t = 0

      const animate = () => {
        if (cancelled) return
        rafRef.current = requestAnimationFrame(animate)
        t += 0.008

        /* Smooth mouse easing */
        mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.045
        mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.045

        /* Orb rotation */
        orbGroup.rotation.y += 0.003 + mouse.current.x * 0.0008
        orbGroup.rotation.x = mouse.current.y * 0.15
        orbGroup.rotation.z += 0.0005

        /* Camera drift */
        camera.position.x += (mouse.current.x * 0.35 - camera.position.x) * 0.04
        camera.position.y += (mouse.current.y * 0.25 - camera.position.y) * 0.04

        /* Orbit ring spin */
        ring1.rotation.z += 0.004
        ring2.rotation.z -= 0.002
        ring3.rotation.x += 0.001

        /* Breathing animation */
        const breathe = 1 + Math.sin(t * 0.7) * 0.018
        innerGroup.scale.set(breathe, breathe, breathe)

        /* Background drift */
        envGroup.rotation.y += 0.0006
        dust.rotation.y -= 0.0002

        renderer.render(scene, camera)
      }

      animate()

      /* ========================================================
         PRELOADER / HERO INTRO
      ======================================================== */
      const startHeroIntro = () => {
        if (cancelled) return

        // IMPORTANT: Do NOT hide the H1 with opacity: 0.
        // Keeping opacity at 1 allows the browser to treat the H1 as a paintable LCP element.
        // We only animate its transform.
        gsap.set(['.hero-eyebrow', '.hero-caption'], { opacity: 0, y: 30 })
        gsap.set('.hero-actions', { opacity: 0, scale: 0.9 })
        gsap.set('.scroll-hint', { opacity: 0, y: -10 })
        
        // H1 remains visible. Only its position is animated.
        gsap.set('.hero-h1', { opacity: 1, y: 30 })

        // Remove fallback loading class after GSAP has established the animation states.
        document.body.classList.remove('js-loading')

        const tl = gsap.timeline({ delay: 0.2, defaults: { ease: 'expo.out' } })
        tlRef.current = tl

        tl.to(orbGroup.scale, { x: 1, y: 1, z: 1, duration: 0.4 })
          .to(cMat, { opacity: 0.85, duration: 2.5, ease: 'power2.out' }, '<0.2')
          .to(lMat, { opacity: 0.18, duration: 3.5, ease: 'power2.out' }, '<0.8')
          .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '0.3')
          // H1 animation preserved: same 30px starting offset and 1s duration. Only opacity is no longer animated from zero.
          .to('.hero-h1', { y: 0, duration: 1, ease: 'power3.out' }, '0.4')
          .to('.hero-caption', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '0.1')
          .to('.hero-actions', { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' }, '0.2')
          .to('.scroll-hint', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '0.1')
      }

      // Preloader synchronization remains unchanged.
      let introTimer = null
      if (document.querySelector('.loader-screen')) {
        window.addEventListener('app-loaded', startHeroIntro)
      } else {
        introTimer = setTimeout(startHeroIntro, 300)
      }

      /* ========================================================
         CLEANUP
      ======================================================== */
      const cleanup = () => {
        cancelAnimationFrame(rafRef.current)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('touchmove', onTouch)
        window.removeEventListener('resize', onResize)
        window.removeEventListener('app-loaded', startHeroIntro)

        if (introTimer) clearTimeout(introTimer)
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)

        // Dispose GPU resources.
        cGeo.dispose(); cMat.dispose()
        lGeo.dispose(); lMat.dispose()
        glowGeo.dispose(); glowMat.dispose()
        wfGeo.dispose(); wfMat.dispose()
        hGeo.dispose(); hMat.dispose()
        dGeo.dispose(); dMat.dispose()
        renderer.dispose()

        if (tlRef.current) {
          tlRef.current.kill()
          tlRef.current = null
        }

        // Kill only the triggers created by this Hero.
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      }

      // Store cleanup function on the initializer.
      initThree.cleanup = cleanup
    }

    // IMPORTANT: Delay the expensive WebGL setup until after the browser
    // has had an opportunity to paint the HTML Hero.
    idleId = runWhenIdle(() => {
      if (!cancelled) initThree()
    })

    /* ========================================================
       EFFECT CLEANUP
    ======================================================== */
    return () => {
      cancelled = true
      cancelIdle(idleId)
      cancelAnimationFrame(rafRef.current)

      // If Three.js already initialized, perform its full cleanup.
      if (initThree.cleanup) initThree.cleanup()
    }
  }, [])

  /* ───────────────────────────────────────────────────────────
     Scroll helpers
  ─────────────────────────────────────────────────────────── */
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.65, behavior: 'smooth' })
  }

  /* ───────────────────────────────────────────────────────────
     Render
  ─────────────────────────────────────────────────────────── */
  return (
    <section className="hero-section">
      {/* Three.js canvas mount */}
      <div ref={mountRef} className="hero-canvas-wrap" aria-hidden="true" />
      
      {/* Radial gradient overlay */}
      <div className="hero-vignette" aria-hidden="true" />
      
      {/* Main hero content */}
      <div ref={heroContentRef} className="hero-content">
        <div className="hero-eyebrow">
          <span className="eyebrow-line" />
          {data.hero.eyebrowText}
          <span className="eyebrow-line" />
        </div>

        <h1 className="hero-h1" dangerouslySetInnerHTML={{ __html: data.hero.headlineHtml }} />
        <p className="hero-caption" dangerouslySetInnerHTML={{ __html: data.hero.caption }} />

        <div className="hero-actions">
          <button className="btn-primary" onClick={() => scrollTo('work')}>view work</button>
          <button className="btn-ghost" onClick={() => scrollTo('contact')}>start a project →</button>
        </div>
      </div>

      {/* Interactive scroll hint */}
      <div
        className="scroll-hint"
        onClick={handleScrollDown}
        role="button"
        tabIndex={0}
        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
      >
        <span className="scroll-label">scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  )
}