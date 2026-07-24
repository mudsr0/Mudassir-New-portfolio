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

function WorkCard({ p, index }) {
  const cardRef = useRef(null)

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
      </div>
    </div>
  )
}

export default function Work() {
  const sectionRef = useRef(null)
  const stackRef = useRef(null)
  const projects = data.work

  useLayoutEffect(() => {
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
        const opacityAmount = isMobile ? 0.8 : 0.6
        const yShift = isMobile ? -2 : -4
        const startOffset = "10%"
        const scrubVal = 1 

        cards.forEach((card, i) => {
          if (i > 0) {
            gsap.set(card, { 
              yPercent: 100, 
              opacity: 1, 
              scale: 1,
              transformOrigin: "center top" 
            })
          } else {
            gsap.set(card, { 
              yPercent: 0, 
              opacity: 1, 
              scale: 1,
              transformOrigin: "center top"
            })
          }
        })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stackRef.current, // Pins the outer 100% width container
            start: `top top+=${startOffset}`,
            end: () => "+=" + ((cards.length - 1) * window.innerHeight), 
            pin: true,
            pinSpacing: true,
            scrub: scrubVal,
            invalidateOnRefresh: true,
            anticipatePin: 1
          }
        })

        cards.forEach((card, i) => {
          if (i === 0) return

          tl.to(card, {
            yPercent: 0,
            duration: 1,
            ease: "power2.inOut",
            force3D: true
          })

          tl.to(cards[i - 1], {
            scale: scaleAmount,
            yPercent: yShift,
            opacity: opacityAmount,
            duration: 1,
            ease: "power2.inOut",
            force3D: true,
            transformOrigin: "center top"
          }, "<")
        })
      })

    }, sectionRef)

    return () => ctx.revert()
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
        {/* Outer container gets pinned by GSAP. It is strictly 100% width. */}
        <div className="work-stack" ref={stackRef}>
          {/* Inner container handles the 85% width safely without GSAP interference */}
          <div className="work-stack-inner">
            {projects.map((p, i) => (
              <WorkCard key={p.title} p={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}