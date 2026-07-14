const tech = {
  featured: ['React / Next.js', 'Three.js', 'Node.js', 'Flutter', 'OpenAI API', 'Python', 'MongoDB'],
  rest: ['GSAP', 'Framer Motion', 'Neon DB', 'GCP', 'n8n', 'GoHighLevel', 'Groq', 'Vercel', 'Tailwind CSS', 'TypeScript', 'FastAPI', 'Twilio', 'Zapier', 'Airtable (API)', 'Shopify'],
}

export default function TechStack() {
  return (
    <section id="tech" className="section">
      <div className="tech-layout">
        <div data-fade>
          <div className="sec-eyebrow">
            <span className="eyebrow-num">04</span>
            tech stack
          </div>
          <h2 className="sec-h">My arsenal.</h2>
          <p className="tech-desc">
            Code-first always. I choose the right tool for each problem — from
            Three.js for immersive 3D to n8n for automation pipelines. No
            shortcuts, no limitations from drag-and-drop platforms.
          </p>
        </div>

        <div data-fade data-delay="0.15">
          <div className="tech-pills">
            {tech.featured.map((t) => (
              <span key={t} className="tech-pill featured">{t}</span>
            ))}
            {tech.rest.map((t) => (
              <span key={t} className="tech-pill">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
