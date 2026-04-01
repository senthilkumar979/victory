import type { RoadmapData } from './types'

export const designThinkingRoadmap: RoadmapData = {
  title: 'Design Thinking',
  description:
    'Human-centered innovation: empathize, define, ideate, prototype, and test to solve the right problems well.',
  nodes: [
    {
      id: 'dt-intro',
      title: 'Design Thinking',
      description:
        'A repeatable mindset and process for understanding people, reframing problems, exploring ideas, and learning fast through prototypes. It balances creativity with evidence so teams ship solutions that matter.',
      resources: [
        {
          title: 'IDEO — Design Thinking overview',
          url: 'https://designthinking.ideo.com/',
          type: 'documentation',
        },
        {
          title: 'Nielsen Norman Group — design thinking in UX',
          url: 'https://www.nngroup.com/articles/design-thinking/',
          type: 'article',
        },
      ],
    },
    {
      id: 'dt-empathize',
      title: 'Empathize',
      description:
        'Set aside assumptions and learn from real people through observation, interviews, and context. The goal is deep understanding of needs, pain points, and motivations before you define a solution.',
      resources: [
        {
          title: 'IDEO Field Guide to Human-Centered Design',
          url: 'https://www.ideo.com/post/design-kit',
          type: 'documentation',
        },
        {
          title: 'd.school — Empathize resources',
          url: 'https://dschool.stanford.edu/resources',
          type: 'course',
        },
      ],
    },
    {
      id: 'dt-define',
      title: 'Define',
      description:
        'Synthesize research into insights, a clear problem statement, and a point of view. A sharp “define” phase aligns the team on what problem is worth solving and for whom.',
      resources: [
        {
          title: 'Problem statements — NN/g',
          url: 'https://www.nngroup.com/articles/problem-statements/',
          type: 'article',
        },
        {
          title: 'How Might We questions — IDEO U',
          url: 'https://www.ideou.com/blogs/inspiration/what-is-a-how-might-we-statement',
          type: 'article',
        },
      ],
    },
    {
      id: 'dt-ideate',
      title: 'Ideate',
      description:
        'Generate many possible solutions before you commit. Diverge widely, then use criteria to narrow—volume first, judgment later—so you do not anchor on the first obvious idea.',
      resources: [
        {
          title: 'Ideation methods — Interaction Design Foundation',
          url: 'https://www.interaction-design.org/literature/topics/ideation',
          type: 'article',
        },
        {
          title: 'Crazy 8s — Google Design Sprint',
          url: 'https://designsprintkit.withgoogle.com/methodology/phase3-sketch/crazy-8s',
          type: 'documentation',
        },
      ],
    },
    {
      id: 'dt-prototype',
      title: 'Prototype',
      description:
        'Make ideas tangible quickly—sketches, wireframes, role-plays, or clickable mocks. Prototypes are questions: the cheapest artifact that lets you learn what works and what does not.',
      resources: [
        {
          title: 'Prototyping 101 — NN/g',
          url: 'https://www.nngroup.com/articles/prototyping-101/',
          type: 'article',
        },
        {
          title: 'Figma — prototyping basics',
          url: 'https://help.figma.com/hc/en-us/categories/360002124774-Prototyping',
          type: 'documentation',
        },
      ],
    },
    {
      id: 'dt-test',
      title: 'Test & learn',
      description:
        'Put prototypes in front of users, watch behavior, and capture feedback. Use what you learn to refine the problem framing or pivot—design thinking is iterative, not linear.',
      resources: [
        {
          title: 'Usability testing — NN/g',
          url: 'https://www.nngroup.com/articles/usability-testing-101/',
          type: 'article',
        },
        {
          title: 'Test early, test often — IDEO',
          url: 'https://www.ideo.com/journal/8-tips-for-better-user-testing',
          type: 'article',
        },
      ],
    },
    {
      id: 'dt-user-research',
      title: 'User research',
      description:
        'Structured discovery: interviews, contextual inquiry, diary studies, and analogous inspiration. Focus on stories and behavior, not feature wishlists.',
      resources: [
        {
          title: 'User interviews — NN/g',
          url: 'https://www.nngroup.com/articles/user-interviews/',
          type: 'article',
        },{
          title: 'User Research Methods — NN/g',
          url: 'https://www.nngroup.com/articles/guide-ux-research-methods/',
          type: 'article',
        },
        {
          title: 'Personas',
          url: 'https://ixdf.org/literature/article/personas-why-and-how-you-should-use-them',
          type: 'article',
        },
        {
          title: 'Just Enough Research — Erika Hall (book overview)',
          url: 'https://www.abookapart.com/products/just-enough-research',
          type: 'book',
        },
      ],
    },
    {
      id: 'dt-empathy-map',
      title: 'Empathy maps',
      description:
        'A shared snapshot of what users say, think, feel, and do. It helps teams align on human context before jumping to solutions.',
      resources: [
        {
          title: 'Empathy map — NN/g',
          url: 'https://www.nngroup.com/articles/empathy-mapping/',
          type: 'article',
        },
        {
          title: 'Empathy map canvas — d.school',
          url: 'https://dschool-old.stanford.edu/sandbox/groups/k12/wiki/4db62/',
          type: 'documentation',
        },
        {
          title: 'Empathy Map',
          url: 'https://www.youtube.com/watch?v=QwF9a56WFWA',
          type: 'video',
        }
      ],
    },
    {
      id: 'dt-problem-frame',
      title: 'Problem framing',
      description:
        'Turn messy observations into a crisp challenge. Good frames are specific enough to guide ideation and broad enough to allow multiple solution paths.',
      resources: [
        {
          title: 'Frame the problem before you solve it — HBR',
          url: 'https://hbr.org/2017/01/are-you-solving-the-right-problems',
          type: 'article',
        },
      ],
    },
    {
      id: 'dt-pov-hmw',
      title: 'POV & HMW',
      description:
        'A Point Of View names a user, need, and insight; “How Might We” turns it into generative prompts that open solution space instead of closing it.',
      resources: [
        {
          title: 'POV & HMW — d.school',
          url: 'https://web.stanford.edu/~mshanks/MichaelShanks/files/509/Pointofviewmadlib.html',
          type: 'documentation',
        },
      ],
    },
    {
      id: 'dt-diverge',
      title: 'Divergent ideation',
      description:
        'Defer judgment and explore many directions: brainstorming, sketching, SCAMPER, and “yes, and” facilitation. Quantity unlocks unexpected combinations.',
      resources: [
        {
          title: 'Brainstorming rules — IDEO',
          url: 'https://www.ideo.com/journal/7-simple-rules-of-brainstorming',
          type: 'article',
        },
      ],
    },
    {
      id: 'dt-converge',
      title: 'Converge & select',
      description:
        'Cluster ideas, dot-vote, and define selection criteria (impact, feasibility, risk). Convergence is how teams move from walls of stickies to a testable set.',
      resources: [
        {
          title: 'Dot voting — NN/g',
          url: 'https://www.nngroup.com/articles/dot-voting/',
          type: 'article',
        },
      ],
    },
    {
      id: 'dt-lowfi',
      title: 'Low-fidelity builds',
      description:
        'Paper, Keynote, or rough HTML—low cost, fast iteration. Match fidelity to the question: sometimes a storyboard beats a screen.',
      resources: [
        {
          title: 'Paper prototyping — NN/g',
          url: 'https://www.nngroup.com/articles/paper-prototyping-as-a-usability-testing-technique/',
          type: 'article',
        },
      ],
    },
    {
      id: 'dt-feedback',
      title: 'Feedback loops',
      description:
        'Short cycles of show, observe, and adjust. Pair qualitative insight with lightweight metrics so you know what to try next.',
      resources: [
        {
          title: 'Build-Measure-Learn (Lean Startup overview)',
          url: 'https://theleanstartup.com/principles',
          type: 'article',
        },
      ],
    },
  ],
}
