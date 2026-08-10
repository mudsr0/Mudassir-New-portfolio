import { useEffect, useRef, useState, Suspense, lazy } from 'react'
import { AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Hero from './components/Hero';
import Preloader from './components/common/Preloader'
import Navbar from './components/Navbar'
import Marquee from './components/Marquee'
import About from './components/About'
import Services from './components/Services'
import Work from './components/Work'
import TechStack from './components/TechStack'
import Testimonials from './components/Testimonials'
import VideoTestimonials from './components/VideoTestimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Partners from './components/partners'

// Lazy load heavy 3D components to reduce initial JS bundle
const RobotSection = lazy(() => import('./components/RobotSection'))

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const cursorRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)

  // Lock body scroll and manage initial load styles
  useEffect(() => {
    document.body.style.overflow = isLoading ? 'hidden' : 'auto'
  }, [isLoading])

  useEffect(() => {
    // Prevent GSAP/Lenis from initializing until preloader is done
    if (isLoading) return

    // ── Lenis smooth scroll ────────────────────────────────
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    })
    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // ── Custom cursor ─────────────────────────────────────
    const cursor = cursorRef.current

    const cursorX = gsap.quickTo(cursor, "x", {
      duration: 0.45,
      ease: "power3.out",
    })

    const cursorY = gsap.quickTo(cursor, "y", {
      duration: 0.45,
      ease: "power3.out",
    })

    const moveCursor = (e) => {
      cursorX(e.clientX)
      cursorY(e.clientY)
    }

    window.addEventListener("pointermove", moveCursor)

    const enterBig = () => cursor?.classList.add('lg')
    const leaveBig = () => cursor?.classList.remove('lg')
    const hoverEls = document.querySelectorAll('button, a, .svc-cell, .work-card, .stat-card, .tech-pill, .testi-card, .partner-card')
    hoverEls.forEach(el => { el.addEventListener('mouseenter', enterBig); el.addEventListener('mouseleave', leaveBig) })

    // ── Fade-up animations ─────────────────────────────────
    const wait = (ms) => new Promise(r => setTimeout(r, ms))
    const init = async () => {
      await wait(200) // let DOM settle

      document.querySelectorAll('[data-fade]').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 55 },
          {
            opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
            delay: parseFloat(el.dataset.delay || 0),
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          }
        )
      })

      // ── Stagger children ─────────────────────────────────
      document.querySelectorAll('[data-stagger]').forEach((wrap) => {
        gsap.fromTo(Array.from(wrap.children),
          { opacity: 0, y: 45, scale: 0.97 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.85, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: wrap, start: 'top 84%', toggleActions: 'play none none none' },
          }
        )
      })

      // ── Section title reveal ─────────────────────────────
      document.querySelectorAll('.sec-h').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' },
          {
            opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)',
            duration: 1.2, ease: 'power4.out',
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
          }
        )
      })

      // ── Stat cards counter ────────────────────────────────
      document.querySelectorAll('.stat-num').forEach((el) => {
        ScrollTrigger.create({
          trigger: el, start: 'top 85%', once: true,
          onEnter: () => gsap.fromTo(el, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.8)' })
        })
      })
    }

    // ── Defer GSAP initialization to prevent main-thread blocking ──
    const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    const idleId = idleCallback(() => init());

    return () => {
      lenis.destroy()
      gsap.ticker.remove(raf)
      window.removeEventListener('pointermove', moveCursor)
      hoverEls.forEach(el => { el.removeEventListener('mouseenter', enterBig); el.removeEventListener('mouseleave', leaveBig) })
      ScrollTrigger.getAll().forEach(t => t.kill())
      if (window.cancelIdleCallback) window.cancelIdleCallback(idleId);
    }
  }, [isLoading]) // <-- Added isLoading dependency so this runs when preloader finishes

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <Preloader key="preloader" onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      <div className="noise" aria-hidden="true" />
      <div className="cursor" ref={cursorRef} aria-hidden="true" />

      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Suspense fallback={<div className="robot-section" />}>
          <RobotSection />
        </Suspense>
        <Services />
        <Work />
        <Partners />
        <About />
        <TechStack />
        <Testimonials />
        <VideoTestimonials />
        <Contact />
      </main>
      <Footer />
    </>
  )
}