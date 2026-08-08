import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const STATUS_MESSAGES = [
  'Initializing core systems',
  'Calibrating 3D engine',
  'Loading agentic workflows',
  'Compiling shaders',
  'Finalizing interface',
]

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [statusIdx, setStatusIdx] = useState(0)

  useEffect(() => {
    let interval
    let finishTimer

    const finishLoading = () => {
      clearInterval(interval)
      setProgress(100)
      setStatusIdx(STATUS_MESSAGES.length - 1)
    }

    if (document.readyState === 'complete') {
      finishTimer = setTimeout(finishLoading, 800)
    } else {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev

          const next = Math.min(prev + Math.random() * 8 + 2, 90)
          const nextStatus = Math.min(
            Math.floor((next / 100) * STATUS_MESSAGES.length),
            STATUS_MESSAGES.length - 1
          )

          setStatusIdx(nextStatus)
          return next
        })
      }, 120)

      window.addEventListener('load', finishLoading)
    }

    return () => {
      clearInterval(interval)
      clearTimeout(finishTimer)
      window.removeEventListener('load', finishLoading)
    }
  }, [])

  useEffect(() => {
    if (progress !== 100) return

    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('app-loaded'))
      onComplete()
    }, 500)

    return () => clearTimeout(timer)
  }, [progress, onComplete])

  return (
    <motion.div
      className="loader-screen"
      initial={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
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
            className="loader-name"
            style={{ '--progress': `${progress}%` }}
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
              <motion.div
                className="loader-progress-fill"
                style={{ width: `${progress}%` }}
              />
              <div
                className="loader-progress-glow"
                style={{ left: `${progress}%` }}
              />
            </div>

            <div className="loader-counter">
              {String(Math.floor(progress)).padStart(3, '0')}%
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Preloader