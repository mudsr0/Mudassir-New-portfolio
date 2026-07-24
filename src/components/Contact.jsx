import { useState } from 'react'
import WaveBackground from './common/WaveBackground'
import data from '../data.json'

export default function Contact() {
  const [form, setForm]     = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setStatus('Please fill in all fields.')
      return
    }
    // Replace this with your email API / EmailJS / Formspree endpoint
    setStatus("Message sent! I\u2019ll get back to you within 24 hours.")
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <section id="contact" className="contact">
      <WaveBackground color="#ffffff" dotCount={200} />
      <div className="contact-inner">
        <div data-fade>
          <div className="contact-eyebrow">ready to build?</div>
          <h2 className="contact-h">
            Let's make something<br />that doesn't exist yet.
          </h2>
          <p className="contact-sub" dangerouslySetInnerHTML={{ __html: data.contact.subTextHtml }} />
        </div>

        <form className="contact-form" onSubmit={handleSubmit} data-fade data-delay="0.2" noValidate>
          <input
            className="cf-field"
            type="text"
            name="name"
            placeholder="your name"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
          />
          <input
            className="cf-field"
            type="email"
            name="email"
            placeholder="email address"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
          <textarea
            className="cf-field cf-textarea"
            name="message"
            placeholder="what do you need built?"
            value={form.message}
            onChange={handleChange}
          />
          {status && (
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'left', paddingLeft: '4px' }}>
              {status}
            </p>
          )}
          <button type="submit" className="cf-submit">
            send it →
          </button>
        </form>
      </div>
    </section>
  )
}
