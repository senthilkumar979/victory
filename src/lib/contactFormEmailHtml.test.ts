import { describe, expect, it } from 'vitest'

import { buildContactFormEmailHtml } from './contactFormEmailHtml'
import { contactFormSchema } from './contactFormSchema'

describe('contactFormSchema', () => {
  it('accepts a valid payload and rejects empty name, invalid email, and oversize message', () => {
    expect(
      contactFormSchema.safeParse({
        fullName: 'Ada Lovelace',
        company: 'MentorBridge',
        email: 'ada@example.com',
        message: 'Hello',
      }).success,
    ).toBe(true)

    expect(
      contactFormSchema.safeParse({
        fullName: '',
        company: '',
        email: 'not-an-email',
        message: '',
      }).success,
    ).toBe(false)

    expect(
      contactFormSchema.safeParse({
        fullName: 'Ada',
        company: '',
        email: 'ada@example.com',
        message: 'x'.repeat(10001),
      }).success,
    ).toBe(false)
  })
})

describe('buildContactFormEmailHtml', () => {
  it('escapes HTML in every field and encodes the mailto href', () => {
    const html = buildContactFormEmailHtml({
      fullName: '<script>alert(1)</script>',
      company: 'Acme & Co',
      email: 'ada+test@example.com',
      message: 'Line 1\n<script>alert(2)</script>',
    })

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('Acme &amp; Co')
    expect(html).toContain('ada+test@example.com')
    expect(html).toContain('mailto:ada%2Btest%40example.com')
    expect(html).toContain('Line 1<br/>&lt;script&gt;alert(2)&lt;/script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).not.toContain('<script>alert(2)</script>')
  })

  it('renders an em dash when company is blank after trim', () => {
    const html = buildContactFormEmailHtml({
      fullName: 'Ada',
      company: '   ',
      email: 'ada@example.com',
      message: 'Hello',
    })

    expect(html).toContain('>—</td>')
  })
})
