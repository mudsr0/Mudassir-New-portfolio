import { useEffect, useState, useRef } from 'react'
import { Mail } from 'lucide-react'
import WaveBackground from './common/WaveBackground'
import data from '../data.json'
import { useTypingAnimation } from '../hooks/useTypingAnimation'

/*
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xaewqlgv'

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })

  const [toast, setToast] = useState({
    show: false,
    type: '',
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    })
  }

  useEffect(() => {
    if (!toast.show) return

    const timer = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false,
      }))
    }, 4000)

    return () => clearTimeout(timer)
  }, [toast.show])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.message.trim()
    ) {
      showToast('error', 'Please fill in all fields.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setForm({
          name: '',
          email: '',
          message: '',
        })

        showToast(
          'success',
          'Message sent! I’ll get back to you within 24 hours.'
        )
      } else {
        showToast(
          'error',
          result?.errors?.[0]?.message ||
            'Something went wrong. Please try again.'
        )
      }
    } catch {
      showToast(
        'error',
        'Unable to send your message. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }
*/

export default function Contact() {
  const contact = data.contact

  const [isModalOpen, setIsModalOpen] = useState(false)

  const sectionRef = useRef(null)
  const eyebrowRef = useRef(null)

  useTypingAnimation(eyebrowRef, contact.eyebrow, { trigger: sectionRef })

  return (
    <section id="contact" className="contact" ref={sectionRef}>
      <WaveBackground color="#ffffff" dotCount={170} />

      {/* Toast (form success/error messages) - re-enable with the form below
        {toast.show && (
          <div
            className={`contact-toast contact-toast-${toast.type}`}
            role="status"
            aria-live="polite"
          >
            <span className="contact-toast-icon">
              {toast.type === 'success' ? '✓' : '×'}
            </span>

            <span className="contact-toast-message">
              {toast.message}
            </span>

            <button
              type="button"
              className="contact-toast-close"
              onClick={() =>
                setToast((prev) => ({
                  ...prev,
                  show: false,
                }))
              }
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        )}
      */}

      <div className="contact-inner">
        <div data-fade>
          <div className="contact-eyebrow" ref={eyebrowRef}>
            {contact.eyebrow}
          </div>

          <h2 className="contact-h">
            {contact.heading}
          </h2>

          <p className="contact-sub">
            {contact.body}
          </p>

          <button
            type="button"
            className="btn-primary contact-cta"
            onClick={() => setIsModalOpen(true)}
            data-fade
            data-delay="0.2"
          >
            <span dangerouslySetInnerHTML={{ __html: contact.buttonText }} />
          </button>

          <div className="contact-footer-line">{contact.footerLine1}</div>
          <div className="contact-footer-line">{contact.footerLine2}</div>
        </div>

        {/* Contact form - re-enable by uncommenting (and restoring the state/handlers above)
          <form
            className="contact-form"
            onSubmit={handleSubmit}
            data-fade
            data-delay="0.2"
            noValidate
          >
            <input
              className="cf-field"
              type="text"
              name="name"
              placeholder="your name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />

            <input
              className="cf-field"
              type="email"
              name="email"
              placeholder="email address"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

            <textarea
              className="cf-field cf-textarea"
              name="message"
              placeholder="what do you need built?"
              value={form.message}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="cf-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'sending...' : 'send it →'}
            </button>
          </form>
        */}
      </div>

      {isModalOpen && (
        <div className="contact-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="contact-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="contact-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            <h3 className="contact-modal-title">Let's connect</h3>
            <p className="contact-modal-sub">Choose a platform to reach out:</p>
            <div className="contact-modal-options">
              <a href={contact.upworkUrl} target="_blank" rel="noopener noreferrer" className="contact-modal-link upwork">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z" /></svg>
                Upwork
              </a>
              <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className="contact-modal-link whatsapp">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C22 6.45 17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.46-1.38-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" /></svg>
                WhatsApp
              </a>
              <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="contact-modal-link linkedin">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                LinkedIn
              </a>
              <a href={contact.email} target="_blank" rel="noopener noreferrer" className="contact-modal-link email">
                <Mail size={18} />
                Email
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}