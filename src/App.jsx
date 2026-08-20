import { useEffect, useRef, useState, useLayoutEffect, Component } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { smoothScrollTo } from './utils/smoothScroll'

import Hero from './components/Hero';
import RobotSection from './components/RobotSection'
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
import CaseStudyDetail from './components/CaseStudyDetail'
import ScrollToTopButton from './components/ScrollToTopButton'

gsap.registerPlugin(ScrollTrigger, TextPlugin)

// Global config: the mobile browser address-bar/show resize storms must NOT
// trigger ScrollTrigger refreshes/recalculations anywhere in the app (Work pin,
// Hero parallax, About/App reveals). This makes the setting app-wide, not just
// in the Work section.
ScrollTrigger.config({ ignoreMobileResize: true })

// Stable references (module scope) so the fallback & error boundary nodes are
// never recreated across re-renders, which can fight Three.js over the canvas.
const robotFallback = <div className="robot-section" />

class RobotErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error, info) {
    console.error('[RobotErrorBoundary]', error, info)
  }
  render() {
    if (this.state.hasError) return robotFallback
    return this.props.children
  }
}

export default function App() {
  const cursorRef = useRef(null)
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)

  // Handle incoming navigation state from the Navbar: after landing on the home
  // page, smooth-scroll to the requested section (e.g. `#work`, `#about`).
  useLayoutEffect(() => {
    const scrollToId = location.state && location.state.scrollTo
    if (!scrollToId) return

    // Wait for the DOM (home sections + their GSAP setup) to be ready before scrolling.
    const timer = setTimeout(() => {
      smoothScrollTo(`#${scrollToId}`, { duration: 1.2 })

      // Clear the state so a manual refresh / revisit doesn't re-scroll.
      window.history.replaceState({}, '')
    }, 300)

    return () => clearTimeout(timer)
  }, [location.state])

  // Lock body scroll and manage initial load styles
  useEffect(() => {
    document.body.style.overflow = isLoading ? 'hidden' : 'auto'
  }, [isLoading])

  useEffect(() => {
    // Prevent GSAP/Lenis from initializing until preloader is done
    if (isLoading) return

    // ── Lenis smooth scroll ────────────────────────────────
    // Single instance, created once the preloader finishes (effect is gated by
    // [isLoading] below and lenis.destroy() runs on cleanup). It is driven by
    // GSAP's own rAF ticker so scrolling and ScrollTrigger stay in perfect sync.
    const lenis = new Lenis({
      duration: 3, // smoother feel (higher = smoother, lower = snappier)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
      smoothWheel: true,
    })

    // Expose the instance so components (Navbar, Hero, RobotSection,
    // ScrollToTopButton, etc.) can reuse Lenis for programmatic smooth scrolls.
    window.lenis = lenis

    // Tell ScrollTrigger every time Lenis scrolls.
    lenis.on('scroll', ScrollTrigger.update)

    // Single, clean rAF loop: drive Lenis through GSAP's ticker (GSAP's ticker
    // runs on requestAnimationFrame, so this is the one loop). Do NOT add a
    // second standalone requestAnimationFrame — calling lenis.raf twice per
    // frame double-drives the animation and reintroduces the jank we're fixing.
    const raf = (time) => {
      lenis.raf(time * 1000) // GSAP ticker time is in seconds; lenis expects ms
    }

    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    let disposeCursor = () => {}
    let idleId = 0

    const ctx = gsap.context(() => {
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

      disposeCursor = () => {
        window.removeEventListener("pointermove", moveCursor)
        hoverEls.forEach(el => { el.removeEventListener('mouseenter', enterBig); el.removeEventListener('mouseleave', leaveBig) })
      }

      // ── Fade-up animations ─────────────────────────────────
      const wait = (ms) => new Promise(r => setTimeout(r, ms))
      // Elements inside the case study page animate themselves (CaseStudyDetail),
      // so exclude them here to avoid double-animating.
      const isCaseStudy = (el) => !!el.closest('.case-study')
      const init = () => {
        document.querySelectorAll('[data-fade]').forEach((el) => {
          if (isCaseStudy(el)) return
          gsap.fromTo(el,
            { opacity: 0, y: 20 },
            {
              opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
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
      idleId = idleCallback(async () => {
        await wait(200) // let DOM settle
        ctx.add(init)

        // The initial refresh runs while the preloader locks body overflow and
        // before web fonts / the footer 3D canvas shift the layout. Recalculate
        // once fonts are ready so reveal triggers (footer included) fire correctly.
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => ScrollTrigger.refresh())
        }
        setTimeout(() => ScrollTrigger.refresh(), 600)

        // Safety net: never let a reveal-triggered element (e.g. the footer's
        // data-fade wrapper) stay stuck at opacity 0 if its trigger miscalculated.
        const revealStuck = () => {
          document.querySelectorAll('[data-fade]').forEach((el) => {
            if (el.closest('.case-study')) return
            const rect = el.getBoundingClientRect()
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              if (Number(gsap.getProperty(el, 'opacity')) < 1) {
                gsap.to(el, {
                  opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
                  overwrite: true,
                })
              }
            }
          })
        }
        window.addEventListener('scroll', revealStuck, { passive: true })
        revealStuck()

        disposeCursor = (() => {
          const original = disposeCursor
          return () => {
            original()
            window.removeEventListener('scroll', revealStuck)
          }
        })()
      });
    })

    return () => {
      window.lenis = null
      lenis.destroy()
      gsap.ticker.remove(raf)
      disposeCursor()
      if (window.cancelIdleCallback) window.cancelIdleCallback(idleId)
      ctx.revert()
    }
  }, [isLoading]) // <-- Added isLoading dependency so this runs when preloader finishes

  return (
    <>
      {isLoading && (
        <Preloader onComplete={() => setIsLoading(false)} />
      )}

      <div className="noise" aria-hidden="true" />
      <div className="cursor" ref={cursorRef} aria-hidden="true" />

      <ScrollToTopButton />
      <Navbar />
      <main>
        <Routes>
          <Route path="/case-study/:id" element={<CaseStudyDetail />} />
          <Route path="*" element={
            <>
              <Hero />
              <Marquee />
              {/* <VideoTestimonials /> */}
              <Partners />
              <RobotErrorBoundary>
                <RobotSection />
              </RobotErrorBoundary>
              <Work />
              <About />
              <Services />
              <TechStack />
              <Testimonials />
              <Contact />
            </>
          } />
        </Routes>
      </main>
      <Footer />
    </>
  )
}