import { useRef, useLayoutEffect, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from '../data.json'

gsap.registerPlugin(ScrollTrigger)

// const DUMMY_VIDEOS = [
//   'https://static.videezy.com/system/resources/previews/000/019/011/original/ICON-VERSION5.mp4',
//   'https://static.videezy.com/system/resources/previews/000/036/766/original/earth_stock2.mp4',
//   'https://static.videezy.com/system/resources/previews/000/044/890/original/Comp-1_4_1.mp4',
//   'https://static.videezy.com/system/resources/previews/000/019/000/original/ICON-VERSION1.mp4',
//   'https://static.videezy.com/system/resources/previews/000/039/602/original/4K.mp4',
// ]

function splitStack(stack) {
  if (Array.isArray(stack)) return stack
  if (!stack) return []
  return stack.split(/[·,]/).map((s) => s.trim()).filter(Boolean)
}

function WorkCard({ p, index, cardRef }) {
  const boundsRef = useRef(null)
  // const videoSrc = p.video || DUMMY_VIDEOS[index % DUMMY_VIDEOS.length]
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

  return (
    <div ref={cardRef} className="wcard" style={{ zIndex: index + 1 }} onMouseEnter={handleEnter} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div className="wcard-inner">
        <div className="wcard-media">
          {p.image && (
            <img className="wcard-image" src={p.image} alt={`${p.title} project preview`} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
          )}
          {/* 
          <video className="wcard-video" src={videoSrc} muted playsInline preload="metadata" aria-hidden="true" />
          */}
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

          {p.link && (
            <a href={p.link} target="_blank" rel="noopener noreferrer" className="wcard-cta">
              View project
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
        <div className="wcard-dim" aria-hidden="true" />
      </div>
    </div>
  )
}

// function useVideoVisibility(sectionRef) {
//   useEffect(() => {
//     const section = sectionRef.current
//     if (!section) return
//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach((entry) => {
//         const video = entry.target
//         if (entry.isIntersecting) {
//           if (video.paused) {
//             const promise = video.play()
//             if (promise?.catch) promise.catch(() => {})
//           }
//         } else {
//           if (!video.paused) video.pause()
//         }
//       })
//     }, { root: null, rootMargin: '300px 0px', threshold: 0.01 })
//     section.querySelectorAll('.wcard-video').forEach((video) => observer.observe(video))
//     return () => observer.disconnect()
//   }, [sectionRef])
// }

export default function Work() {
  const sectionRef = useRef(null), stackRef = useRef(null), cardRefs = useRef([])
  const projects = data.work || []
  // useVideoVisibility(sectionRef)

  useLayoutEffect(() => {
    const section = sectionRef.current, stack = stackRef.current
    if (!section || !stack || projects.length === 0) return

    let refreshTimer = null, visualViewportTimer = null

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
        const scrubValue = 1

        cards.forEach((card, index) => {
          gsap.set(card, {
            xPercent: 0, yPercent: index === 0 ? 0 : 100, opacity: 1, scale: 1,
            transformOrigin: 'center top', '--dim': 0, force3D: true,
          })
        })

        const getScrollDistance = () => isMobile ? stack.offsetHeight : window.innerHeight

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: isMobile ? section : stack,
            start: isMobile ? 'top top' : 'top top+=10%',
            end: () => '+=' + ((cards.length - 1) * getScrollDistance()),
            pin: isMobile ? section : true,
            pinSpacing: true, pinType: 'transform', scrub: scrubValue,
            invalidateOnRefresh: true, anticipatePin: 1,
            onLeaveBack: () => {
              cards.forEach((card, index) => {
                gsap.set(card, { xPercent: 0, yPercent: index === 0 ? 0 : 100, scale: 1, '--dim': 0 })
              })
            },
          },
        })

        cards.forEach((card, index) => {
          if (index === 0) return
          const previousCard = cards[index - 1]
          
          timeline.to(card, { xPercent: 0, yPercent: 0, duration: 1, ease: 'power2.inOut', force3D: true })
          timeline.to(previousCard, {
            xPercent: 0, scale: scaleAmount, yPercent: yShift, '--dim': 0.55,
            duration: 1, ease: 'power2.inOut', force3D: true, transformOrigin: 'center top',
          }, '<')
        })
      })
    }, section)

    const scheduleRefresh = (delay = 150) => {
      clearTimeout(refreshTimer)
      refreshTimer = setTimeout(() => {
        if (sectionRef.current && document.body.contains(sectionRef.current)) ScrollTrigger.refresh()
      }, delay)
    }
    scheduleRefresh(300)

    const handleResize = () => scheduleRefresh(150)
    const handleOrientationChange = () => scheduleRefresh(250)
    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('orientationchange', handleOrientationChange, { passive: true })

    const handleVisualViewportResize = () => {
      clearTimeout(visualViewportTimer)
      visualViewportTimer = setTimeout(() => scheduleRefresh(100), 150)
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportResize, { passive: true })
    }

    const resizeObserver = new ResizeObserver(() => scheduleRefresh(150))
    resizeObserver.observe(stack)

    return () => {
      ctx.revert()
      clearTimeout(refreshTimer); clearTimeout(visualViewportTimer)
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportResize)
      }
    }
  }, [projects.length])

  return (
    <section id="work" className="section" ref={sectionRef}>
      <div className="sec-header" data-fade>
        <div className="sec-eyebrow">
          <span className="eyebrow-num">02</span>
          selected work
        </div>
        <h2 className="sec-h">Case studies.</h2>
        <p className="sec-p">A selection of projects across AI, automation, and full-stack development.</p>
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