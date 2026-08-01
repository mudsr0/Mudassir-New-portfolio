import { useEffect, useRef, useState, Suspense, lazy } from 'react'
import { AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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

// Lazy load heavy 3D components to reduce initial JS bundle
const Hero = lazy(() => import('./components/Hero'))
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
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.6,
    })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    // ── Custom cursor ─────────────────────────
    const cursor = cursorRef.current
    let mouseX = 0, mouseY = 0;
    let cursorX = -100, cursorY = -100;
    const speed = 0.15;
    let rafId;

    const moveCursor = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', moveCursor);

    const animateCursor = () => {
      // Lerp for smooth trailing
      cursorX += (mouseX - cursorX) * speed;
      cursorY += (mouseY - cursorY) * speed;

      // Use translate3d to force GPU acceleration (no reflows)
      if (cursor) {
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      }
      rafId = requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const enterBig = () => cursor?.classList.add('lg')
    const leaveBig = () => cursor?.classList.remove('lg')
    const hoverEls = document.querySelectorAll('button, a, .svc-cell, .work-card, .stat-card, .tech-pill, .testi-card')
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

      // ── Background Parallax on sections ──────────────────
      document.querySelectorAll('.section').forEach((sec) => {
        gsap.fromTo(sec,
          { backgroundPositionY: '-25%' },
          {
            backgroundPositionY: '25%',
            ease: 'none',
            scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        )
      })

      // ── Card Parallax (Scrubbing yPercent) ────────────────
      document.querySelectorAll('.work-card, .stat-card').forEach((el, i) => {
        const speed = i % 2 === 0 ? -12 : -6;
        gsap.to(el, {
          yPercent: speed,
          ease: 'none',
          scrollTrigger: {
            trigger: el.closest('.section') || el.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          }
        });
      });

      // ── Stat cards counter ────────────────────────────────
      document.querySelectorAll('.stat-num').forEach((el) => {
        ScrollTrigger.create({
          trigger: el, start: 'top 85%', once: true,
          onEnter: () => gsap.fromTo(el, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.8)' })
        })
      })

      // ── Vertical Parallax ────────────────────────────────
      document.querySelectorAll('[data-parallax]').forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        gsap.to(el, {
          y: () => -(document.documentElement.scrollHeight * speed),
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
          }
        })
      })
    }

    init()

    return () => {
      lenis.destroy()
      window.removeEventListener('mousemove', moveCursor)
      cancelAnimationFrame(rafId) // Kill the cursor loop
      hoverEls.forEach(el => { el.removeEventListener('mouseenter', enterBig); el.removeEventListener('mouseleave', leaveBig) })
      ScrollTrigger.getAll().forEach(t => t.kill())
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
        {/* Wrap Hero in Suspense to allow the 3D code to load async */}
        <Suspense fallback={<div className="hero-section" />}>
          <Hero />
        </Suspense>
        
        <Marquee />
        <Services />
        <Work />
        <About />
        <TechStack />
        
        {/* Wrap RobotSection in Suspense */}
        <Suspense fallback={<div className="robot-section" />}>
          <RobotSection />
        </Suspense>
        
        <Testimonials />
        <VideoTestimonials />
        <Contact />
      </main>
      <Footer />
    </>
  )
}