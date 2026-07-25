import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from '../data.json'

gsap.registerPlugin(ScrollTrigger)

const DUMMY_VIDEOS = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://media.w3.org/2010/05/bunny/movie.mp4",
  "https://media.w3.org/2010/05/video/movie_300.mp4",
]

function splitStack(stack) {
  if (Array.isArray(stack)) return stack
  if (!stack) return []
  return stack.split(/[·,]/).map((s) => s.trim()).filter(Boolean)
}

function WorkCard({ p, index, cardRef }) {
  const handleMove = (e) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  const videoSrc = p.video || DUMMY_VIDEOS[index % DUMMY_VIDEOS.length]
  const stackItems = splitStack(p.stack)

  return (
    <div
      className="wcard"
      ref={cardRef}
      style={{ zIndex: index + 1 }}
      onMouseMove={handleMove}
    >
      <div className="wcard-inner">
        <div className="wcard-media">
          <video
            className="wcard-video"
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
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
              {stackItems.map((s) => (
                <span key={s} className="wcard-stack-item">{s}</span>
              ))}
            </div>
          )}

          <a href={p.link || '#'} className="wcard-cta" onClick={(e) => e.preventDefault()}>
            View project <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="wcard-dim" />
      </div>
    </div>
  )
}

export default function Work() {
  const sectionRef = useRef(null)
  const stackRef = useRef(null)
  const cardRefs = useRef([])
  const projects = data.work

  useLayoutEffect(() => {
    let refreshTimer
    let resizeTimer
    let vvResizeTimer

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.wcard')

      const mm = gsap.matchMedia()

      mm.add({
        isDesktop: "(min-width: 1025px)",
        isTablet: "(min-width: 768px) and (max-width: 1024px)",
        isMobile: "(max-width: 767px)"
      }, (context) => {
        const { isTablet, isMobile } = context.conditions

        const scaleAmount = isMobile ? 0.96 : isTablet ? 0.94 : 0.92
        
        /* ── Fix: Set yShift to 0 on mobile so cards never move upward ── */
        const yShift = isMobile ? 0 : -4
        
        const scrubVal = 1

        cards.forEach((card, i) => {
          gsap.set(card, {
            xPercent: 0,
            yPercent: i === 0 ? 0 : 100,
            opacity: 1,
            scale: 1,
            transformOrigin: "center top",
            '--dim': 0,
          })
        })

        const getScrollDistance = () => {
          if (isMobile && stackRef.current) {
            return stackRef.current.offsetHeight
          }
          return window.innerHeight
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: isMobile ? sectionRef.current : stackRef.current,
            start: isMobile ? "top top" : "top top+=10%",
            end: () => "+=" + ((cards.length - 1) * getScrollDistance()),
            pin: isMobile ? sectionRef.current : true,
            pinSpacing: true,
            pinType: "transform",
            scrub: scrubVal,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onLeaveBack: () => {
              cards.forEach((card, i) => {
                gsap.set(card, {
                  xPercent: 0,
                  yPercent: i === 0 ? 0 : 100,
                  scale: 1,
                  '--dim': 0,
                })
              })
            },
          }
        })

        cards.forEach((card, i) => {
          if (i === 0) return

          tl.to(card, {
            xPercent: 0,
            yPercent: 0,
            duration: 1,
            ease: "power2.inOut",
            force3D: true
          })

          tl.to(cards[i - 1], {
            xPercent: 0,
            scale: scaleAmount,
            yPercent: yShift,
            '--dim': 0.55,
            duration: 1,
            ease: "power2.inOut",
            force3D: true,
            transformOrigin: "center top"
          }, "<")
        })
      })

    }, sectionRef)

    // ── Fix: Safe, debounced refresh to prevent DOM removal errors ──
    const safeRefresh = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        // Only refresh if the section is still in the DOM
        if (sectionRef.current && document.body.contains(sectionRef.current)) {
          ScrollTrigger.refresh()
        }
      }, 150)
    }

    refreshTimer = setTimeout(safeRefresh, 300)

    const onVVResize = () => {
      clearTimeout(vvResizeTimer)
      vvResizeTimer = setTimeout(safeRefresh, 200)
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onVVResize)
    }

    const ro = new ResizeObserver(safeRefresh)
    if (stackRef.current) ro.observe(stackRef.current)

    window.addEventListener('resize', safeRefresh)
    window.addEventListener('orientationchange', safeRefresh)

    return () => {
      ctx.revert()
      clearTimeout(refreshTimer)
      clearTimeout(resizeTimer)
      clearTimeout(vvResizeTimer)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onVVResize)
      }
      ro.disconnect()
      window.removeEventListener('resize', safeRefresh)
      window.removeEventListener('orientationchange', safeRefresh)
    }
  }, [])

  return (
    <section id="work" className="section" ref={sectionRef}>
      <div className="sec-header" data-fade>
        <div className="sec-eyebrow">
          <span className="eyebrow-num">03</span>
          selected work
        </div>
        <h2 className="sec-h">Case studies.</h2>
        <p className="sec-p">A selection of projects across AI, automation, and full-stack development.</p>
      </div>

      <div className="work-list">
        <div className="work-stack" ref={stackRef}>
          <div className="work-stack-inner">
            {projects.map((p, i) => (
              <WorkCard
                key={p.title}
                p={p}
                index={i}
                cardRef={(el) => (cardRefs.current[i] = el)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}