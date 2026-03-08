import type { RoadmapData } from './types'
import { ROADMAP_NODE_TYPE } from './types'

export const nodeRoadmap: RoadmapData = {
  title: 'Node.js Learning Roadmap',
  nodes: [
    {
      id: '1',
      type: ROADMAP_NODE_TYPE,
      position: { x: 0, y: 0 },
      data: {
        label: 'Node.js Basics',
        description:
          'Understand the Node.js runtime, event loop, and module system.',
        resources: [
          {
            title: 'Node.js Guides',
            url: 'https://nodejs.org/docs/latest/api/',
          },
        ],
      },
    },
    {
      id: '2',
      type: ROADMAP_NODE_TYPE,
      position: { x: 0, y: 150 },
      data: {
        label: 'NPM & Packages',
        description:
          'Learn package management, creating packages, and using the npm registry.',
        resources: [
          {
            title: 'npm Documentation',
            url: 'https://docs.npmjs.com/',
          },
        ],
      },
    },
    {
      id: '3',
      type: ROADMAP_NODE_TYPE,
      position: { x: 0, y: 300 },
      data: {
        label: 'Async Patterns',
        description:
          'Master callbacks, Promises, async/await, and error handling.',
        resources: [
          {
            title: 'Promises - MDN',
            url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
          },
        ],
      },
    },
    {
      id: '4',
      type: ROADMAP_NODE_TYPE,
      position: { x: 0, y: 450 },
      data: {
        label: 'APIs & Frameworks',
        description:
          'Build REST and GraphQL APIs with Express or Fastify.',
        resources: [
          {
            title: 'Express.js',
            url: 'https://expressjs.com/',
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
