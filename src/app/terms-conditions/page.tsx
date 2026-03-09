'use client'

import { PageMain } from '@/ui/templates/PagaMain'
import { motion } from 'framer-motion'
import { PageHeader } from '../../ui/templates/PageHeader'

const SECTIONS = [
  {
    id: 1,
    title: 'Accounts and Registration',
    intro:
      'To use some features of the Service, including the mentorship programs and scheduling, you may be required to create an account. You may register by providing a valid email address or using the "Sign in with Google" option.',
    list: [
      'Provide accurate and current information',
      'Keep your account details secure and confidential',
      'Notify us immediately of any unauthorized use of your account',
    ],
  },
  {
    id: 2,
    title: 'Use of Service',
    intro:
      'MentorBridge connects students with professionals for mentorship. By using our platform, you agree to the following:',
    list: [
      'You are responsible for maintaining the confidentiality of your account.',
      'You may not use the Service for any unlawful or prohibited activity.',
      'You agree to respect the privacy and confidentiality of other users.',
    ],
  },
  {
    id: 3,
    title: 'Intellectual Property',
    content:
      'All content, including text, graphics, logos, and software, provided on MentorBridge is owned by us or our licensors and is protected by copyright laws. You may not reproduce or redistribute any content without permission.',
  },
  {
    id: 4,
    title: 'Termination',
    content:
      'We may terminate or suspend your account if you breach these Terms. Upon termination, your right to use the Service will cease immediately.',
  },
  {
    id: 5,
    title: 'Limitation of Liability',
    content:
      'To the maximum extent permitted by law, MentorBridge and its affiliates will not be liable for any indirect, incidental, or consequential damages arising from the use of our Service.',
  },
  {
    id: 6,
    title: 'Governing Law',
    content:
      'These Terms will be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.',
  },
  {
    id: 7,
    title: 'Modifications to the Terms',
    content:
      'We may update these Terms from time to time. Any changes will be posted on this page, and by continuing to use the Service after such changes, you agree to the updated Terms.',
  },
] as const

export default function TermsConditionsPage() {
  return (
    <PageMain>
      <article className="relative z-10 mx-auto max-w-3xl px-6 py-12 sm:py-16 lg:px-8">
        <PageHeader
          title="Terms and Conditions"
          description="These terms and conditions outline the rules and regulations for using our website."
          subtitle="Last updated: Mar 9, 2026"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-10"
        >
          <p className="text-base leading-relaxed text-slate-600">
            Welcome to MentorBridge! These terms and conditions
            (&quot;Terms&quot;) outline the rules and regulations for using our
            website,{' '}
            <a
              href="https://www.mentorbridge.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              https://www.mentorbridge.in
            </a>{' '}
            (&quot;Service&quot;). By accessing or using our Service, you agree
            to these Terms.
          </p>

          <div className="space-y-12">
            {SECTIONS.map((section, index) => (
              <motion.section
                key={section.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * (index + 2) }}
                className="border-l-2 border-primary/20 pl-6"
              >
                <h2 className="text-lg font-semibold text-slate-900">
                  {section.id}. {section.title}
                </h2>
                <p className="mt-2 text-slate-600">
                  {'intro' in section ? section.intro : section.content}
                </p>
                {'list' in section && (
                  <ul className="mt-3 space-y-2 pl-4">
                    {section.list.map((item, i) => (
                      <li
                        key={i}
                        className="relative text-slate-600 before:absolute before:-left-4 before:content-['•'] before:text-primary"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.section>
            ))}
          </div>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="rounded-2xl border border-white/20 bg-gradient-to-br from-primary/5 to-transparent p-6 backdrop-blur-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">Contact Us</h2>
            <p className="mt-2 text-slate-600">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 space-y-2">
              <a
                href="mailto:support@mentorbridge.in"
                className="block font-medium text-primary hover:underline"
              >
                Email: support@mentorbridge.in
              </a>
              <a
                href="https://www.mentorbridge.in"
                target="_blank"
                rel="noopener noreferrer"
                className="block font-medium text-primary hover:underline"
              >
                Website: https://www.mentorbridge.in
              </a>
            </div>
          </motion.section>
        </motion.div>
      </article>
    </PageMain>
  )
}
