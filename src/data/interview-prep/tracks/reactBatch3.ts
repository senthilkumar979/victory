import type { InterviewQuestion } from '../types'

/** Questions r-051–r-075 */
export const REACT_BATCH_3: InterviewQuestion[] = [
  {
    id: 'r-051',
    question: 'Explain the single responsibility of components in a design system.',
    answer:
      'In a mature design system, each component should encapsulate one clear concern—visual presentation, layout, or behavior—so teams can compose them predictably. Buttons handle click affordance and variants; form fields handle validation display; dialogs handle focus and overlay behavior. Mixing data fetching, routing, and presentation in one mega-component breaks reuse and testing. React encourages small composable pieces: primitives, patterns, and templates. Document props with TypeScript and Storybook stories so consumers know contracts. Versioning and deprecation policies matter when many teams depend on the library. Interview discussion can extend to theming via CSS variables or Tailwind tokens, accessibility baselines baked into primitives, and how breaking changes propagate across products. The goal is consistency without stifling product-specific composition.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-052',
    question: 'What are controlled file inputs, and what challenges do they pose?',
    answer:
      'File inputs are awkward to make fully controlled because setting `value` programmatically is blocked for security reasons; you typically reset with a ref or remount with a key. You still control selection via `onChange` and read `files` from the event target. For drag-and-drop, you manage files in state separately from the native input. Validation includes size, MIME type, and virus scanning server-side. Accessibility: label the input, announce errors, and provide keyboard-accessible drop zones. Large uploads may need chunked uploads and progress UI outside React’s render cycle. Interview depth: preview URLs with `URL.createObjectURL` and cleanup with `revokeObjectURL` in effects to avoid memory leaks. Mention that React does not special-case file inputs differently from other controlled patterns—browser security rules dominate.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-053',
    question: 'How do you safely use `dangerouslySetInnerHTML`?',
    answer:
      '`dangerouslySetInnerHTML` injects raw HTML strings into the DOM, bypassing React’s escaping. Use it only when you must render rich HTML from a trusted source—CMS content sanitized on the server with a vetted library like DOMPurify—or when you fully control the string. Never pass user-generated HTML unsanitized; that is an XSS vector. Combine with Content Security Policy headers as defense in depth. If possible, prefer structured markdown rendered to React elements instead of raw HTML. When you must use it, document the trust boundary clearly in code review. Tests should cover that sanitized output matches expectations. Interviewers reward awareness of security trade-offs, not cleverness with raw HTML.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-054',
    question: 'Describe patterns for sharing data-fetching logic before and after hooks.',
    answer:
      'Before hooks, data fetching often lived in class `componentDidMount`, HOCs like `graphql`, or render-prop containers. That scattered lifecycle logic and made composition verbose. Hooks like `useQuery` from TanStack Query colocate fetching, caching, deduplication, and background refresh in one call inside a component. Benefits: colocation, testability via wrapper components, and fewer wrapper layers. Custom hooks wrap library hooks to standardize error handling and auth headers across the app. Mention stale-while-revalidate, optimistic updates, and pagination patterns that hooks express cleanly. Caveat: hooks cannot be called conditionally, so conditional fetching uses `enabled` flags in query libraries rather than `if` around the hook itself.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-055',
    question: 'What is the purpose of `flushSync` from react-dom?',
    answer:
      '`flushSync` forces React to apply state updates synchronously inside the callback and flush DOM updates before returning, so you can read layout immediately afterward. It opts out of batching for that block. Use sparingly for integrations with non-React code that expects synchronous DOM state—measuring after mutating, legacy jQuery plugins—or when third-party APIs require immediate paint. Overuse hurts concurrent features and can cause performance regressions. Most application code should not need `flushSync`. In interviews, contrast it with `useLayoutEffect`, which runs after DOM mutations but still within React’s commit phase, versus `flushSync` which forces scheduling boundaries. Mention that React 18 documents `flushSync` caveats with concurrent rendering.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-056',
    question: 'Explain how `useSyncExternalStore` helps with concurrent rendering.',
    answer:
      '`useSyncExternalStore` subscribes to an external store—Redux, Zustand, browser APIs like `matchMedia`—in a way that is safe under concurrent rendering. It ensures the snapshot read during render is consistent with the subscription, avoiding tearing where UI shows mismatched values. Libraries migrated to this hook from ad hoc `useEffect` subscriptions that could read stale stores mid-render. The API takes `subscribe`, `getSnapshot`, and optional `getServerSnapshot` for SSR. Interview importance: external mutable stores are not React state; bridging them requires this hook for correctness when React interrupts work. Compare to `useEffect` + state mirroring, which can lag one frame and tear under concurrency. In production debugging, if you see inconsistent labels between sibling widgets, verify external store reads use this hook and that `getServerSnapshot` matches the client for hydration. Redux 5 and modern Zustand versions lean on this primitive internally, so understanding it signals familiarity with how popular libraries stay concurrent-safe.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-057',
    question: 'What is progressive enhancement in a React SPA context?',
    answer:
      'Progressive enhancement means core content or actions work without full JavaScript, then layers improve with JS. Pure client-rendered SPAs often fail this unless the server renders HTML shells or critical forms post without JS. Frameworks with SSR or static generation help: HTML arrives meaningful, React hydrates for richness. Forms can POST traditionally while JS enhances with fetch and client routing. Trade-offs: duplicated logic between server and client validation unless shared schemas. Interview angle: accessibility and SEO benefit from server HTML; resilience improves on flaky networks. Discuss hybrid approaches—remix-style actions, Next.js server actions—versus classic CRA SPAs. React itself is agnostic; architecture delivers enhancement.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-058',
    question: 'How do you avoid stale closures in `useEffect` and event handlers?',
    answer:
      'Stale closures capture outdated variables from the render where the function was created. In effects, omitting dependencies causes effects to see old props or state; fix by listing dependencies or using functional updates. For intervals, either include changing values in deps and reset the interval, or store latest values in refs updated each render. For callbacks passed to children, `useCallback` with correct deps or refs for mutable values prevents children from seeing stale parents. ESLint exhaustive-deps flags many issues. Understanding closures separates junior from mid-level engineers. Mention that `useRef` for mutable instance fields avoids rerenders while always reading `.current` for latest value in async callbacks.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-059',
    question: 'Describe `useImperativeHandle` and when it is appropriate.',
    answer:
      '`useImperativeHandle` customizes the instance value exposed when a parent passes a ref to a child wrapped in `forwardRef`. It is appropriate when you must expose a narrow imperative API—`focus`, `scrollToBottom`, `play`—without leaking the entire DOM node or internal implementation. Prefer declarative props when possible; imperative handles are for integrating imperative libraries or rare parent-driven actions. Pair with `useRef` on internal elements. Overusing imperative handles creates tight coupling. Type the handle interface for consumers. Mention that in React 19 ref-as-prop may reduce `forwardRef` boilerplate but the imperative handle pattern remains for encapsulation. In code review, challenge imperative APIs that could be props: every exposed method is a long-term contract. For video or map embeds, document destroy semantics in the handle so parents coordinate teardown without reaching into DOM. Unit-test the handle by rendering a parent ref and asserting methods behave after rerenders and prop changes.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-060',
    question: 'What is the difference between client-only and universal components?',
    answer:
      'Universal components render the same markup on server and client; client-only components rely on window, document, or browser-only APIs and must not execute those during server-side rendering—or must guard with typeof window checks and effects. Mark client-only modules with the use client directive in React Server Component frameworks or dynamically import with ssr false where supported. Hydration mismatches often come from universal components accidentally using non-deterministic values during render. Interview strategy: push browser APIs into useEffect, use suppressHydrationWarning only when intentional, and default dates or random IDs after mount if needed. Design systems sometimes ship Component.client.tsx variants. Storybook stories should render both server-like and client-only environments: mock matchMedia and ResizeObserver where tests run in jsdom. Document which components are safe for marketing pages that must render without JavaScript versus dashboards that assume a full client runtime.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-061',
    question: 'How does React handle updates to context when multiple providers nest?',
    answer:
      'Nested providers of the same context override values for their subtrees: the nearest provider wins for consumers below it. Different contexts compose independently. Performance: a high-level provider that changes often re-renders all consumers unless you split contexts or memoize value objects. Pattern: separate “dispatch” context from “state” context so frequent dispatch identity does not change state readers, popularized by Redux internally. Interview depth: document provider order in tests; wrong nesting causes subtle wrong-theme or wrong-locale bugs. Multiple instances of the same context object are disallowed—you reuse the same context object with different values at different depths. When profiling, if a single provider causes widespread rerenders, consider lifting volatile data into colocated state or a dedicated store with selectors. Integration tests should mount the same provider tree as production to catch ordering mistakes early.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-062',
    question: 'Explain the “derived state” anti-pattern and how to fix it.',
    answer:
      'Derived state means storing in `useState` something you could compute from props or other state during render. It becomes wrong when props change but local state does not reset, causing UI to disagree with inputs—classic example: editable field initialized from props without a key remount. Fixes: compute during render if cheap, use `useMemo` if expensive, reset state in `useEffect` when `propId` changes, or lift state up so a single source owns it. Another variant: mirroring Redux into local state unnecessarily. Interviewers use this to test understanding of single source of truth. Mention `key={user.id}` on forms when switching records to reset state intentionally.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-063',
    question: 'What role does immutability play in React state updates?',
    answer:
      'React state updates should treat values as immutable: copy arrays and objects when updating rather than mutating in place. Mutation can bypass change detection if references stay the same, especially with `useState` object state—React uses `Object.is` on the new value you pass to the setter; mutating and passing the same reference may skip re-render incorrectly in edge cases and breaks time-travel debugging. Immutability enables structural sharing patterns in libraries and predictable reconciliation. Immer is a popular ergonomic layer for immutable updates. In interviews, connect immutability to concurrent rendering assumptions—mutations during render are forbidden—and to PureComponent memo comparisons that shallow-compare references.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-064',
    question: 'How do you structure feature folders versus type-based folders?',
    answer:
      'Feature folders colocate components, hooks, tests, and styles per domain—`checkout/`, `profile/`—improving cohesion and reducing cross-import sprawl. Type-based folders group all components, all hooks, all pages separately, which scales poorly as teams step on each other. Hybrid approaches put shared UI primitives in `ui/` and features under `features/`. Route segments in Next.js encourage colocation per route. Trade-offs: feature folders can duplicate unless you extract shared modules; discipline and lint rules help. Interview discussion touches team size, monorepo packages, and barrel files (`index.ts`) to control public APIs. The best structure is the one the team consistently enforces. Enforce boundaries with ESLint import rules so features do not import sibling feature internals—only public index exports. In monorepos, publish shared UI as workspace packages with semver to avoid copy-paste drift across apps.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-065',
    question: 'Describe `React.StrictMode` and double effects in React 18.',
    answer:
      'Strict Mode in development double-invokes setup and cleanup for effects to surface missing cleanup functions and non-idempotent side effects that would break with remounting or future concurrent features. Developers see fetch calls twice unless guarded with abort logic or idempotent keys—this is intentional pain to fix bugs. Production does not double-invoke. Explain to interviewers that disabling Strict Mode to silence warnings is usually wrong; fixing effects is right. Strict Mode also highlights unsafe lifecycles in class components. Teams should run Strict Mode in dev continuously so issues surface early rather than in production edge cases. Pair Strict Mode with integration tests that assert no duplicate side effects leak to analytics or payment APIs by using idempotent client request keys and verifying abort on unmount. Educate junior developers that double invocation is a feature, not a framework bug.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-066',
    question: 'What is suspense for data fetching conceptually?',
    answer:
      'Suspense lets components “wait” on async resources—lazy-loaded components or promise-based data—with the nearest `<Suspense>` boundary showing a fallback until ready. With frameworks integrating data fetching, promises thrown from components can suspend the tree cooperatively. This unifies loading states declaratively instead of scattered `isLoading` booleans. Caveats: error handling pairs with error boundaries; waterfall requests need orchestration to avoid sequential fetches; caching layers avoid refetch thrash. React Query and Relay integrate with Suspense in advanced setups. Interview level: contrast imperative loading flags with declarative suspension and discuss how concurrent rendering interleaves fallbacks without blocking urgent updates. Design fallbacks to match skeleton layout to reduce cumulative layout shift when content arrives. Nested Suspense boundaries let you stream critical header HTML first while heavier charts load below without blocking the shell.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-067',
    question: 'How do you implement infinite scroll in React responsibly?',
    answer:
      'Combine scroll or intersection observers with pagination state: load next page when sentinel enters viewport. Debounce scroll handlers; prefer `IntersectionObserver` over raw scroll for performance. Avoid loading duplicates with request ids or cursor tokens. Show skeletons and error retry. Virtualized lists complicate infinite scroll because total height estimates shift—libraries provide helpers. Accessibility: announce new content to screen readers with polite live regions sparingly. Memory: unload far pages if datasets are huge, or virtualize. Interview mention: race conditions when scrolling fast require ignoring stale responses. Server APIs should support stable cursors, not only offsets, for consistency. For bi-directional chat logs, maintain scroll anchor strategies so new messages do not jump the viewport unexpectedly. Load-more buttons remain a robust alternative when observers are unreliable inside transformed or hidden containers.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-068',
    question: 'Explain how to integrate React with a global state management library.',
    answer:
      'Choose a library aligned to your problem: Redux for explicit action logs and devtools, Zustand or Jotai for lighter client state, TanStack Query for server cache. Provide store once at root, subscribe with hooks the library exposes, and avoid duplicating the same remote data in Redux and Query simultaneously without strategy. Normalize relational data if using Redux to avoid deep nesting. For SSR, hydrate store state from the server payload carefully to avoid mismatch. Testing: mock providers in tests. Interview trade-offs: boilerplate versus debuggability, learning curve versus team scale. Mention middleware for side effects in Redux-saga or RTK Query versus colocated thunks.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-069',
    question: 'What are animation considerations when React re-renders frequently?',
    answer:
      'Frequent re-renders can restart CSS animations or interrupt transitions if classes toggle every frame. Prefer animating with CSS transitions on stable classes, GPU-friendly properties (`transform`, `opacity`), or libraries like Framer Motion that reconcile animation state outside React’s render when possible. Avoid storing every animation frame in React state—use refs and `requestAnimationFrame` for imperative animation loops. For layout animations when list order changes, FLIP techniques or specialized libraries help. Mention `will-change` sparingly to avoid memory overhead. Interview connect: concurrent rendering may batch updates such that intermediate animation frames never paint—design animations resilient to batching. Profile with DevTools Performance panel to distinguish layout thrash from React commit cost; sometimes moving animation to a canvas or CSS-only layer removes JavaScript from the hot path entirely. Prefer opacity and transform animations to avoid synchronous layout reads during transitions.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-070',
    question: 'How does TypeScript improve React development, and what are common pitfalls?',
    answer:
      'TypeScript catches prop mismatches, impossible states, and ref typing errors at compile time, improving refactors in large codebases. The React.FC type is less favored now; explicit props interfaces on function components are clearer. Pitfalls: children typing, event handler variance, forwardRef generics, and overly strict props requiring excessive optional chaining. Third-party components without types need DefinitelyTyped packages or wrapper components. Discriminated unions model UI states cleanly with variants such as loading versus error with distinct payloads. Pitfall: casting as any to silence errors hides bugs. Interview bonus: the satisfies operator for constraining object shapes without widening. TypeScript does not replace runtime validation at API boundaries.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-071',
    question: 'Describe security headers and practices relevant to React SPAs.',
    answer:
      'React does not escape you from XSS if you inject HTML unsanitized or if server templates leak user input. Use Content-Security-Policy to limit script sources, `X-Frame-Options` or CSP `frame-ancestors` against clickjacking, and HTTPS everywhere. Store tokens in `httpOnly` cookies when possible instead of localStorage to reduce XSS blast radius—though SPAs often use bearer tokens; each choice has trade-offs. Sanitize URLs before assigning to `href`. Dependency audit catches supply-chain issues. Interview: React’s automatic escaping handles text children; `dangerouslySetInnerHTML` is the footgun. Mention Subresource Integrity for CDN scripts. Layer defense: strict CSP with nonces or hashes for inline scripts, regular dependency updates, and security review of third-party widgets embedded via iframes or script tags. Educate the team that environment variables prefixed for client bundles are public—never place secrets there.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-072',
    question: 'What is the role of `defaultProps` in modern React function components?',
    answer:
      'Class components historically used `defaultProps` for fallback values. Function components today prefer JavaScript default parameters in the function signature or default values while destructuring props—simpler and better for TypeScript inference. `defaultProps` on function components still works but is less idiomatic and can confuse tooling. Memo components may need separate handling. For `forwardRef` components, default parameters remain clearer. Interview: know legacy codebases still use `defaultProps`, but new code should use defaults in destructuring. Mention that default props do not apply the same way for `children` as other props in some patterns—explicitness helps. When migrating, snapshot-test Storybook stories to ensure default visual output remains unchanged. Document which props are optional and their defaults in the props interface comments so consumers of your design system know the contract without reading implementation.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-073',
    question: 'Explain how micro-frontends compose React apps and pitfalls.',
    answer:
      'Micro-frontends split a product into independently deployable vertical slices owned by teams, composed in a shell via iframes, module federation, or single-spa-style orchestration. React-specific pitfalls include multiple React instances and duplicate context providers if bundles load separately—deduplicate React as a shared dependency. Routing must coordinate between shells and micro-apps. Styling isolation via CSS-in-JS scoping or shadow DOM avoids collisions. Performance: loading multiple frameworks hurts; standardize when possible. Interview: communication between micro-frontends via custom events or shared bus versus prop drilling through shell. Testing integration end-to-end becomes critical. Version skew between micro-apps and shell must be governed by compatibility contracts and automated smoke tests on every deploy. Observability should tag errors with micro-app name so on-call engineers route incidents to the owning team quickly.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-074',
    question: 'How do you document components for other engineers effectively?',
    answer:
      'Use Storybook or similar to show variants, states, and accessibility checks. Document props with TypeScript interfaces and JSDoc for non-obvious behavior. Provide usage examples and anti-patterns—when not to use a component. For design systems, include do/don’t visuals and token references. Keep changelog entries when props change. Code comments explain why, not what. Onboarding benefits from architecture decision records for state management choices. Interview soft skill: good docs reduce Slack interruptions and bugs; tie documentation to Storybook visual regression tests in CI for living documentation that cannot drift silently. Record short Loom walkthroughs for complex components so designers and PMs align with engineering constraints. Link documentation from the repository README and from Figma dev-mode annotations where possible.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-075',
    question: 'What is the significance of React’s “rules of hooks” for static analysis?',
    answer:
      'Because hooks rely on call order across renders, conditional or looped hook calls would desynchronize internal linked lists and corrupt state. The rules enable linters like `eslint-plugin-react-hooks` to verify statically that hooks are only called at the top level of React functions. This tooling catches entire classes of bugs before runtime. Custom hooks inherit the same rules. Interview advanced: how compilers might auto-fix or how future React versions might relax constraints—still hypothetical; today rules are strict. Breaking rules in tests or Storybook decorators accidentally is a common mistake; extract conditional logic into child components instead. When building custom hooks, name them starting with use and unit-test them through small harness components to ensure call order stays valid across refactors. Document that hooks cannot be called from class components or non-React functions.',
    codeLanguage: 'tsx',
  },
]
