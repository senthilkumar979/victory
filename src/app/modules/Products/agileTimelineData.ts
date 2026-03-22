import {
  CheckCircle2,
  ClipboardList,
  Code2,
  FlaskConical,
  Rocket,
  Search,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface AgileTimelineItem {
  id: number
  title: string
  date: string
  content: string
  category: string
  icon: LucideIcon
  relatedIds: number[]
  status: 'completed' | 'in-progress' | 'pending'
  energy: number
}

export const agileTimelineData: AgileTimelineItem[] = [
  {
    id: 1,
    title: 'Discovery',
    date: 'Done',
    content:
      'We aligned on user problems, prioritized the backlog, and defined acceptance criteria so every sprint had a clear goal.',
    category: 'Research',
    icon: Search,
    relatedIds: [2],
    status: 'completed',
    energy: 100,
  },
  {
    id: 2,
    title: 'Sprint planning',
    date: 'Done',
    content:
      'Work was broken into time-boxed sprints with estimations, daily standups, and visible boards so progress stayed transparent.',
    category: 'Planning',
    icon: ClipboardList,
    relatedIds: [1, 3],
    status: 'completed',
    energy: 98,
  },
  {
    id: 3,
    title: 'Build & iterate',
    date: 'Done',
    content:
      'Features shipped in increments with reviews and feedback loops—each sprint built on the last until the products felt production-ready.',
    category: 'Delivery',
    icon: Code2,
    relatedIds: [2, 4],
    status: 'completed',
    energy: 100,
  },
  {
    id: 4,
    title: 'Test & harden',
    date: 'Done',
    content:
      'QA, integration checks, and fixes ran alongside development so quality was continuous, not a last-minute gate.',
    category: 'Quality',
    icon: FlaskConical,
    relatedIds: [3, 5],
    status: 'completed',
    energy: 96,
  },
  {
    id: 5,
    title: 'Release',
    date: 'Done',
    content:
      'We deployed with confidence: staged rollouts, monitoring, and clear communication when each product went live.',
    category: 'Ship',
    icon: Rocket,
    relatedIds: [4, 6],
    status: 'completed',
    energy: 100,
  },
  {
    id: 6,
    title: 'Retrospective',
    date: 'Done',
    content:
      'Every cycle ended with reflection—what worked, what to improve—so our agile practice itself kept getting better.',
    category: 'Learn',
    icon: CheckCircle2,
    relatedIds: [5],
    status: 'completed',
    energy: 94,
  },
]
