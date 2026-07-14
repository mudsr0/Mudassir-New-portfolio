import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Navbar       from './components/Navbar'
import Hero         from './components/Hero'
import RobotSection from './components/RobotSection'
import Marquee      from './components/Marquee'
import About        from './components/About'
import Services     from './components/Services'
import Work         from './components/Work'
import TechStack    from './components/TechStack'
import Testimonials from './components/Testimonials'
import Contact      from './components/Contact'
import Footer       from './components/Footer'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const cursorRef = useRef(null)

  useEffect(() => {
    // ── Lenis smooth scroll ────────────────────────────────
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.6,
    })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    // ── Custom cursor ──────────────────────────────────────
    const cursor = cursorRef.current
    let cx = -100, cy = -100

    const moveCursor = (e) => {
      gsap.to(cursor, { left: e.clientX, top: e.clientY, duration: 0.55, ease: 'power3.out' })
    }
    window.addEventListener('mousemove', moveCursor)

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

      // ── Horizontal parallax on section bg ────────────────
      document.querySelectorAll('.section').forEach((sec) => {
        gsap.fromTo(sec,
          { backgroundPositionY: '-10%' },
          {
            backgroundPositionY: '10%',
            ease: 'none',
            scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true },
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

    init()

    return () => {
      lenis.destroy()
      window.removeEventListener('mousemove', moveCursor)
      hoverEls.forEach(el => { el.removeEventListener('mouseenter', enterBig); el.removeEventListener('mouseleave', leaveBig) })
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <>
      <div className="noise" aria-hidden="true" />
      <div className="cursor" ref={cursorRef} aria-hidden="true" />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <RobotSection />
        <About />
        <Services />
        <Work />
        <TechStack />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
