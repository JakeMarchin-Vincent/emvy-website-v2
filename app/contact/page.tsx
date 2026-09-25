'use client'

import { CAL_CONSULT_URL } from '@/lib/cal-links'
import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import PageHero from '../../components/PageHero'

type ContactState = {
  name: string
  email: string
  company: string
  location: string
  message: string
  website: string
}

const initialState: ContactState = {
  name: '',
  email: '',
  company: '',
  location: '',
  message: '',
  website: '',
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactState>(initialState)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || 'Your message could not be sent. Please try again.')
      }

      setDone(true)
      setForm(initialState)
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Your message could not be sent. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Start a direct conversation with EMVY."
        description="Use this form to discuss a workflow, system, or operational issue."
        image="https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=1800&q=90&auto=format&fit=crop"
      >
        <a href="#local-consult" className="button primary">Local consult</a>
        <a href={CAL_CONSULT_URL} className="button light" target="_blank" rel="noopener noreferrer">Online consult</a>
      </PageHero>

      <section className="section" id="local-consult">
        <div className="contact-band">
          <div className="contact-copy">
            <p className="section-kicker">Local consult</p>
            <h2 className="section-title">A short brief is enough to get the conversation moving.</h2>
            <p className="section-text">
              Tell us where you are based, what workflow needs attention, and what you want to
              improve. We will follow up to arrange the right local conversation.
            </p>
            <div className="contact-list">
              <a href={CAL_CONSULT_URL} target="_blank" rel="noopener noreferrer">Book an online consult</a>
              <Link href="/services#assessment">AI Workflow Assessment</Link>
              <Link href="/services">View services</Link>
            </div>
          </div>

          <form className={`contact-form ${done ? 'submitted' : ''}`} onSubmit={handleSubmit}>
            {done ? (
              <div className="submit-success">
                <p className="section-kicker">Thanks</p>
                <h3>Your message has been sent.</h3>
                <p>We will get back to you shortly.</p>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <label>
                    Name
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                      minLength={2}
                      maxLength={120}
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Work email"
                      maxLength={254}
                      required
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Company
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                      placeholder="Company name"
                      maxLength={160}
                    />
                  </label>
                  <label>
                    Suburb or location
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Where are you based?"
                      maxLength={120}
                    />
                  </label>
                </div>
                <label>
                  Message
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="What would you like help with?"
                    minLength={10}
                    maxLength={5000}
                    required
                  />
                </label>
                <label className="contact-honeypot" aria-hidden="true">
                  Website
                  <input
                    type="text"
                    autoComplete="off"
                    tabIndex={-1}
                    value={form.website}
                    onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                  />
                </label>
                {error ? <p className="lp-error" role="alert">{error}</p> : null}
                <button type="submit" className="button primary" disabled={loading} aria-busy={loading}>
                  {loading ? 'Sending...' : 'Send local consult enquiry'}
                </button>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  )
}
