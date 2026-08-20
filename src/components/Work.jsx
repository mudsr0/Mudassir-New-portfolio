import { useRef, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from '../data.json'
import { useTypingAnimation } from '../hooks/useTypingAnimation'

gsap.registerPlugin(ScrollTrigger)

// Prevent the mobile browser address bar hide/show (visualViewport resize events)
// from constantly triggering ScrollTrigger.refresh() + recalculations, a primary
// cause of janky/jumping pinned sections on real phones.
ScrollTrigger.config({ ignoreMobileResize: true })

// normalizeScroll() must run BEFORE the ScrollTriggers it governs are created.
// It rewires native touch scrolling into JS-driven scrolling (with proper
// touch-action/overscroll handling), which stabilizes pinned sections on mobile.
// Module-level guard keeps it single-invocation (it's a global, not per-mount, setting).
let normalizedScrollEnabled = false
const enableNormalizedScroll = () => {
  if (normalizedScrollEnabled) return
  normalizedScrollEnabled = true
  ScrollTrigger.normalizeScroll(true)
}

function splitStack(stack) {
  if (Array.isArray(stack)) return stack
  if (!stack) return []
  return stack.split(/[·,]/).map((s) => s.trim()).filter(Boolean)
}

function WorkCard({ p, index, cardRef }) {
  const boundsRef = useRef(null)
  const navigate = useNavigate()
  const stackItems = splitStack(p.stack)

  const handleEnter = () => {
    const el = cardRef.current
    if (!el) return
    boundsRef.current = el.getBoundingClientRect()
  }

  const handleMove = (e) => {
    const el = cardRef.current
    if (!el) return
    const rect = boundsRef.current || (boundsRef.current = el.getBoundingClientRect())
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  const handleLeave = () => { boundsRef.current = null }

  const handleClick = () => {
    navigate(p.link)
  }

  return (
    <div ref={cardRef} className="wcard" style={{ zIndex: index + 1 }} onMouseEnter={handleEnter} onMouseMove={handleMove} onMouseLeave={handleLeave} onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }}>
      <div className="wcard-inner">
        <div className="wcard-media">
          {p.image && (
            <img className="wcard-image" src={p.image} alt={`${p.title} project preview`} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
          )}
        </div>

        <div className="wcard-text">
          <span className="wcard-index">{String(index + 1).padStart(2, '0')}</span>
          <div className="wcard-pills">
            {p.tag && <span className="wcard-pill">{p.tag}</span>}
            {p.year && <span className="wcard-pill wcard-pill-muted">{p.year}</span>}
          </div>
          <h3 className="wcard-title">{p.title}</h3>
          <p className="wcard-desc">{p.desc}</p>
          
          {stackItems.length > 0 && (
            <div className="wcard-stack">
              {stackItems.map((item) => <span key={item} className="wcard-stack-item">{item}</span>)}
            </div>
          )}

          <div className="wcard-view-btn">View Case Study <span>↗</span></div>
        </div>
        {/* Ensure this element has a background color in your CSS (e.g., background: rgba(0,0,0,0.5)) */}
        <div className="wcard-dim" aria-hidden="true" />
      </div>
    </div>
  )
}

export default function Work() {
  const sectionRef = useRef(null), stackRef = useRef(null), cardRefs = useRef([]), eyebrowRef = useRef(null)
  const projects = data.work || []

  useTypingAnimation(eyebrowRef, data.workText.eyebrow, { trigger: sectionRef })

  useLayoutEffect(() => {
    const section = sectionRef.current, stack = stackRef.current
    if (!section || !stack || projects.length === 0) return

    let refreshTimer = null
    let leaveBackTimer = null

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.wcard')
      if (!cards.length) return

      const mm = gsap.matchMedia()
      mm.add({
        isDesktop: '(min-width: 1025px)',
        isTablet: '(min-width: 768px) and (max-width: 1024px)',
        isMobile: '(max-width: 767px)',
      }, (context) => {
        const { isTablet, isMobile } = context.conditions
        const scaleAmount = isMobile ? 0.96 : isTablet ? 0.94 : 0.92
        const yShift = isMobile ? 0 : -4
        // scrub: 1 (smoothed) causes a "rubber-banding" lag on touch scrolling;
        // drop the smoothing on mobile so the pin tracks the finger 1:1-ish.
        const scrubValue = isMobile ? 0.5 : 1
        // On mobile, pin via 'fixed' instead of 'transform': transform-pinning fights
        // normalizeScroll + address-bar resize and is what causes cards to jump.
        const pinTypeValue = isMobile ? 'fixed' : 'transform'

        // Touch devices (mobile/tablet): normalize native scrolling for the pin.
        if (isMobile || isTablet) enableNormalizedScroll()

        // Declare that only vertical panning is allowed on the pinned element so the
        // browser never hesitates between native scroll and GSAP's transform handling.
        gsap.set(isMobile ? section : stack, { touchAction: 'pan-y' })

        cards.forEach((card, index) => {
          gsap.set(card, {
            xPercent: 0, 
            yPercent: index === 0 ? 0 : 100, 
            opacity: 1, 
            scale: 1,
            transformOrigin: 'center top', 
            force3D: true,
            // Force GPU layer promotion (transform + opacity) up front so the mobile
            // compositor never paints mid-scroll when cards scale/fade.
            willChange: 'transform, opacity',
          })
          
          // Set initial opacity of dim layer directly instead of CSS var
          const dimLayer = card.querySelector('.wcard-dim')
          if (dimLayer) gsap.set(dimLayer, { opacity: 0 })
        })

        // Use a consistent scroll distance based on viewport to prevent ResizeObserver loops
        const getScrollDistance = () => window.innerHeight

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: isMobile ? section : stack,
            start: isMobile ? 'top top' : 'top top+=10%',
            end: () => '+=' + ((cards.length - 1) * getScrollDistance()),
            pin: isMobile ? section : true,
            pinSpacing: true, 
            pinType: pinTypeValue, 
            scrub: scrubValue,
            invalidateOnRefresh: true, 
            anticipatePin: 1,
            onLeaveBack: () => {
              // Debounce so rapid scroll-back can't fire a fresh gsap.set batch every frame.
              clearTimeout(leaveBackTimer)
              leaveBackTimer = setTimeout(() => {
                cards.forEach((card, index) => {
                  gsap.set(card, { xPercent: 0, yPercent: index === 0 ? 0 : 100, scale: 1 })
                  const dimLayer = card.querySelector('.wcard-dim')
                  if (dimLayer) gsap.set(dimLayer, { opacity: 0 })
                })
              }, 150)
            },
          },
        })

        cards.forEach((card, index) => {
          if (index === 0) return
          const previousCard = cards[index - 1]
          const prevDimLayer = previousCard.querySelector('.wcard-dim')
          
          timeline.to(card, { 
            xPercent: 0, 
            yPercent: 0, 
            duration: 1, 
            ease: 'power2.inOut', 
            force3D: true,
            transformOrigin: 'center top',
          })
          
          timeline.to(previousCard, {
            xPercent: 0, 
            scale: scaleAmount, 
            yPercent: yShift, 
            duration: 1, 
            ease: 'power2.inOut', 
            force3D: true, 
            transformOrigin: 'center top',
          }, '<')

          // Animate opacity directly on the dim layer (GPU accelerated)
          if (prevDimLayer) {
            timeline.to(prevDimLayer, {
              opacity: 0.55, // Adjust this value to match your desired dim amount
              duration: 1, 
              ease: 'power2.inOut',
              force3D: true,
            }, '<')
          }
        })
      })
    }, section)

    // Only refresh on orientation change, NOT on resize. 
    // Mobile browsers fire resize constantly when the address bar hides/shows.
    const handleOrientationChange = () => {
      clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => {
        if (sectionRef.current && document.body.contains(sectionRef.current)) {
          ScrollTrigger.refresh()
        }
      }, 250)
    }
    
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true })

    return () => {
      ctx.revert()
      clearTimeout(refreshTimer)
      clearTimeout(leaveBackTimer)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [projects.length])

  return (
    <section id="work" className="section" ref={sectionRef}>
      <div className="sec-header" data-fade>
        <div className="sec-eyebrow" ref={eyebrowRef}>{data.workText.eyebrow}</div>
        <h2 className="sec-h">{data.workText.heading}</h2>
        <p className="sec-p">{data.workText.subheading}</p>
      </div>

      <div className="work-list">
        <div className="work-stack" ref={stackRef}>
          <div className="work-stack-inner">
            {projects.map((project, index) => (
              <WorkCard
                key={project.title}
                p={project}
                index={index}
                cardRef={(element) => { cardRefs.current[index] = element }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}