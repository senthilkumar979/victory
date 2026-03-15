'use client'

import { motion } from 'framer-motion'

const CRITERIA = [
  {
    emoji: '🏆',
    number: '01',
    title: 'Exceptional Career Achievement',
    description:
      'Students who have secured positions at top-tier companies and demonstrated outstanding performance in their roles. These individuals have not only landed their dream jobs but have also made significant contributions to their organizations.',
  },
  {
    emoji: '⭐',
    number: '02',
    title: 'Consistent Excellence',
    description:
      'Recognition is given to students who have maintained high standards throughout their journey with MentorBridge, showing consistent growth, dedication to learning, and commitment to their professional development.',
  },
  {
    emoji: '👑',
    number: '03',
    title: 'Impact and Leadership',
    description:
      'Students who have gone beyond personal success to inspire others, contribute to the MentorBridge community, or demonstrate leadership qualities that set them apart as role models for future students.',
  },
  {
    emoji: '💫',
    number: '04',
    title: 'Mentorship Success Story',
    description:
      'Individuals whose success stories exemplify the power of mentorship and demonstrate how the guidance, resources, and support provided by MentorBridge have been instrumental in their career transformation.',
  },
] as const

export const HallOfFameCriteria = () => (
  <motion.section
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.5 }}
    className="mb-20"
  >
    <h2 className="mb-4 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
      How Students Are Inducted
    </h2>
    <p className="mb-12 text-center text-slate-600">
      Our Hall of Fame recognizes students who exemplify excellence across
      multiple dimensions of achievement
    </p>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
      {CRITERIA.map((item, index) => (
        <motion.article
          key={item.number}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-slate-200/50 transition-all duration-300 shadow-sm backdrop-blur transition-all hover:border-primary/80 hover:shadow-xl hover:shadow-primary/5 group-hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5 hover:border-primary"
        >
          <div className="absolute right-4 top-4 text-4xl opacity-60 transition-transform duration-300 group-hover:scale-110">
            {item.emoji}
          </div>
          <span className="mb-3 block text-3xl font-black text-primary/20 group-hover:text-primary transition-all duration-300">
            {item.number}
          </span>
          <h3 className="mb-2 text-lg font-semibold text-slate-600 group-hover:text-primary transition-all duration-300">
            {item.title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 group-hover:text-primary/80 transition-all duration-300">
            {item.description}
          </p>
        </motion.article>
      ))}
    </div>
  </motion.section>
)
