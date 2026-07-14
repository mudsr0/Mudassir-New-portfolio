const projects = [
  {
    tag: 'AI Platform',
    year: '2024',
    icon: '⚖',
    title: 'Eylina — Legal Intake AI',
    desc: 'AI-powered legal intake platform. Automates client onboarding, case triage, and document collection for law firms.',
    stack: 'Next.js · OpenAI · MongoDB',
  },
  {
    tag: 'Voice AI',
    year: '2024',
    icon: '◎',
    title: 'CallRolin — TTS System',
    desc: 'Multilingual voice AI platform on GCP. Custom VITS model training for Urdu, English, and Arabic TTS synthesis.',
    stack: 'Python · GCP · VITS · React',
  },
  {
    tag: 'CRM Automation',
    year: '2024',
    icon: '⬡',
    title: 'BuyerSide Spain CRM',
    desc: 'Full real-estate CRM with GHL automation, property pipeline management, and client reactivation workflows.',
    stack: 'GoHighLevel · Node.js · Zapier',
  },
  {
    tag: 'EdTech Platform',
    year: '2023',
    icon: '▶',
    title: 'ZEERO — AI Lecture Platform',
    desc: 'AI-powered multilingual video lecture platform with real-time translation, quiz generation, and progress tracking.',
    stack: 'React · OpenAI · Firebase',
  },
  {
    tag: 'AI Automation',
    year: '2024',
    icon: '♦',
    title: 'Cherrett Chiropractic AI',
    desc: 'AI patient reactivation system that autonomously contacts lapsed patients and books appointments through SMS.',
    stack: 'GHL · AI · Twilio',
  },
  {
    tag: 'Web Platform',
    year: '2024',
    icon: '◐',
    title: 'AtmoStreams — 3D Framer Site',
    desc: 'Premium Framer website with custom 3D animations, particle effects, and scroll-linked visual storytelling.',
    stack: 'Framer · Three.js · GSAP',
  },
]

export default function Work() {
  return (
    <section id="work" className="section">
      <div className="sec-header" data-fade>
        <div className="sec-eyebrow">
          <span className="eyebrow-num">03</span>
          selected work
        </div>
        <h2 className="sec-h">Case studies.</h2>
        <p className="sec-p">A selection of projects across AI, automation, and full-stack development.</p>
      </div>

      <div className="work-grid" data-stagger>
        {projects.map((p) => (
          <div key={p.title} className="work-card">
            <div className="wc-thumb">
              <span className="wc-tag">{p.tag}</span>
              <span className="wc-year">{p.year}</span>
              <div className="wc-icon" aria-hidden="true">{p.icon}</div>
            </div>
            <div className="wc-body">
              <div className="wc-title">{p.title}</div>
              <div className="wc-sub">{p.desc}</div>
              <div className="wc-link">
                {p.stack} <span aria-hidden="true">↗</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
