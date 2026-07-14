const services = [
  {
    num: '01',
    icon: '◈',
    title: 'Agentic AI',
    desc: 'Multi-agent pipelines, LLM orchestration, autonomous decision systems that operate without human intervention.',
  },
  {
    num: '02',
    icon: '⇌',
    title: 'Automations',
    desc: 'Code-first automation: custom webhooks, API chains, GHL integrations. Zero drag-and-drop.',
  },
  {
    num: '03',
    icon: '▣',
    title: 'Full-stack SaaS',
    desc: 'Next.js, MERN stack, custom CRMs, dashboards, and portals built to scale globally.',
  },
  {
    num: '04',
    icon: '◉',
    title: '3D Web',
    desc: 'Three.js and React Three Fiber experiences — portfolios, product showcases, interactive installations.',
  },
  {
    num: '05',
    icon: '▦',
    title: 'Mobile Apps',
    desc: 'Flutter cross-platform apps for iOS and Android. One codebase, native-grade performance.',
  },
  {
    num: '06',
    icon: '∿',
    title: 'AI / ML Systems',
    desc: 'TTS model training, EEG signal classification, BCI pipelines, voice synthesis, Groq & OpenAI integration.',
  },
]

export default function Services() {
  return (
    <section id="services" className="section">
      <div className="sec-header" data-fade>
        <div className="sec-eyebrow">
          <span className="eyebrow-num">02</span>
          services
        </div>
        <h2 className="sec-h">What I build.</h2>
      </div>

      <div className="svc-grid" data-stagger>
        {services.map((s) => (
          <div key={s.num} className="svc-cell">
            <div className="svc-hover-bg" />
            <div className="svc-num">{s.num}</div>
            <div className="svc-icon" aria-hidden="true">{s.icon}</div>
            <div className="svc-title">{s.title}</div>
            <div className="svc-desc">{s.desc}</div>
            <div className="svc-arrow" aria-hidden="true">→</div>
          </div>
        ))}
      </div>
    </section>
  )
}
