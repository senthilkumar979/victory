import type { RoadmapData } from './types'
import { ROADMAP_NODE_TYPE } from './types'

export const typescriptRoadmap: RoadmapData = {
  title: 'TypeScript Learning Roadmap',
  nodes: [
    {
      id: '1',
      type: ROADMAP_NODE_TYPE,
      position: { x: 0, y: 0 },
      data: {
        label: 'Introduction to TypeScript',
        description:
          'Learn the basics of TypeScript, its relationship with JavaScript, and why type safety matters.',
        resources: [
          {
            title: 'TypeScript Handbook',
            url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
          },
          {
            title: 'TypeScript for JavaScript Programmers',
            url: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html',
          },
        ],
      },
    },
    {
      id: '2',
      type: ROADMAP_NODE_TYPE,
      position: { x: 0, y: 150 },
      data: {
        label: 'Installation and Configuration',
        description:
          'Set up TypeScript in your project, configure tsconfig.json, and integrate with your build tool.',
        resources: [
          {
            title: 'TypeScript Setup',
            url: 'https://www.typescriptlang.org/download',
          },
          {
            title: 'tsconfig Reference',
            url: 'https://www.typescriptlang.org/tsconfig',
          },
        ],
      },
    },
    {
      id: '3',
      type: ROADMAP_NODE_TYPE,
      position: { x: 0, y: 300 },
      data: {
        label: 'TypeScript Types',
        description:
          'Master primitive types, unions, interfaces, type aliases, and advanced type constructs.',
        resources: [
          {
            title: 'Everyday Types',
            url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html',
          },
          {
            title: 'Interfaces and Types',
            url: 'https://www.typescriptlang.org/docs/handbook/2/objects.html',
          },
        ],
      },
    },
    {
      id: '4',
      type: ROADMAP_NODE_TYPE,
      position: { x: 0, y: 450 },
      data: {
        label: 'Type Inference',
        description:
          'Understand how TypeScript infers types automatically and when to add explicit annotations.',
        resources: [
          {
            title: 'Type Inference',
            url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-inference',
          },
          {
            title: 'Narrowing',
            url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html',
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
