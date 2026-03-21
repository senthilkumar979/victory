import type { ReactNode } from 'react'
import { MentorKey } from './Mentors'

export interface Mentor {
  id: MentorKey
  name: string
  role: string
  description: string
  image: string
  skills: string[]
}

export function renderHighlightedDescription(
  text: string,
  skills: string[],
): ReactNode {
  if (!skills.length) return text
  const pattern = new RegExp(
    `(${skills
      .map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|')})`,
    'gi',
  )
  const parts = text.split(pattern)
  return parts.map((part, i) => {
    const isHit = skills.some((h) => h.toLowerCase() === part.toLowerCase())
    if (isHit) {
      return (
        <span key={`${part}-${i}`} className="font-medium text-[#d53f8c]">
          {part}
        </span>
      )
    }
    return part
  })
}

export const mentors: Mentor[] = [
  {
    id: 'sk',
    name: 'Senthil Kumar Thangavel',
    role: 'Chief Coordinator',
    description:
      "Senthil's inspirations, the books he read, and the wisdom from his grandfathers have taught him a valuable lesson: what we give to the world with sincerity and dedication, returns to us in double measure. This understanding led him to mentorship, a support he lacked during his college years. He aspire to be the mentor he once needed, fostering collective growth in a world where material wealth often overshadows human values.",
    image:
      'https://wfkq0nguanh0273r.public.blob.vercel-storage.com/mentorbridge-pics/prasanna.jpg',
    skills: [
      'React',
      'Next.js',
      'TypeScript',
      'Node.js',
      'Java',
      'Spring Boot',
    ],
  },
  {
    id: 'dhileepan',
    name: 'Dhileepan Dhanapal',
    role: 'Coordinator',
    description:
      'Dhileepan has built a successful career spanning multiple countries and industries, working with leading organizations in both Europe and India. His expertise in Java, Spring, and cloud technologies, combined with his experience in mentoring, makes him an invaluable guide for students entering the IT industry.',
    image:
      'https://wfkq0nguanh0273r.public.blob.vercel-storage.com/dhileepan.jpg',
    skills: [
      'Java',
      'Spring Boot',
      'Microservices',
      'Cloud',
      'AWS',
      'Docker',
      'Kubernetes',
    ],
  },
]
