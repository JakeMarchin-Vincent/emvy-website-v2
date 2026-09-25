import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function () {
    return { emails: { send } }
  }),
}))

import { POST } from '@/app/api/contact/route'

const validContact = {
  name: 'Alex Business',
  email: 'alex@example.com',
  company: 'Local Co',
  location: 'Perth',
  message: 'I would like to improve our customer intake workflow.',
  website: '',
}

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://emvyai.com/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', host: 'emvyai.com', origin: 'https://emvyai.com', ...headers },
    body: JSON.stringify(body),
  })
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = 're_test_key'
    process.env.CONTACT_TO_EMAIL = 'hello@emvyai.com'
    process.env.CONTACT_FROM_EMAIL = 'hello@emvyai.com'
    send.mockReset()
    send.mockResolvedValue({ data: { id: 'email_123' }, error: null })
  })

  afterEach(() => {
    delete process.env.RESEND_API_KEY
    delete process.env.CONTACT_TO_EMAIL
    delete process.env.CONTACT_FROM_EMAIL
  })

  it('confirms a local consult only after email delivery succeeds', async () => {
    const response = await POST(request(validContact))

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ ok: true })
    expect(send).toHaveBeenCalledWith(expect.objectContaining({
      to: 'hello@emvyai.com',
      replyTo: 'alex@example.com',
      text: expect.stringContaining('Consultation preference: Local consult'),
    }))
  })

  it('rejects invalid input before calling the provider', async () => {
    const response = await POST(request({ ...validContact, message: 'short' }))

    expect(response.status).toBe(400)
    expect(send).not.toHaveBeenCalled()
  })

  it('rejects a filled honeypot and a different origin', async () => {
    const bot = await POST(request({ ...validContact, website: 'https://spam.example' }))
    const crossOrigin = await POST(request(validContact, { origin: 'https://other.example' }))

    expect(bot.status).toBe(403)
    expect(crossOrigin.status).toBe(403)
    expect(send).not.toHaveBeenCalled()
  })

  it('reports unavailable delivery when the API key is missing', async () => {
    delete process.env.RESEND_API_KEY
    const response = await POST(request(validContact))

    expect(response.status).toBe(503)
    expect(send).not.toHaveBeenCalled()
  })

  it('does not claim success when Resend returns an error', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'Rejected' } })
    const response = await POST(request(validContact))

    expect(response.status).toBe(502)
    expect((await response.json()).ok).toBeUndefined()
  })
})
