'use client'

import { PageMain } from '@/ui/templates/PagaMain'
import { motion } from 'framer-motion'
import { PageHeader } from '@/ui/templates/PageHeader'

const SECTIONS = [
  {
    id: 1,
    title: 'Information We Collect',
    intro:
      'We collect several types of information to provide and improve our Service, including:',
    subsections: [
      {
        title: 'Personal Data',
        intro:
          'When you use "Sign in with Google," we collect the following information from your Google account, as allowed by Google:',
        list: ['Name', 'Email address', 'Profile picture (if applicable)'],
        additional:
          'Additionally, we may collect other personal information you provide when registering or interacting with the Service, such as details related to your mentorship experience (if applicable).',
      },
      {
        title: 'Usage Data',
        intro:
          'We automatically collect certain information about how you access and use the Service, including:',
        list: [
          "Your device's Internet Protocol (IP) address",
          'Browser type and version',
          'Pages of our Service you visit',
          'Time spent on those pages and other diagnostic data',
        ],
      },
      {
        title: 'Cookies and Tracking Data',
        content:
          'We use cookies and similar tracking technologies to track activity on our Service and retain certain information. You can control the use of cookies through your browser settings.',
      },
    ],
  },
  {
    id: 2,
    title: 'Use of Data',
    intro: 'We use the collected data for the following purposes:',
    list: [
      'To provide and maintain our Service',
      'To facilitate account access using the "Sign in with Google" option',
      'To notify you about changes or updates to our Service',
      'To provide customer support',
      'To improve the Service by analyzing usage patterns',
      'To personalize your experience on the platform',
    ],
  },
  {
    id: 3,
    title: 'Sharing of Data',
    content:
      'We do not share or sell your personal information to third parties. However, we may share your information with trusted third-party service providers who assist us in operating our Service, subject to strict confidentiality obligations.',
  },
  {
    id: 4,
    title: 'Security of Data',
    content:
      'We take reasonable measures to protect your personal information, but no method of transmission over the Internet is completely secure. Therefore, we cannot guarantee the absolute security of your data.',
  },
  {
    id: 5,
    title: 'Third-Party Services',
    content:
      'Our Service may include links to other websites or services, such as Google. These third-party services are governed by their own privacy policies, and we recommend reviewing their terms.',
  },
  {
    id: 6,
    title: 'Your Rights',
    content:
      'You have the right to access, update, or delete your personal information by contacting us at senthilkumar@mentorbridge.in. You can also revoke your Google sign-in permissions through your Google account settings.',
  },
  {
    id: 7,
    title: 'Changes to This Privacy Policy',
    content:
      'We may update this Privacy Policy periodically. We will notify you of any changes by posting the new Privacy Policy on this page.',
  },
] as const

export default function PrivacyPolicyPage() {
  return (
    <PageMain>
      <article className="relative z-10 mx-auto max-w-3xl px-6 py-12 sm:py-16 lg:px-8">
        <PageHeader
          title="Privacy Policy"
          description="Our policies regarding the collection, use, and disclosure of personal information."
          subtitle="Effective Date: October 11, 2024"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-10"
        >
          <p className="text-base leading-relaxed text-slate-600">
            MentorBridge (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            operates the website{' '}
            <a
              href="https://www.mentorbridge.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              https://www.mentorbridge.in
            </a>{' '}
            (the &quot;Service&quot;). This Privacy Policy informs you of our
            policies regarding the collection, use, and disclosure of personal
            information when you use our Service, including through the &quot;Sign
            in with Google&quot; feature.
          </p>
          <p className="text-base leading-relaxed text-slate-600">
            By using the Service, you agree to the collection and use of
            information as described in this Privacy Policy.
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
                {'intro' in section && (
                  <p className="mt-2 text-slate-600">{section.intro}</p>
                )}
                {'subsections' in section ? (
                  <div className="mt-4 space-y-6">
                    {section.subsections.map((sub) => (
                      <div key={sub.title}>
                        <h3 className="text-base font-medium text-slate-800">
                          {sub.title}
                        </h3>
                        {'intro' in sub && (
                          <p className="mt-1 text-slate-600">{sub.intro}</p>
                        )}
                        {'list' in sub && (
                          <ul className="mt-2 space-y-2 pl-4">
                            {sub.list.map((item, i) => (
                              <li
                                key={i}
                                className="relative text-slate-600 before:absolute before:-left-4 before:content-['•'] before:text-primary"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        {'content' in sub && (
                          <p className="mt-2 text-slate-600">{sub.content}</p>
                        )}
                        {'additional' in sub && (
                          <p className="mt-2 text-slate-600">{sub.additional}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {'content' in section && (
                      <p className="mt-2 text-slate-600">{section.content}</p>
                    )}
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
                  </>
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
              If you have any questions about this Privacy Policy, please contact
              us at:
            </p>
            <div className="mt-4 space-y-2">
              <a
                href="mailto:senthilkumar@mentorbridge.in"
                className="block font-medium text-primary hover:underline"
              >
                Email: senthilkumar@mentorbridge.in
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
