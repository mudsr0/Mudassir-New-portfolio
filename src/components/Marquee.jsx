import { useRef } from 'react'
import data from '../data.json'
import usePauseOnHidden from '../hooks/usePauseOnHidden'

export default function Marquee() {
  const items = data.marquee.items
  const doubled = [...items, ...items]
  const wrapRef = useRef(null)

  usePauseOnHidden(wrapRef)

  return (
    <div className="marquee-wrap" ref={wrapRef} aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="mq-item">
            {item}
            <span className="mq-sep">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
