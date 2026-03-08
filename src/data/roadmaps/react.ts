import type { RoadmapData } from './types'
import { ROADMAP_NODE_TYPE } from './types'

export const reactRoadmap: RoadmapData = {
  title: 'React Learning Roadmap',
  nodes: [
    {
      id: '1',
      type: ROADMAP_NODE_TYPE,
      position: { x: 0, y: 0 },
      data: {
        label: 'React Fundamentals',
        description:
          'Learn the core concepts of React: components, JSX, props, and state.',
        resources: [
          {
            title: 'React Docs - Quick Start',
            url: 'https://react.dev/learn',
          },
        ],
      },
    },
    {
      id: '2',
      type: ROADMAP_NODE_TYPE,
      position: { x: 0, y: 150 },
      data: {
        label: 'Hooks',
        description:
          'Master useState, useEffect, and custom hooks for stateful logic.',
        resources: [
          {
            title: 'React Hooks',
            url: 'https://react.dev/reference/react',
          },
        ],
      },
    },
    {
      id: '3',
      type: ROADMAP_NODE_TYPE,
      position: { x: 0, y: 300 },
      data: {
        label: 'Data Fetching',
        description:
          'Learn patterns for fetching data, loading states, and error handling.',
        resources: [
          {
            title: 'You Might Not Need an Effect',
            url: 'https://react.dev/learn/you-might-not-need-an-effect',
          },
        ],
      },
    },
    {
      id: '4',
      type: ROADMAP_NODE_TYPE,
      position: { x: 0, y: 450 },
      data: {
        label: 'Server Components & Next.js',
        description:
          'Explore React Server Components and the Next.js App Router.',
        resources: [
          {
            title: 'Next.js Documentation',
            url: 'https://nextjs.org/docs',
          },
        ],
      },
    },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
  ],
}
