import { motion } from 'framer-motion'
import { gooeyToast } from 'goey-toast'
import { useRef } from 'react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const Newsletter = () => {
  const emailRef = useRef<HTMLInputElement>(null)
  const handleSubscribe = async () => {
    if (
      emailRef.current?.value &&
      emailRef.current.value.trim() !== '' &&
      EMAIL_REGEX.test(emailRef.current.value)
    ) {
      //send email using resend to senthilkumar@mentorbridge.in
      const response = await fetch('/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          to: 'senthilkumar@mentorbridge.in',
          subject: 'Newsletter Subscription',
          html: `<p>Someone has subscribed to the newsletter. Email: ${emailRef.current.value}</p>`,
        }),
      })
      if (response.ok) {
        gooeyToast.success('Subscribed to newsletter', {
          description: <span>{emailRef.current.value}</span>,
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
          timing: { displayDuration: 2000 },
        })
        emailRef.current.value = ''
      } else {
        gooeyToast.error('Failed to subscribe to newsletter', {
          description: <span>Failed to subscribe to newsletter</span>,
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
          timing: { displayDuration: 2000 },
        })
      }
    } else {
      gooeyToast.error('Invalid email', {
        description: <span>Invalid email</span>,
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 2000 },
      })
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-black">
        Stay in the loop
      </h4>
      <p className="mb-4 text-sm text-black">
        Get updates on news, events, and community highlights.
      </p>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="email"
          placeholder="you@example.com"
          className="flex-1 rounded-lg border border-primary/40 bg-white/5 px-4 py-3 text-sm text-primary placeholder:text-slate-500 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          ref={emailRef}
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={handleSubscribe}
        >
          Subscribe
        </button>
      </form>
    </motion.div>
  )
}
