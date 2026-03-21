export interface VerticalStepItem {
  id: string
  title: string
  description: string
  icon: 'layers' | 'target' | 'briefcase' | 'cpu'
}

export interface HorizontalPillarItem {
  id: string
  title: string
  description: string
}

export const verticalSteps: VerticalStepItem[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    description: 'Core systems thinking and durable fundamentals.',
    icon: 'layers',
  },
  {
    id: 'specialization',
    title: 'Specialization',
    description: 'Focused depth in a chosen technical domain.',
    icon: 'target',
  },
  {
    id: 'projects',
    title: 'Real-World Projects',
    description: 'Ship outcomes that mirror industry expectations.',
    icon: 'briefcase',
  },
  {
    id: 'simulation',
    title: 'Industry Simulation',
    description: 'Practice under realistic constraints and feedback.',
    icon: 'cpu',
  },
]

export const horizontalPillars: HorizontalPillarItem[] = [
  {
    id: 'career',
    title: 'Career Strategy',
    description: 'Navigate roles, growth arcs, and long-term direction.',
  },
  {
    id: 'interview',
    title: 'Interview Excellence',
    description: 'Communicate proof of skill with clarity and confidence.',
  },
  {
    id: 'financial',
    title: 'Financial Intelligence',
    description: 'Understand value, compensation, and trade-offs.',
  },
  {
    id: 'communication',
    title: 'Communication',
    description: 'Write, present, and align stakeholders effectively.',
  },
  {
    id: 'problem',
    title: 'Problem Solving',
    description: 'Frame ambiguity, test hypotheses, and decide well.',
  },
  {
    id: 'storytelling',
    title: 'Storytelling',
    description: 'Craft compelling narratives, engage audiences, and drive action.',
  },
  {
    id: 'execution',
    title: 'Execution Excellence',
    description: 'Break down tasks, manage time effectively, and consistently meet expectations.',
  },
  {
    id: 'team',
    title: 'Team Dynamics',
    description: 'Work effectively within teams, navigate conflicts, and contribute to collective success.',
  },
  {
    id: 'agility',
    title: 'Learning Agility',
    description: 'Quickly learn new tools, adapt to change, and handle uncertainty with confidence.',
  },
]
