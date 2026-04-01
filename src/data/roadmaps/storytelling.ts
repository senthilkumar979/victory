import type { RoadmapData } from './types'

export const storytellingRoadmap: RoadmapData = {
  title: 'Storytelling',
  description:
    'Craft compelling narratives, engage audiences, and drive action.',
  nodes: [
    {
      id: 'st-why-stories',
      title: 'Why stories work',
      description:
        'Stories are how humans remember, trust, and act. Learn how narrative activates emotion, builds empathy, and makes abstract ideas concrete so your message sticks long after the facts fade.',
      resources: [
        {
          title: 'Andrew Stanton: The clues to a great story (TED)',
          url: 'https://www.ted.com/talks/andrew_stanton_the_clues_to_a_great_story',
          type: 'video',
        },
        {
          title: 'Why your brain loves good storytelling (Harvard Business Review)',
          url: 'https://hbr.org/2014/10/why-your-brain-loves-good-storytelling',
          type: 'article',
        },
        {
          title: 'Your brain on story (Greater Good Science Center)',
          url: 'https://greatergood.berkeley.edu/article/item/how_stories_change_brain',
          type: 'article',
        },
      ],
    },
    {
      id: 'st-audience',
      title: 'Know your audience',
      description:
        'Define who you are speaking to, what they care about, and what would count as success for them. Use empathy, context, and (when possible) research so every choice in your story serves a real listener, reader, or viewer.',
      resources: [
        {
          title: 'Empathy mapping — Nielsen Norman Group',
          url: 'https://www.nngroup.com/articles/empathy-mapping/',
          type: 'article',
        },
        {
          title: 'Coursera — search storytelling courses',
          url: 'https://www.coursera.org/courses?query=storytelling',
          type: 'course',
        },
      ],
    },
    {
      id: 'st-message',
      title: 'Clarify your message',
      description:
        'Distill one central idea and the action you want people to take. If you cannot say it in a sentence, the story will sprawl. A sharp message keeps structure, tone, and examples aligned.',
      resources: [
        {
          title: 'Think with Google — brand storytelling hub',
          url: 'https://www.thinkwithgoogle.com/intl/en-gb/future-of-marketing/creativity/',
          type: 'article',
        },
        {
          title: 'Made to Stick (Heath brothers) — overview',
          url: 'https://heathbrothers.com/books/made-to-stick/',
          type: 'book',
        },
      ],
    },
    {
      id: 'st-structure',
      title: 'Structure & arc',
      description:
        'Shape tension and release with a clear beginning, middle, and end. Use proven arcs—three-act, hero’s journey, or problem–solution—to pace reveals and keep attention without confusion.',
      resources: [
        {
          title: 'Three-act structure — explanation',
          url: 'https://en.wikipedia.org/wiki/Three-act_structure',
          type: 'documentation',
        },
        {
          title: 'The Hero’s Journey — Campbell foundation',
          url: 'https://www.jcf.org/learn/',
          type: 'article',
        },
      ],
    },
    {
      id: 'st-character-conflict',
      title: 'Character & conflict',
      description:
        'Give the audience someone to root for and something meaningful at stake. Conflict—internal, interpersonal, or systemic—is what turns information into drama and keeps people leaning in.',
      resources: [
        {
          title: 'Story (McKee) — official site',
          url: 'https://mckeestory.com/',
          type: 'book',
        },
        {
          title: 'Conflict in narrative — LitCharts',
          url: 'https://www.litcharts.com/literary-devices-and-terms/conflict',
          type: 'article',
        },
      ],
    },
    {
      id: 'st-hooks',
      title: 'Hooks & openings',
      description:
        'Win attention in the first seconds: a vivid scene, a bold claim, a question, or a pattern interrupt. Your opening promises the journey—make it specific and emotionally loaded.',
      resources: [
        {
          title: 'How to open a talk (TED blog)',
          url: 'https://blog.ted.com/',
          type: 'article',
        },
        {
          title: 'How to write a strong hook — MasterClass',
          url: 'https://www.masterclass.com/articles/how-to-write-a-hook',
          type: 'article',
        },
      ],
    },
    {
      id: 'st-voice',
      title: 'Voice & language',
      description:
        'Choose tone, rhythm, and word choice that match your audience and brand. Clarity beats cleverness; concrete beats abstract. Edit ruthlessly so every line earns its place.',
      resources: [
        {
          title: 'Plain language guidelines — US plainlanguage.gov',
          url: 'https://www.plainlanguage.gov/',
          type: 'documentation',
        },
        {
          title: 'On Writing Well (Zinsser)',
          url: 'https://www.harpercollins.com/products/on-writing-well-william-zinsser',
          type: 'book',
        },
      ],
    },
    {
      id: 'st-visual',
      title: 'Visual & media',
      description:
        'Support the story with images, motion, and layout that reinforce emotion and hierarchy—not decoration. One strong visual idea per beat; let whitespace and pacing breathe.',
      resources: [
        {
          title: 'Presentation Zen — visual storytelling',
          url: 'https://www.presentationzen.com/',
          type: 'article',
        },
        {
          title: 'Google Fonts — pairing & readability',
          url: 'https://fonts.google.com/knowledge',
          type: 'documentation',
        },
      ],
    },
    {
      id: 'st-delivery',
      title: 'Delivery & presence',
      description:
        'Rehearse for the room, not the page. Control pace, pauses, and energy; adapt to feedback in real time. Authenticity and preparation beat performance tricks.',
      resources: [
        {
          title: 'Toastmasters — public speaking path',
          url: 'https://www.toastmasters.org/',
          type: 'course',
        },
        {
          title: 'Matt Abrahams — Stanford GSB podcasts on speaking',
          url: 'https://www.gsb.stanford.edu/experience/news-history/podcasts/think-fast-talk-smart',
          type: 'article',
        },
      ],
    },
    {
      id: 'st-measure',
      title: 'Measure & iterate',
      description:
        'Define what “worked” means—retention, conversion, sentiment, or behavior. Gather qualitative and quantitative signals, then revise the story where it weakens. Great narratives are refined, not born.',
      resources: [
        {
          title: 'A/B testing narrative (marketing) — overview',
          url: 'https://optimize.google.com/optimize/resources/',
          type: 'article',
        },
        {
          title: 'Lean Analytics — iterate on what matters',
          url: 'https://leananalyticsbook.com/',
          type: 'book',
        },
      ],
    },
  ],
}
