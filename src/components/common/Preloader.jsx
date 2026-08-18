import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const STATUS_MESSAGES = [
  'Initializing core systems',
  'Calibrating 3D engine',
  'Loading agentic workflows',
  'Compiling shaders',
  'Finalizing interface',
]

const Preloader = ({ onComplete }) => {
  const [statusIdx, setStatusIdx] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const targetProgress = useRef(0)
  const displayProgress = useRef(0)

  const fillRef = useRef(null)
  const counterRef = useRef(null)
  const nameRef = useRef(null)

  useEffect(() => {
    let interval
    let finishTimer
    let rafId

    const updateStatus = (val) => {
      const nextStatus = Math.min(
        Math.floor((val / 100) * STATUS_MESSAGES.length),
        STATUS_MESSAGES.length - 1
      )
      setStatusIdx(nextStatus)
    }

    const finishLoading = () => {
      clearInterval(interval)
      targetProgress.current = 100
      updateStatus(100)
    }

    if (document.readyState === 'complete') {
      finishTimer = setTimeout(finishLoading, 800)
    } else {
      interval = setInterval(() => {
        if (targetProgress.current >= 90) return
        
        const next = Math.min(targetProgress.current + Math.random() * 8 + 2, 90)
        targetProgress.current = next
        updateStatus(next)
      }, 120)

      window.addEventListener('load', finishLoading)
    }

    const animate = () => {
      const target = targetProgress.current
      const current = displayProgress.current

      // Smooth interpolation (Lerp) towards the target progress
      const diff = target - current
      if (Math.abs(diff) < 0.1) {
        displayProgress.current = target
      } else {
        displayProgress.current = current + diff * 0.1 // Adjust 0.1 for faster/slower smoothing
      }

      const val = displayProgress.current
      const percent = `${val}%`

      // Direct DOM manipulation for 60fps performance (Bypasses React re-renders)
      if (fillRef.current) {
        // Using scaleX is GPU-accelerated and much smoother than animating 'width'
        fillRef.current.style.transform = `scaleX(${val / 100})`
      }
      if (counterRef.current) {
        counterRef.current.textContent = `${String(Math.floor(val)).padStart(3, '0')}%`
      }
      if (nameRef.current) {
        nameRef.current.style.setProperty('--progress', percent)
      }

      // Trigger completion once visually reached 100%
      if (targetProgress.current === 100 && val > 99.9 && !isComplete) {
        setIsComplete(true)
      }

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      clearInterval(interval)
      clearTimeout(finishTimer)
      cancelAnimationFrame(rafId)
      window.removeEventListener('load', finishLoading)
    }
  }, [isComplete])

  useEffect(() => {
    if (!isComplete) return

    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('app-loaded'))
      onComplete()
    }, 500)

    return () => clearTimeout(timer)
  }, [isComplete, onComplete])

  return (
    <motion.div
      className="loader-screen"
      initial={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      // Promotes the entire preloader to a dedicated GPU layer.
      // This prevents repaints from affecting the rest of the page and fixes mobile lag on exit.
      style={{ willChange: 'transform' }} 
    >
      <div className="loader-grid-bg" aria-hidden="true" />
      <div className="loader-noise" aria-hidden="true" />

      <div className="loader-content">
        <div className="loader-corner loader-corner-tl" />
        <div className="loader-corner loader-corner-tr" />
        <div className="loader-corner loader-corner-bl" />
        <div className="loader-corner loader-corner-br" />

        <div className="loader-name-wrap">
          <h1
            ref={nameRef}
            className="loader-name"
            style={{ '--progress': '0%' }}
          >
            MUDASSIR
          </h1>
          <div className="loader-name-shadow" aria-hidden="true">
            MUDASSIR
          </div>
        </div>

        <div className="loader-bottom-bar">
          <div className="loader-status">
            <span className="loader-status-bracket">[</span>
            <span className="loader-status-text">
              {STATUS_MESSAGES[statusIdx]}
            </span>
            <span className="loader-status-cursor">_</span>
            <span className="loader-status-bracket">]</span>
          </div>

          <div className="loader-progress-wrap">
            <div className="loader-progress-track">
              <div
                ref={fillRef}
                className="loader-progress-fill"
                style={{ transformOrigin: 'left', transform: 'scaleX(0)' }}
              >
                {/* Move the glow INSIDE the fill so it automatically moves with the transform */}
                <div className="loader-progress-glow" aria-hidden="true" />
              </div>
            </div>

            <div ref={counterRef} className="loader-counter">
              000%
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Preloader