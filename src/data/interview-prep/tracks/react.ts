import { Zap } from 'lucide-react'
import type { InterviewTrack } from '../types'

export const reactTrack: InterviewTrack = {
  slug: 'react',
  title: 'React',
  description:
    'Components, hooks, state, effects, and performance—typical front-end interview topics.',
  accent: 'text-cyan-400',
  icon: Zap,
  gradient:
    'from-cyan-500/20 via-teal-500/10 to-transparent border border-cyan-500/30',
  questions: [
    {
      id: 'r-1',
      question: 'What is the virtual DOM and why does React use it?',
      answer:
        'A lightweight in-memory representation of the UI. React diffs the new virtual tree with the previous one and batches minimal DOM updates for performance and predictable rendering.',
      codeLanguage: 'tsx',
    },
    {
      id: 'r-2',
      question: 'Explain controlled vs uncontrolled components.',
      answer:
        'Controlled: form values live in React state and update via `onChange`. Uncontrolled: the DOM holds values; you read them with refs. Controlled gives a single source of truth and easier validation.',
      codeExample:
        'const [v, setV] = useState("");\n<input value={v} onChange={e => setV(e.target.value)} />',
      codeLanguage: 'tsx',
    },
    {
      id: 'r-3',
      question: 'What is the purpose of keys in lists?',
      answer:
        'Keys help React identify which items changed, were added, or removed across renders. Stable, unique keys preserve component state and avoid incorrect reuse—avoid array index as key when order changes.',
      codeLanguage: 'tsx',
    },
    {
      id: 'r-4',
      question: 'When does `useEffect` run?',
      answer:
        'After paint. With an empty dependency array, it runs once on mount. With dependencies, when those values change. The cleanup runs before the next effect and on unmount.',
      codeExample:
        'useEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id);\n}, []);',
      codeLanguage: 'tsx',
    },
    {
      id: 'r-5',
      question: 'Difference between `useMemo` and `useCallback`?',
      answer:
        '`useMemo` memoizes a computed value. `useCallback` memoizes a function reference. Both skip work until dependencies change—useful to prevent unnecessary child re-renders or expensive calculations.',
      codeLanguage: 'tsx',
    },
    {
      id: 'r-6',
      question: 'What are React Server Components?',
      answer:
        'Components that run on the server and send a serialized description to the client. They can fetch data directly and reduce client JS, but cannot use browser-only APIs or client hooks unless marked as client components.',
      codeLanguage: 'tsx',
    },
    {
      id: 'r-7',
      question: 'How does error handling work with Error Boundaries?',
      answer:
        'Class components (or framework helpers) implementing `componentDidCatch` / `getDerivedStateFromError` catch render errors in the subtree. They do not catch async errors inside event handlers unless rethrown into render state.',
      codeLanguage: 'tsx',
    },
    {
      id: 'r-8',
      question: 'What is lifting state up?',
      answer:
        'Moving shared state to the closest common ancestor so multiple children stay in sync via props and callbacks. Keeps data flow explicit and avoids duplicate sources of truth.',
      codeLanguage: 'tsx',
    },
    {
      id: 'r-9',
      question: 'Explain strict mode in development.',
      answer:
        'React Strict Mode double-invokes certain lifecycles/effects in development to surface side effects. It helps find unsafe patterns; behavior differs from production intentionally.',
      codeLanguage: 'tsx',
    },
    {
      id: 'r-10',
      question: 'What is the difference between state and props?',
      answer:
        'Props are inputs from parent to child (read-only from the child’s perspective). State is internal data managed by a component (or lifted). Changing state triggers re-renders of that subtree.',
      codeLanguage: 'tsx',
    },
    {
      id: 'r-11',
      question: 'How would you optimize a heavy list?',
      answer:
        'Virtualize long lists (windowing), memoize row components, stabilize callbacks with `useCallback`, split data fetching, and avoid inline object/array literals as props when they cause child re-renders.',
      codeLanguage: 'tsx',
    },
    {
      id: 'r-12',
      question: 'What is reconciliation?',
      answer:
        'React’s algorithm to diff trees and update the DOM. It assumes components of the same type update in place; keys help disambiguate list items for efficient updates.',
      codeLanguage: 'tsx',
    },
  ],
}
