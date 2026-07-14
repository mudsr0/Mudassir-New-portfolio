const items = [
  'Agentic AI', 'Automations', 'Full-stack SaaS', '3D Web',
  'Mobile Apps', 'AI Systems', 'Voice AI', 'Next.js',
  'Three.js', 'GSAP', 'Flutter', 'DevRolin', 'Eylina',
]

export default function Marquee() {
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
