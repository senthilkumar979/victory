import type { InterviewQuestion } from '../types'

/** Questions r-076–r-100 */
export const REACT_BATCH_4: InterviewQuestion[] = [
  {
    id: 'r-076',
    question: 'How would you debug “maximum update depth exceeded” in React?',
    answer:
      'This error means React detected an infinite loop of state updates—typically `setState` called during render, or an effect that triggers state without stable dependencies, causing immediate re-run. Another pattern is `useEffect(() => setX(x+1), [x])` without a base case. Fix by moving updates to event handlers, guarding effects with conditions, or using functional updates correctly. Profiling with React DevTools and console logs helps locate the offending component. Sometimes a child component calls a parent setter in render by mistake. In controlled component patterns, ensure `onChange` does not synchronously set state that changes the controlled value in a way that retriggers `onChange` infinitely. Review Strict Mode double effects only if you suspect effect loops—usually the root cause is logic, not Strict Mode in production.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-077',
    question: 'Explain the value of compound components in React UI libraries.',
    answer:
      'Compound components split a complex widget—tabs, accordion, select—into multiple related components that share implicit state via context rather than one giant props object. `<Tabs><TabList/><TabPanels/></Tabs>` reads semantically and allows flexible ordering within constraints. Consumers customize slots without exposing every knob as a prop on the root. Internally, the parent establishes context; children register or read state. This pattern improves API ergonomics compared to prop drilling ten booleans. Trade-offs: implicit contracts require documentation; tree-shaking and static analysis are slightly harder than flat props. Radix UI and Reach UI popularized this pattern. Interview: contrast with render props and hooks-only APIs for headless components.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-078',
    question: 'What is the “callback ref” pattern, and when is it preferable to `useRef`?',
    answer:
      'A ref callback is a function React calls with the DOM node when it mounts and `null` when it unmounts. Use it when you need to measure the node whenever it appears, integrate with non-React libraries that attach on mount, or run logic when the ref target changes between renders. `useRef` holds a mutable box; callback refs run side effects tied to attachment lifecycle. Callback refs can be merged with `useCallback` stability concerns—inline functions recreate each render and may cause unnecessary detach/attach; stabilize with `useCallback` when needed. Interview example: resize observers should attach in the callback ref or an effect watching the ref’s current node.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-079',
    question: 'Describe optimistic UI updates and rollback strategies in React.',
    answer:
      'Optimistic UI applies expected successful state immediately when the user acts—liking a post, archiving an item—then synchronizes with the server asynchronously. If the request fails, rollback to previous state and show an error. Implement with local state, React Query mutations with `onMutate` snapshot and `onError` restore, or Redux middleware. Challenges: concurrency when multiple actions overlap; versioning responses; ensuring idempotent server APIs. Accessibility: announce failures to screen readers. Interview: contrast optimistic updates with pessimistic loading spinners for perceived speed trade-offs. Mention race handling with mutation ids or abort controllers to ignore stale failure responses. Product-wise, optimistic flows feel faster but require clear undo and error toasts so users trust the system when rollback happens. For payments or irreversible actions, pessimistic confirmation may still be mandatory regardless of UI pattern.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-080',
    question: 'How does React relate to functional programming ideas?',
    answer:
      'React encourages pure render functions: given props and state, output should be predictable without hidden side effects during render. Immutability fits FP style for state updates. Hooks compose like functions—`useMemo` resembles memoization in FP. However React is pragmatic: effects model imperative subscriptions; not everything is purely functional. List processing with `map`/`filter` mirrors FP transformations. Interview bridge: referential transparency breaks when components read globals or mutate refs during render—engineers should avoid that. Some teams adopt fp-ts or Ramda; most use plain TypeScript with immutable patterns where helpful without dogma. Discussing purity helps interviewers see you understand why Strict Mode double-renders and why concurrent mode forbids side effects in render: those features assume functions are deterministic so work can be replayed or discarded safely.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-081',
    question: 'What are common pitfalls when using `useEffect` for data fetching?',
    answer:
      'Fetching directly in `useEffect` without cleanup can race: a slow response overwrites a newer response. Always abort with `AbortController` or ignore stale results with flags. Missing dependencies causes stale URLs or IDs. Fetching on every render without deps array causes infinite loops if the response sets state that retriggers. Prefer dedicated libraries—TanStack Query—that dedupe, cache, and handle background refresh. For simple cases, synchronize `useEffect` deps to inputs and handle errors in state. SSR considerations: avoid double fetch on server and client without coordination. Interview: mention waterfall requests and parallelizing with `Promise.all` where independent. Document loading and error UI for every fetch path; skeletons beat spinners for perceived performance. Log failed fetches with correlation ids so backend teams can trace 500s to specific client sessions.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-082',
    question: 'Explain how to implement a reusable `useMediaQuery` hook.',
    answer:
      'Use `window.matchMedia(query)` inside `useEffect` to subscribe to changes, updating state when `matches` toggles. In React 18+, `useSyncExternalStore` is the recommended primitive to subscribe to `matchMedia` safely under concurrent rendering—libraries expose `useSyncExternalStore` shims. Provide a server snapshot default for SSR—often `false`—to avoid mismatch. Debouncing is usually unnecessary because `matchMedia` fires only on breakpoint crossings. Test by mocking `matchMedia` in JSDOM. Interview: discuss layout thrashing if you read many queries per frame—batch breakpoints or use CSS container queries when possible instead of many JS listeners. Prefer CSS media queries for layout when JS is only duplicating what the stylesheet already expresses; reserve `useMediaQuery` for behavior that cannot be expressed in CSS alone, such as swapping data sources or analytics dimensions.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-083',
    question: 'What is the “container/presentational” split, and is it still relevant?',
    answer:
      'Historically, container components fetched data and passed props to presentational components focused on UI. Hooks blurred the line: a single function component often calls data hooks and renders UI. The idea remains relevant as separation of concerns—keep visual components dumb and testable with story props, while data orchestration lives in parents or route modules. Over-splitting creates unnecessary indirection. Interview: modern guidance favors colocation and hooks over rigid HOC/container patterns, but the principle of isolating side effects from pure rendering still aids testing and reuse. In large apps, route-level containers may compose multiple hooks while leaf components remain purely visual; the boundary shifts but the motivation—testability and clarity—persists across architectural fashions.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-084',
    question: 'How do you handle timezone and locale formatting in React?',
    answer:
      'Use `Intl.DateTimeFormat`, `Intl.NumberFormat`, and `Intl.RelativeTimeFormat` with a chosen locale rather than manual string concatenation. Store instants in UTC on the server; convert to local only for display with explicit timezone when needed—`Intl` supports `timeZone` option. Avoid `Date.now()` during SSR for default “current time” display; use server clock or client-only effect. Libraries like `date-fns` + `date-fns-tz` help. Interview pitfall: hydration mismatch when server and client default locales differ—configure provider or read `Accept-Language` consistently. Test with multiple locales in Storybook. For scheduling UIs, never mix wall-clock strings without timezone context—store ISO strings or epoch milliseconds and render with explicit zones so daylight saving transitions do not corrupt meeting times across regions.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-085',
    question: 'Describe strategies for code splitting beyond route-level splitting.',
    answer:
      'Beyond route-level `lazy`, split heavy features not needed on first paint—charts, admin panels, rich text editors—with dynamic `import()` triggered on navigation or user interaction like opening a modal. Prefetch on hover or when the browser is idle using `requestIdleCallback` or link prefetch in frameworks. Vendor splitting via bundler configuration separates large libraries. Analyze bundles with `webpack-bundle-analyzer` or source-map-explorer to find outliers. Trade-off: more chunks mean more HTTP requests—HTTP/2 mitigates. Interview: mention preloading critical chunks for likely next navigation to hide latency. Monitor real-user metrics: largest contentful paint and interaction to next paint reveal whether splitting helped or merely delayed work users still need immediately.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-086',
    question: 'What is reconciliation cost for deeply nested trees, and how do you reduce it?',
    answer:
      'Deep trees increase work per update if many nodes must be visited, though React’s fiber architecture can bail out early when types and keys match with unchanged props—`memo` helps. Reducing depth via composition flatter structures, virtualizing lists, and splitting subtrees with `memo` boundaries limits fan-out. Expensive context providers high in the tree that change often force broad updates—split contexts. Profiling identifies whether cost is JS render or DOM commit. Interview: O(n) tree walk is not automatically a problem; constant factors and actual changed surface area matter. Server components reduce client tree size entirely for static regions. When profiling shows DOM commit dominates, investigate CSS complexity and forced synchronous layout rather than only React render time.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-087',
    question: 'Explain how to test hooks in isolation.',
    answer:
      'Use `@testing-library/react` `renderHook` from React 18 testing utilities to mount a test harness component that calls your hook and exposes return values. Assert on results and rerender with new props. For hooks depending on context, wrap with providers in the test wrapper option. Async hooks require `waitFor` to settle. Avoid testing implementation details—test observable behavior. For hooks tightly coupled to DOM, integration tests through components may be more meaningful. Mock timers for debounced hooks with `vi.useFakeTimers`. Interview: mention that hooks rules mean you cannot call hooks outside React render—test utilities embed them properly. For data-fetching hooks, use MSW to simulate network layers so tests exercise loading, success, and error branches without brittle fetch mocks scattered across files.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-088',
    question: 'What is the role of `key` in `Fragment` when mapping?',
    answer:
      'When mapping a list, the outermost element returned from the callback needs a `key`. If you return a `Fragment` as the outermost node, use `<Fragment key={id}>` rather than the empty shorthand `<>`, because the shorthand cannot accept props including `key`. This trips up developers new to React 16+ fragments. Keys on fragments identify list items for reconciliation like any element. Interview edge: multiple elements wrapped without an array may still need keys if using fragments in an array of siblings—structure keys at the array map level. When fragments wrap text and elements together, ensure the list item still has a single stable identity—sometimes a lightweight `li` or `div` wrapper is clearer than a keyed fragment for readability.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-089',
    question: 'How do you approach accessibility for dynamic content updates?',
    answer:
      'Use ARIA live regions (`aria-live="polite"` or `assertive"`) sparingly to announce async updates like form validation or toast notifications without stealing focus. Manage focus explicitly when navigating single-page routes—move focus to `h1` or main content container. Ensure keyboard operability for custom widgets—comboboxes, menus—following WAI-ARIA authoring practices. Test with keyboard and screen readers. React does not automate accessibility; libraries like Headless UI or Radix encode patterns. Interview: mention that too chatty live regions harm UX; batch announcements. Color contrast and motion preferences (`prefers-reduced-motion`) matter for inclusive design. Route transitions should preserve scroll restoration expectations and skip links for keyboard users jumping to main content on every navigation.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-090',
    question: 'Describe using `useReducer` for undo/redo stacks.',
    answer:
      'Model state as `{ present, past, future }` arrays or structured commands. Actions push present into `past`, clear `future` on new edits, undo pops from `past` to `future`, redo reverses. Keep history bounded to avoid memory growth. For text editors, operational transforms or CRDTs may replace naive stacks—scope appropriately. Immutability makes history copies tractable with structural sharing or libraries like Immer. Interview: discuss performance for large documents—chunking history or storing diffs instead of full snapshots. Test edge cases: undo after concurrent edits. Expose keyboard shortcuts for undo redo that match platform conventions and ensure screen readers announce history depth only when meaningful to avoid noise.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-091',
    question: 'What is React’s approach to scheduling and priority of updates?',
    answer:
      'Under the hood, React prioritizes updates: user input like typing is more urgent than background data refresh. The scheduler package coordinates when to perform work across frames, cooperating with the browser to avoid dropping frames. Concurrent features let React interrupt low-priority rendering. This is mostly internal; app developers interact via `startTransition` and `useDeferredValue`. Interview: do not rely on exact scheduling order—write pure components resilient to double rendering. Mention that starvation is theoretically possible if transitions always pending—monitor UX. Libraries integrating should not assume synchronous flush except via `flushSync`. Profiling with the React DevTools profiler shows which updates were deferred and helps validate that expensive list filters are wrapped in transitions rather than blocking typing.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-092',
    question: 'How would you migrate a class component codebase to hooks gradually?',
    answer:
      'Migrate leaf components first or new features exclusively with hooks. Coexist class and function components indefinitely—no requirement to rewrite working classes immediately. Wrapper hooks can encapsulate logic extracted from class lifecycles. For complex class components, extract render methods into function components receiving props. Test after each migration slice. Automated codemods exist for simple patterns but manual review is needed for `componentDidCatch` and rare lifecycles. Interview: business risk versus engineering cleanliness—justify priority. Mention `getSnapshotBeforeUpdate` scenarios needing `useLayoutEffect` carefully. Track migration progress in your issue tracker and prioritize components that block new hook-based libraries or suffer frequent bugs from lifecycle complexity. Celebrate incremental wins: each migrated component reduces the cognitive load of mixed paradigms for new hires reading the codebase.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-093',
    question: 'Explain “tearing” and how concurrent features relate to it.',
    answer:
      'Tearing is when UI shows inconsistent values simultaneously—part of the screen reads one snapshot of external mutable state while another part reads a different snapshot mid-update. Concurrent rendering exacerbates this if external stores mutate during render. `useSyncExternalStore` prevents tearing for external stores by coordinating subscribe/read. Pure React state does not tear because updates are atomic per render. Interview: this is advanced; connect to Redux 5 using `useSyncExternalStore` internally. Misuse of refs to store cross-component mutable data without coordination can also cause visual inconsistency. Reproducing tearing in dev often requires throttling CPU and triggering rapid store updates so interview answers should mention systematic debugging, not only definitions.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-094',
    question: 'What practices help internationalization (i18n) in React apps?',
    answer:
      'Use libraries like `react-i18next` or FormatJS to externalize strings, pluralization, and interpolation. Avoid string concatenation for sentences—word order differs by language. Load translations lazily per locale to reduce bundle size. Pass formatting primitives rather than preformatted strings when possible. Test pseudolocalization to catch overflow. SSR must serialize the correct locale; avoid flash of default language. Interview: RTL layouts require CSS logical properties and mirroring icons thoughtfully. Connect locale to `Intl` APIs for dates and numbers consistently. Establish a translation workflow with translators reviewing context screenshots because bare string keys lose nuance and gender agreement across languages. Fall back gracefully when a locale file is missing rather than crashing the render tree.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-095',
    question: 'How do you evaluate whether to adopt the React Compiler?',
    answer:
      'The React Compiler automatically memoizes where safe, reducing manual `useMemo`/`useCallback`/`memo` burden. Adoption depends on framework support, ESLint plugin availability, and team willingness to fix code that violates Rules of React more strictly. Measure bundle impact and compile times in CI. Incremental adoption on modules may be possible as tooling matures. Interview: position the compiler as reducing human error in memoization, not removing the need to understand React fundamentals—debugging still requires mental models. Mention compatibility with existing libraries and edge cases in direct DOM manipulation. Pilot the compiler on a non-critical package first and compare render counts before and after in benchmarks to quantify wins.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-096',
    question: 'Describe using refs to integrate third-party charting or map libraries.',
    answer:
      'Imperative libraries often expect a DOM container and expose an imperative API—`chart.render(container)`, `map = new maplibre.Map({container})`. Store the container ref, initialize in `useEffect` after mount, and destroy or cleanup on unmount to avoid leaks. Pass data updates via library APIs rather than remounting unless props change drastically. Avoid React state for every animation frame—update the library imperatively. Resize when container size changes using `ResizeObserver` on the ref element. Interview: bridge pattern wraps imperative widgets in declarative props, translating prop changes to imperative calls in effects with proper dependency lists. When options objects change identity every render, stabilize them with `useMemo` or compare inside the effect to avoid destroying charts unnecessarily.',
    codeExample:
      'useEffect(() => {\n  if (!el.current) return;\n  const chart = createChart(el.current, options);\n  return () => chart.destroy();\n}, [options]);',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-097',
    question: 'What is the role of `capture` phase in React synthetic events?',
    answer:
      'DOM events propagate capture phase from root to target, then bubble target to root. React’s synthetic event system supports `onClickCapture` and similar `Capture`-suffixed handlers to run during capture. Use capture handlers when you need to intercept events before they reach inner handlers—global shortcuts, nested interactive elements, or analytics wrappers. Rare in application code; more common in libraries. Remember to call `stopPropagation` judiciously—can break expected bubbling. Interview: native `addEventListener` with capture differs from React’s delegation root; React still normalizes behavior. Testing capture handlers may require firing events with correct phases in jsdom limitations. Document capture-phase listeners clearly because they surprise maintainers reading code that assumes bubble-only ordering.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-098',
    question: 'How do you structure environment-specific configuration in React apps?',
    answer:
      'Use build-time environment variables—`import.meta.env` in Vite, `process.env` in Webpack/Next—prefixed for public exposure (`NEXT_PUBLIC_`, `VITE_`). Never embed secrets in client bundles; they are visible to users. For runtime configuration, inject a `window.__CONFIG__` script from the server for truly dynamic values per deployment. Feature flags may come from services evaluated at runtime with caching. Interview: distinguish what must be secret on server only versus public config. Validate env vars at startup on the server to fail fast. Maintain a `.env.example` listing required keys so onboarding engineers do not guess names; CI should fail if required vars are missing before deploy. Rotate client-visible API keys that are truly public frequently and monitor usage quotas.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-099',
    question: 'Explain collaboration challenges in large teams working on one React monorepo.',
    answer:
      'Monorepos share tooling and design systems but require strict module boundaries—ESLint rules against cross-feature imports, CODEOWNERS on critical packages, and semver for internal packages. Version skew of React duplicates if multiple copies resolve—dedupe with package manager overrides. CI must typecheck and test affected projects only at scale using Nx or Turborepo. Documentation and RFCs for breaking API changes in shared UI become essential. Interview soft skills: align naming, state management strategy, and routing conventions across squads. Performance: remote caching of build artifacts accelerates CI. Regular dependency upgrade weeks reduce drift between apps and consolidate security patches across the monorepo. Onboarding docs should map folders to owning teams so new contributors know whom to ping for reviews.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-100',
    question: 'How do you summarize React best practices for a production system you would defend in a system design interview?',
    answer:
      'Start with a clear rendering model: server HTML where beneficial, client interactivity with colocated state, and data fetching libraries that cache and dedupe network calls. Enforce TypeScript, lint rules for hooks and accessibility, and error boundaries at route boundaries with centralized logging. Performance: measure, virtualize long lists, code-split routes, and avoid accidental re-renders via profiling—not guesswork. Security: never trust raw HTML from users, use CSP, and protect tokens. Testing: pragmatic pyramid—unit tests for hooks and reducers, integration tests for flows, selective E2E. Operations: feature flags, gradual rollouts, and observability on client errors tied to releases. Finally, invest in design system consistency and documentation so velocity scales with team size rather than regressing under UI drift.',
    codeLanguage: 'tsx',
  },
]
