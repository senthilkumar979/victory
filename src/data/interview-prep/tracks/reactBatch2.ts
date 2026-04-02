import type { InterviewQuestion } from '../types'

/** Questions r-026–r-050 */
export const REACT_BATCH_2: InterviewQuestion[] = [
  {
    id: 'r-026',
    question: 'Explain custom hooks: rules, naming, and when to extract one.',
    answer:
      'Custom hooks are JavaScript functions whose names start with `use` and that may call other hooks internally. They let you reuse stateful logic across components without inheritance or render props. The rules of hooks apply: only call hooks at the top level of React functions, not inside loops, conditions, or nested functions, so hook call order stays stable across renders. Extract a custom hook when multiple components share the same combination of state, effects, and handlers—fetching data with loading and error states, window size listeners, or debounced values. Keep hooks focused; overly generic “god hooks” become hard to test and reason about. Custom hooks return values and callbacks; they do not render UI. Testing can target the hook with `@testing-library/react-hooks` patterns or by testing components that use it.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-027',
    question: 'What are render props and the “function as children” pattern?',
    answer:
      'A render prop is a pattern where a component receives a function as a prop and calls it with data or behavior, letting the parent customize rendering. `children` as a function is a variant: `<DataProvider>{(data) => <List items={data} />}</DataProvider>`. This inverts control: the parent decides how to render while the child encapsulates state or logic. It was popular before hooks for sharing cross-cutting behavior. Hooks largely replaced many render-prop use cases because they compose more ergonomically. Render props remain useful for libraries that need multiple customization points or coexist with class components. Downsides include wrapper hell and harder TypeScript inference compared to hooks. Interviewers may ask you to refactor a render-prop component to hooks to compare approaches.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-028',
    question: 'How do higher-order components (HOCs) work, and what replaced them?',
    answer:
      'An HOC is a function that takes a component and returns a new component with additional props or behavior—classic example: `connect` from Redux or `withRouter` from routers. They solved cross-cutting concerns like authentication guards or injecting data. Downsides include prop name collisions, indirection in React DevTools, and difficulty composing multiple HOCs cleanly. Hooks often replace HOCs by colocating behavior inside the component: `useAuth`, `useRouter`. HOCs are still valid for edge cases such as class components or third-party integration where you cannot use hooks. When discussing migration, emphasize explicitness: hooks make data flow easier to follow than wrapped component trees. Static typing sometimes requires generic gymnastics with HOCs that hooks simplify.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-029',
    question: 'What is `lazy` and `Suspense` for code splitting?',
    answer:
      '`React.lazy` wraps a dynamic `import()` so the component loads only when first rendered, splitting your bundle by route or feature. You must wrap lazy components in `<Suspense fallback={...}>` so React can show a placeholder while the chunk downloads. Errors during import can be caught by an error boundary. Lazy loading reduces initial JavaScript parse cost and speeds time-to-interactive for large apps. Caveats: the fallback UI flashes on slow networks; prefetching and route-based splitting strategy matter. Server components and frameworks may handle loading states differently. Interview depth: discuss how suspense boundaries interact with concurrent rendering and whether multiple nested Suspense boundaries compose. Also mention that `lazy` is for client components in mixed architectures.',
    codeExample:
      'const Chart = lazy(() => import("./Chart"));\n<Suspense fallback={<Spinner />}><Chart /></Suspense>',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-030',
    question: 'Describe Concurrent React and `startTransition` at a high level.',
    answer:
      'Concurrent React allows React to interrupt, pause, or abandon rendering work to keep the UI responsive. Urgent updates—typing in a field—can be prioritized over heavy transitions—filtering a large list. `startTransition` marks state updates inside it as non-urgent: React may keep showing the previous UI until the transition finishes, optionally showing `isPending` from `useTransition` for feedback. This improves perceived performance without blocking the main thread on large renders. It pairs with Suspense for data and lazy components. Understanding concurrency means accepting that render may run multiple times before commit; components must stay pure. Interviewers may ask about `useDeferredValue` to defer updating a value derived from props. Mention that enabling concurrent features requires React 18+ root and compatible libraries.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-031',
    question: 'What is `useDeferredValue` and when would you use it?',
    answer:
      '`useDeferredValue` takes a value and returns a deferred version that lags behind when updates are urgent—similar in spirit to debouncing but integrated with React’s scheduling. Use it when a fast-changing input drives expensive child rendering: the deferred prop updates after urgent work completes, keeping typing smooth while the heavy subtree catches up. It works well with memoized children that receive the deferred value as a prop. Unlike manual debouncing, it respects React’s priorities and concurrent features. It is not a replacement for server-side pagination or algorithmic optimization of the expensive render itself; those may still be required. Pair with `useMemo` on derived lists when appropriate. Discuss trade-offs: showing slightly stale results briefly versus blocking the main thread.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-032',
    question: 'Explain `useId` and why it matters for accessibility.',
    answer:
      '`useId` generates stable, unique IDs across server and client render, fixing hydration mismatches that occur when random or incrementing IDs differ between SSR and CSR. Use it to wire `aria-labelledby`, `aria-describedby`, `id`/`htmlFor` relationships between labels and inputs, or SVG clip paths. The generated string is not meant for keys in lists—use business ids for that. Prior to `useId`, developers used `useMemo` with counters or libraries, which often broke SSR. Correct labeling improves screen reader experience and is required for WCAG compliance. In interviews, connect `useId` to form accessibility patterns and mention that IDs must be unique per document, which `useId` handles with a colon-separated scheme stable per hook call site.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-033',
    question: 'What are React Server Components (RSC) conceptually?',
    answer:
      'Server Components execute on the server and send a serialized representation to the client rather than shipping their full JavaScript implementation. They can read databases and filesystems directly without exposing secrets to the browser, and they reduce client bundle size by keeping heavy logic server-side. They cannot use hooks like useState or browser APIs; interactivity moves to Client Components marked with the use client directive at the top of the file. Composition allows passing server children to client wrappers. Frameworks like Next.js App Router integrate RSC with routing, caching, and streaming HTML. Trade-offs include more complex mental models, serialization constraints on props, and refresh semantics. Interview answer should separate RSC from SSR alone: SSR can still ship large client bundles, while RSC aims to shift where code runs by default.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-034',
    question: 'How do you think about colocating state in large React applications?',
    answer:
      'Colocation means keeping state as close as possible to where it is used to minimize coupling and unnecessary re-renders. Local UI state—open/closed toggles, field focus—should live in the component that owns the interaction until another sibling must react, then lift minimally. Feature-level state can live in a module or hook scoped to that route. Global stores should hold truly cross-cutting data: auth, cart, theme—not every API response. Over-centralization in global Redux stores often causes boilerplate and broad updates; modern patterns use React Query for server cache and context or Zustand for client UI state. Interviewers look for pragmatic layering: derive what you can, store minimal sources of truth, and avoid prop drilling through context when a small lift suffices. Document boundaries so teams do not fight over where new state belongs.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-035',
    question: 'What is prop types validation, and what replaced it in TypeScript projects?',
    answer:
      'PropTypes was a runtime type-checking system for React props in development, catching mismatched types before they cause subtle bugs. It remains useful in JavaScript codebases. In TypeScript projects, static types on props and components replace most PropTypes needs with compile-time guarantees and better IDE support. Runtime validation may still be added at boundaries—API responses—with libraries like Zod. Interview answer: TypeScript does not validate at runtime; malformed external data still needs validation. Some teams keep PropTypes for public component libraries consumed from JS. Mention that defaultProps on function components have evolved with TypeScript—default parameters often replace defaultProps for function components in modern React docs.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-036',
    question: 'How would you approach performance profiling a slow React page?',
    answer:
      'Start by reproducing the issue with React DevTools Profiler to record commits, flamegraphs, and which components rendered and why. Look for unnecessary renders, expensive commit times, and cascading updates. Combine with browser Performance tab to see long tasks, layout thrashing, and scripting cost. Common fixes: memoize pure children, stabilize callbacks, split heavy work with `startTransition`, virtualize lists, code-split routes, and move expensive calculations off the hot path or to workers. Avoid premature optimization: measure first. For network-bound slowness, optimize data fetching, caching, and payload size rather than React micro-optimizations. Mention logging render counts in development and using `why-did-you-render` style tools cautiously. Senior candidates discuss interaction between React rendering and browser paint, and when to fix backend latency instead.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-037',
    question: 'Explain list virtualization (windowing) and when it is needed.',
    answer:
      'Virtualization renders only visible rows plus a small overscan buffer instead of thousands of DOM nodes for long lists. Libraries like `react-window` or `react-virtualized` measure container size and scroll position to compute which items to mount. This keeps memory and layout cost bounded as data grows. It is needed when lists exceed hundreds or thousands of rows and scrolling becomes janky. Trade-offs: dynamic row heights complicate measurement; accessibility for keyboard navigation through the full list must be preserved; search and selection patterns need careful integration. Virtualization pairs with stable row keys and memoized row components. Interview caveat: if lists are small, virtualization adds complexity without benefit—profile first.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-038',
    question: 'What causes unnecessary re-renders, and how do you prevent them?',
    answer:
      'Unnecessary re-renders happen when a component’s output would be identical but React still invokes the function because a parent re-rendered or props changed by reference. Inline object or array literals, inline arrow functions, and unstable context values are frequent culprits. Prevention: colocate state, split components so fewer nodes update, use `React.memo` on expensive pure children with stable props, `useMemo`/`useCallback` where profiling shows benefit, and fix context providers to memoize values. Avoid blindly wrapping everything in `memo`—shallow prop compares still run and can cost more than the child render. Also consider that sometimes the real fix is algorithmic—O(n²) work in render—not React configuration. Always validate with profiling, not superstition.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-039',
    question: 'Describe the difference between shallow and deep equality in React’s `memo`.',
    answer:
      '`React.memo` defaults to shallow comparison of props: for each key, it uses `Object.is` on the values. Nested objects that mutate in place without changing reference may incorrectly appear equal or unequal depending on pattern; new object references each render fail shallow equality. Deep equality compares nested structures but is expensive and rarely built into `memo` by default—you supply a custom compare function if truly needed, often for specific props only. In practice, flatten props, derive memoized objects with `useMemo`, or pass primitive props when possible. Interviewers use this question to probe understanding of referential transparency and JavaScript equality. Mention that `Object.is` treats `NaN` as equal to `NaN` and distinguishes `+0` from `-0` unlike `===`.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-040',
    question: 'How do you handle forms with many fields efficiently in React?',
    answer:
      'For many fields, avoid a separate `useState` per input unless fields are independent and few—otherwise updates become verbose. Patterns include a single state object with controlled inputs, libraries like React Hook Form that register uncontrolled inputs and minimize re-renders, or Formik for schema-driven flows. Validation can be inline, schema-based with Yup or Zod, or server-returned. Performance: batch updates, debounce validation on blur versus every keystroke depending on UX, and split sections into child components with memoization when profiling shows hotspots. Accessibility: associate labels, describe errors, and manage focus on validation failure. Mention that uncontrolled approaches can scale better for huge forms while controlled gives maximum control for dynamic dependent fields.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-041',
    question: 'What is reconciliation’s treatment of component type at the same tree position?',
    answer:
      'When React compares two trees, it looks at element types at each position. If the type changes—from `Foo` to `Bar` or from `div` to `span`—React unmounts the entire subtree under that position and constructs a new one. State below that point is destroyed unless preserved via lifting or keys that move subtrees intentionally. If the type stays the same, React updates props on the existing instance and reconciles children. This is why swapping components matters more than prop changes for resetting state. Interview follow-ups: using `key` on a component to force remount when only props change but you need fresh state, and how portals or fragments affect tree shape without adding DOM nodes.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-042',
    question: 'Explain controlled components with async validation and race conditions.',
    answer:
      'When validation depends on async checks—username availability, duplicate detection—multiple requests can complete out of order if the user types quickly. The UI might show an error for an old query after a newer value is valid. Fix by associating each response with a request id or aborting in-flight requests with `AbortController`, or by tracking the latest input value and ignoring stale results. Debouncing reduces request volume but does not alone fix ordering. For React specifically, store the pending validation generation in a ref or state and compare before applying results. Mention optimistic UI carefully: show pending states and rollback on failure. This question tests real-world form engineering beyond happy paths.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-043',
    question: 'What is the children prop, and what advanced patterns use it?',
    answer:
      '`children` is a special prop representing nested JSX content between opening and closing tags. It can be nodes, arrays, functions, or portals depending on what you pass. Advanced patterns include slots via multiple props (`header`, `footer`), compound components that clone children to inject props, or context providers that wrap arbitrary trees. Be careful with `children` in `memo` comparisons—if children are inline JSX, they are new elements each render and may break memoization of parents unless structured intentionally. For flexible APIs, render props sometimes beat `children` functions when you need multiple parameters. Interviewers may ask how to enforce single-child or typed children—`React.Children` utilities or TypeScript generics for props.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-044',
    question: 'How does React interact with Web Workers or off-main-thread work?',
    answer:
      'React itself runs on the main thread; heavy synchronous CPU work blocks painting and interaction. Web Workers run JavaScript on separate threads without DOM access, communicating via message passing. Typical integration: a worker performs parsing, compression, or sorting; results post back to the main thread where React state updates. You must serialize data across the boundary—structured cloning costs—and avoid flooding the main thread with tiny messages. Libraries like Comlink simplify RPC-style calls. React does not automatically offload work; you architect it. Concurrent features reduce how blocking renders feel but do not replace workers for CPU-bound tasks. Mention SharedArrayBuffer only in contexts where cross-origin isolation is configured.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-045',
    question: 'Describe testing strategies for React components.',
    answer:
      'Prefer testing behavior users see—`@testing-library/react` encourages querying by role, label, and text rather than implementation details. Unit-test individual components with mocked dependencies; integration-test feature flows with real router and provider wrappers where valuable. Mock network with MSW for realistic async behavior. Snapshot tests are brittle for UI; use sparingly for static output. Hook logic can be tested via small test components or dedicated hook utilities. E2E tests with Playwright or Cypress cover cross-browser flows and complement unit tests. Balance speed: many fast unit tests, fewer E2E. Mention accessibility queries as a bonus—they enforce usable markup. For Redux or context, wrap tests with providers or mock modules judiciously to avoid testing the library itself.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-046',
    question: 'What is the role of `key` when you force remounting a component?',
    answer:
      'Changing `key` on a component tells React that the identity of that element changed even if the type is the same, so React will unmount the old instance and mount a fresh one with reset state and effects. Use this when navigating between records where you want a clean slate—wizard steps, user profiles—or when correcting bugs from stale internal state. Overuse forces unnecessary teardown and performance cost. Prefer lifting state or resetting via props when you can express the dependency explicitly. Interview edge case: animating exit before unmount may require libraries like `framer-motion` with `AnimatePresence` because remounting is immediate. Pair key changes with Suspense boundaries carefully to avoid flicker.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-047',
    question: 'Explain hydration in React apps with SSR.',
    answer:
      'Hydration is the process where React attaches event listeners and internal fiber state to HTML that was already rendered on the server so the page becomes interactive. Mismatches between server HTML and the first client render cause warnings and potentially expensive DOM corrections. Causes include non-deterministic values (`Date.now`, `Math.random`), locale differences, browser-only APIs during render, or incorrect `useId` patterns. Fixes: defer non-deterministic content to effects, match locale on server and client, or suppress visible mismatch with `suppressHydrationWarning` on specific text nodes when intentional. Frameworks may stream HTML and hydrate progressively. Understanding hydration explains why some code must be client-only and why SSR is not free complexity.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-048',
    question: 'What are refs vs state for storing values that update frequently?',
    answer:
      'State triggers re-renders when updated; refs mutate without rendering. For values that change every frame—animation values, scroll position used imperatively—refs avoid thrashing React’s render cycle. For anything that must appear in the UI, state is appropriate because refs do not notify React to paint. Anti-pattern: storing display data in refs and forcing updates manually with `forceUpdate` patterns. Bridge pattern: keep animation position in ref for performance, sync to state on animation end for final committed value. Interviewers probe whether you understand React as a function of state versus escape hatches for performance. Mention that concurrent mode assumes render may run multiple times; refs mutated during render are unsafe unless idempotent carefully.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-049',
    question: 'How do you implement accessible modals in React?',
    answer:
      'Use semantic markup (`role="dialog"`, `aria-modal="true"`), label with `aria-labelledby` or `aria-label`, trap focus inside the modal while open, and restore focus to the triggering element on close. Close on Escape and optionally on backdrop click if that matches UX expectations—document the choice for accessibility audits. Lock background scroll and ensure the dialog renders in a portal at the end of the body to avoid `z-index` and overflow clipping issues. Announce dialog open to screen readers with live regions if needed. Libraries like Radix Dialog encode many patterns; if building manually, coordinate `useEffect` for listeners and cleanup. Test with keyboard-only navigation and VoiceOver or NVDA.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-050',
    question: 'What is the difference between `useReducer` and multiple `useState` calls?',
    answer:
      '`useReducer` centralizes state transitions in a reducer function with explicit action types, which scales well when multiple values update together or next state depends on complex logic. It mirrors Redux locally without external libraries and makes impossible states harder to represent if designed well. Multiple `useState` hooks are simpler when state slices are independent and updates are straightforward. Reducers shine for multi-step flows, undo/redo, and when you want to test transition logic in isolation. The downside is boilerplate for small features. Interview follow-up: lazy initialization `useReducer(reducer, initArg, initFn)` for expensive initial state. Also compare to context: reducer + context can replace prop drilling for feature-local complex state without global stores.',
    codeExample:
      'function reducer(state: State, action: Action): State { /* ... */ }',
    codeLanguage: 'tsx',
  },
]
