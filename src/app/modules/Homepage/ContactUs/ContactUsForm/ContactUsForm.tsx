'use client'

import { Button } from '@/components/ui/button'
import { SeparatorPro } from '@/components/ui/seperatorpro'
import { ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useContactUsForm } from './useContactUsForm'

const smoothEase = [0.25, 0.1, 0.25, 1] as const

const inputClassName =
  'w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:border-rose-400 dark:focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/10 transition-all duration-200'

export const ContactUsForm = () => {
  const {
    register,
    handleSubmit,
    onSubmit,
    formState: { errors, isSubmitting },
  } = useContactUsForm()

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.0, delay: 0.35, ease: smoothEase }}
      className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 flex flex-col gap-5"
    >
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-0.5">
          Send a message
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Fill out the form and we&apos;ll get back to you promptly.
        </p>
      </div>

      <SeparatorPro variant="dots" />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="contact-fullName"
              className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500"
            >
              Full Name
            </label>
            <input
              id="contact-fullName"
              type="text"
              autoComplete="name"
              placeholder="Kumar"
              className={inputClassName}
              aria-invalid={Boolean(errors.fullName)}
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.fullName.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="contact-company"
              className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500"
            >
              Company/College Name
            </label>
            <input
              id="contact-company"
              type="text"
              autoComplete="organization"
              placeholder="ABC Pvt Ltd"
              className={inputClassName}
              aria-invalid={Boolean(errors.company)}
              {...register('company')}
            />
            {errors.company && (
              <p className="text-xs text-red-600 dark:text-red-400">{errors.company.message}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-email"
            className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500"
          >
            Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="kumar@abc.com"
            className={inputClassName}
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="contact-message"
            className="text-xs font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            placeholder="Type your message here"
            rows={8}
            className={`${inputClassName} py-3 resize-none`}
            aria-invalid={Boolean(errors.message)}
            {...register('message')}
          />
          {errors.message && (
            <p className="text-xs text-red-600 dark:text-red-400">{errors.message.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-fit h-11 px-8 rounded-xl font-semibold text-sm bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 group disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Submit
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>
    </motion.div>
  )
}
