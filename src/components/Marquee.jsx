import data from '../data.json'

export default function Marquee() {
  const items = data.marquee.items
  const doubled = [...items, ...items]

  return (
    <div className="marquee-wrap" aria-hidden="true">
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
