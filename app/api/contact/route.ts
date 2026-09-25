import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

const MAX_BODY_BYTES = 12_000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ContactRequest = {
  name: string
  email: string
  company: string
  location: string
  message: string
  website: string
}

function parseContact(value: unknown): ContactRequest | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const input = value as Record<string, unknown>
  const fields = ['name', 'email', 'company', 'location', 'message', 'website'] as const
  if (fields.some((field) => input[field] !== undefined && typeof input[field] !== 'string')) return null

  const contact = {
    name: String(input.name ?? '').trim(),
    email: String(input.email ?? '').trim(),
    company: String(input.company ?? '').trim(),
    location: String(input.location ?? '').trim(),
    message: String(input.message ?? '').trim(),
    website: String(input.website ?? '').trim(),
  }

  if (
    contact.name.length < 2 || contact.name.length > 120 ||
    !EMAIL_PATTERN.test(contact.email) || contact.email.length > 254 ||
    contact.company.length > 160 || contact.location.length > 120 ||
    contact.message.length < 10 || contact.message.length > 5_000 ||
    contact.website.length > 160
  ) return null

  return contact
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ error: 'This request could not be accepted.' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'This request could not be accepted.' }, { status: 403 })
    }
  }

  if (Number(req.headers.get('content-length')) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Your message is too long.' }, { status: 413 })
  }

  const rawBody = await req.text()
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Your message is too long.' }, { status: 413 })
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Please check your details and try again.' }, { status: 400 })
  }

  const contact = parseContact(body)
  if (!contact) {
    return NextResponse.json({ error: 'Please check your details and try again.' }, { status: 400 })
  }

  // An invisible field catches basic automated submissions without storing visitor data.
  if (contact.website) {
    return NextResponse.json({ error: 'This request could not be accepted.' }, { status: 403 })
  }

  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error('Contact delivery is unavailable: RESEND_API_KEY is missing')
    return NextResponse.json({ error: 'Contact is temporarily unavailable. Please try again later.' }, { status: 503 })
  }

  const recipient = process.env.CONTACT_TO_EMAIL || process.env.BREVO_SENDER_EMAIL || 'hello@emvyai.com'
  const sender = process.env.CONTACT_FROM_EMAIL || process.env.BREVO_SENDER_EMAIL || 'hello@emvyai.com'
  const message = [
    'Consultation preference: Local consult',
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    `Company: ${contact.company || 'Not supplied'}`,
    `Location: ${contact.location || 'Not supplied'}`,
    '',
    contact.message,
  ].join('\n')

  try {
    const { error } = await new Resend(key).emails.send({
      from: sender,
      to: recipient,
      replyTo: contact.email,
      subject: 'Local consult enquiry from EMVY website',
      text: message,
    })
    if (error) throw error
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error('Contact delivery failed', error)
    return NextResponse.json({ error: 'Your message could not be sent. Please try again.' }, { status: 502 })
  }
}
