import { useEffect, useState } from 'react'
import WaveBackground from './common/WaveBackground'
import data from '../data.json'

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

  return (
    <section id="contact" className="contact">
      <WaveBackground color="#ffffff" dotCount={170} />

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

      <div className="contact-inner">
        <div data-fade>
          <div className="contact-eyebrow">
            ready to build?
          </div>

          <h2 className="contact-h">
            Let's make something<br />
            that doesn't exist yet.
          </h2>

          <p
            className="contact-sub"
            dangerouslySetInnerHTML={{
              __html: data.contact.subTextHtml,
            }}
          />
        </div>

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
      </div>
    </section>
  )
}