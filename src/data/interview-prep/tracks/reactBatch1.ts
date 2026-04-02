import type { InterviewQuestion } from '../types'

/** Questions r-001–r-025 */
export const REACT_BATCH_1: InterviewQuestion[] = [
  {
    id: 'r-001',
    question: 'What is the virtual DOM and why does React use it?',
    answer:
      'The virtual DOM is a lightweight, in-memory tree of plain JavaScript objects that describes what the UI should look like at a given moment. React keeps this tree in sync with your component output and compares it to the previous tree whenever state or props change. That comparison step is reconciliation: React walks both trees, figures out which nodes changed, and computes a minimal set of updates to apply to the real browser DOM. The browser DOM is slow to touch compared to running JavaScript, so batching many logical updates into a small number of DOM operations usually improves perceived performance and keeps the UI consistent. The virtual DOM is not magic and not always faster than fine-tuned imperative updates, but it pairs naturally with React’s declarative model: you describe the UI as a function of data, and React handles the diffing. In interviews you should also mention that React 18+ can interrupt, suspend, or batch work, and that Fiber is the internal structure that makes incremental rendering possible, which goes beyond the simple “VDOM diff” mental model.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-002',
    question: 'How does JSX relate to JavaScript, and what does the compiler output?',
    answer:
      'JSX is a syntax extension that looks like HTML inside JavaScript but is not interpreted by the browser directly. Build tools such as Babel, TypeScript, or the React compiler transform JSX into plain function calls—historically `React.createElement`, and in modern setups often optimized output from the automatic JSX runtime. Each JSX tag becomes a call that specifies the element type, props object, and children. This is why you must import React in older setups only when the transform required it; with the automatic runtime, the compiler injects the necessary imports. Understanding this matters because it explains rules like needing capital letters for components (they must refer to a function or class in scope) versus lowercase tags that map to built-in DOM elements. It also clarifies that JavaScript expressions inside curly braces are evaluated before being passed as props or children, which is the foundation for conditional rendering and lists.',
    codeExample:
      'function Greet({ name }: { name: string }) {\n  return <h1 className="title">Hello, {name}</h1>;\n}',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-003',
    question: 'Explain React reconciliation at a high level.',
    answer:
      'Reconciliation is the process React uses to update the user interface when something changes. After a component re-renders, React produces a new element tree. It then compares this tree with the previous one to decide which DOM nodes can be reused, which must be updated, and which should be created or destroyed. React assumes that if two elements have the same type at the same position in the tree, it is safe to update the existing instance in place—for example, changing props on the same component type. If the type changes, React will tear down the old subtree and mount a new one. For lists, the `key` prop tells React which items correspond across renders so state inside list items is not mixed up when order changes. Fiber, React’s internal architecture, represents each unit of work as a node that can be processed incrementally, enabling features like concurrent rendering and prioritization. In senior interviews, connecting reconciliation to keys, memoization, and performance pitfalls shows depth beyond textbook definitions.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-004',
    question: 'Why are stable `key` values critical in lists, and what breaks if you misuse them?',
    answer:
      'Keys are how React identifies a specific item across renders when you render an array of elements. A stable key tied to the identity of the data—such as a database id—allows React to match the correct component instance when items move, are inserted, or are deleted. If you use array index as a key while the list is reordered or filtered, React may reuse the wrong component instance for a different logical item, which corrupts internal state inside list rows, controlled inputs, or animations. Even worse, subtle bugs appear only under certain user flows. Keys do not need to be globally unique, only unique among siblings. Omitting keys triggers a development warning and forces React to fall back to index-like behavior. In interviews, emphasize that keys are not primarily a performance optimization for diffing speed; they are a correctness tool for identity. Mention that in some static lists where order never changes, index keys can be acceptable, but that is the exception, not the rule.',
    codeExample:
      '{items.map((item) => (\n  <Row key={item.id} data={item} />\n))}',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-005',
    question: 'Compare controlled and uncontrolled components in forms.',
    answer:
      'A controlled component is one where the source of truth for the input value lives in React state: you pass `value` and update it through `onChange`, so every keystroke flows through React. That gives you instant validation, formatting, conditional fields, and a single place to read form data before submit. The trade-off is more re-renders and slightly more code. An uncontrolled component stores value in the DOM; you read it with refs, often on submit, similar to traditional HTML forms. That can be simpler for basic cases and avoids re-rendering on every keystroke, but you lose fine-grained control unless you synchronize manually. Hybrid patterns exist—defaultValue for initial uncontrolled setup, or refs to imperatively focus. Interviewers often ask when you would choose each: large dynamic forms and validation-heavy flows favor controlled; simple one-off inputs or integrating non-React widgets may favor uncontrolled. Mention accessibility: both patterns work with labels and ARIA when implemented correctly.',
    codeExample:
      'const [v, setV] = useState("");\n<input value={v} onChange={(e) => setV(e.target.value)} />',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-006',
    question: 'How does React batch state updates from `useState` and `setState`?',
    answer:
      'When you call a state setter multiple times in the same synchronous event handler or lifecycle, React can merge those updates and apply them together before painting, so you only get one re-render with the final result. In React 18, automatic batching was extended beyond React event handlers to promises, timeouts, and native event handlers in many cases, reducing accidental double renders when asynchronous code schedules updates. Batching improves performance and avoids inconsistent intermediate UI. Functional updates—`setCount(c => c + 1)`—are important when the next state depends on the previous one, especially inside loops or async flows, because they always receive the latest committed state. Note that React does not guarantee batching across every possible edge case in legacy roots, but concurrent features assume batching behavior. In interviews, contrast batching with `flushSync` from react-dom when you must force synchronous DOM reads after a mutation, which opts out of batching for that block.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-007',
    question: 'Describe the lifecycle of `useEffect` and when cleanup runs.',
    answer:
      '`useEffect` schedules a side effect to run after React has committed updates to the screen—after paint in the common case—so it does not block the browser from painting. On mount, if you return a function from the effect, that function is the cleanup: it runs before the effect runs again on dependency change, and once more when the component unmounts. This model maps well to subscriptions, timers, and event listeners: you subscribe in the effect body and unsubscribe in cleanup. The dependency array controls when the effect re-runs: empty array means mount and unmount only; omitted array means every render, which is almost always a bug; listing dependencies means the effect runs when any listed value changes by reference for objects and functions. Stale closures are a classic pitfall: if you capture outdated props inside an effect without listing them, you read old values. ESLint’s exhaustive-deps rule exists to catch this. Async logic inside effects should not make the callback itself async; instead define an async function inside and call it, so cleanup can still return synchronously.',
    codeExample:
      'useEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id);\n}, []);',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-008',
    question: 'When would you choose `useLayoutEffect` instead of `useEffect`?',
    answer:
      '`useLayoutEffect` fires synchronously after DOM mutations but before the browser paints the frame. That means you can measure layout—heights, scroll positions, element sizes—and perform additional DOM writes before the user sees an inconsistent flash. Typical use cases include positioning tooltips, synchronizing scroll, or animating FLIP transitions where you need measurements from the committed DOM. The trade-off is that heavy work in `useLayoutEffect` blocks painting and can hurt responsiveness if abused. `useEffect` runs after paint, which is better for non-blocking work like data fetching or logging. Server-side rendering note: `useLayoutEffect` warns when it cannot run on the server because layout does not exist there; patterns often involve `useEffect` on the client or suppressing the warning when you know the code is client-only. Interview answer should show you understand the paint pipeline: layout effect before paint, passive effect after paint.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-009',
    question: 'What problem does `useMemo` solve, and when is it unnecessary?',
    answer:
      '`useMemo` memoizes the result of an expensive computation across renders, recomputing only when dependencies change. It helps avoid redoing heavy filtering, sorting, or derived data creation on every render when inputs are stable. It can also stabilize object or array references when passed to memoized children, preventing unnecessary child re-renders—though `useCallback` is often clearer for function references. It is unnecessary for trivial computations where the cost of memoization bookkeeping exceeds the work saved. Overusing `useMemo` everywhere clutters code and can hide real performance issues such as oversized lists or expensive render paths. Profiling should drive the decision. In React 19+ with the compiler, some manual memoization may be automated, but understanding the primitive remains important. Mention that referential equality for dependency arrays means new object literals each render break memoization unless wrapped.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-010',
    question: 'How does `useCallback` differ from `useMemo`, and what is a typical use case?',
    answer:
      '`useCallback(fn, deps)` is syntactic sugar for `useMemo(() => fn, deps)`: it returns a stable function reference when dependencies are unchanged. That stability matters when you pass callbacks to child components wrapped in `React.memo` or to dependency arrays of other hooks, where a new function identity each render would defeat memoization or retrigger effects. Typical uses include event handlers passed to virtualized list rows, callbacks in context providers to avoid re-rendering all consumers, and dependencies for `useEffect` when the effect should not re-subscribe unless certain values change. Like `useMemo`, it is not free: you should not wrap every inline handler. If the child is not memoized, stabilizing the callback buys nothing. Interviewers may ask you to compare inline arrow functions in JSX versus `useCallback`—the answer hinges on whether referential identity propagates to an optimization boundary.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-011',
    question: 'Explain `useRef` and common patterns beyond holding DOM nodes.',
    answer:
      '`useRef` returns a mutable object with a `.current` property that persists for the full lifetime of the component instance. Updating `.current` does not trigger a re-render, which distinguishes refs from state. The most common use is holding a reference to a DOM element for focus management, measuring size, or integrating imperative third-party libraries. Beyond that, refs are ideal for storing timers, subscription handles, or the previous render’s value in a pattern like `const prev = useRef(); useEffect(() => { prev.current = value; })`. They can also hold mutable instance data that should not affect display, such as an incrementing ID generator or flags to prevent double submission. Avoid using refs for values that should drive UI—use state instead—or you risk showing stale information. Forwarding refs to child DOM nodes uses `forwardRef` or ref callbacks depending on your React version and style.',
    codeExample:
      'const inputRef = useRef<HTMLInputElement>(null);\ninputRef.current?.focus();',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-012',
    question: 'What is `forwardRef` and why was it introduced?',
    answer:
      'By default, function components do not expose a ref to their internal DOM nodes; `ref` is not a prop like other props for function components in the traditional model. `forwardRef` lets a component accept a ref from its parent and attach it to a specific child element or forward it further down. This is essential for library components—buttons, inputs, dialogs—where the parent needs imperative control for focus or measurements. With TypeScript, you type the forwarded ref to the underlying element. React 19 has been moving toward ref-as-prop for function components in some cases, reducing boilerplate, but many codebases still use `forwardRef`. In interviews, connect this to composition: your design system wraps native elements while preserving the same imperative surface area as the native control.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-013',
    question: 'How does the Context API work, and what are its performance considerations?',
    answer:
      'Context lets you pass data through the tree without threading props through every intermediate component. You create a context object, provide a value at an ancestor with `<Provider value={...}>`, and read it with `useContext` in descendants. Any consumer re-renders when the provided value changes by reference. That last point is critical: if you put a new object or callback in `value` every render, every consumer re-renders, which can negate the benefit. Patterns to mitigate include splitting contexts by concern, memoizing the value with `useMemo`, or using state-management libraries for fine-grained subscriptions. Context is excellent for theme, locale, auth session, or rarely changing configuration. It is a poor fit for high-frequency updates to many consumers unless carefully structured. Mention `context` default values for testing and optional consumption without providers.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-014',
    question: 'What does `React.memo` do, and how is it different from `useMemo`?',
    answer:
      '`React.memo` is a higher-order component that memoizes a component’s output: if props are shallowly equal to the previous render, React skips re-rendering that component and reuses the last result. It is a performance hint for pure presentational components that receive stable props from parents. It differs from `useMemo`, which memoizes a computed value inside a component. `memo` compares props; `useMemo` compares dependency values. Custom comparison functions can be passed as the second argument to `memo` for deep or field-specific equality, but misuse can hide bugs if equality is wrong. Remember that `memo` does not help if props include unstable references like inline objects or functions recreated each render—parents must stabilize those with `useMemo`/`useCallback` or colocate state. Interviewers often pair this question with profiling and the limits of shallow comparison.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-015',
    question: 'Describe composition patterns in React and why they beat class inheritance.',
    answer:
      'React’s component model favors composition: building complex UIs by nesting smaller components and passing children or render props. This aligns with the “favor composition over inheritance” principle from object-oriented design, adapted to UI trees. Instead of subclassing a base `Button` to create variants, you compose props, wrappers, or context. Patterns include `children` for slot-like APIs, compound components that share implicit state via context, and render props or function-as-children for customizable rendering. Inheritance hierarchies for UI become brittle as requirements diverge. Composition keeps boundaries clear, improves testability, and matches how React reconciles trees. Mention that higher-order components are still composition but have fallen somewhat out of favor compared to hooks for sharing logic, though they remain valid for cross-cutting concerns in legacy code.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-016',
    question: 'What is lifting state up, and when should you do it?',
    answer:
      'Lifting state up means moving shared state from child components to their closest common ancestor so that multiple children can read and update it through props and callbacks. You do this when two or more components need to stay in sync—form sections, filters and results, or master-detail layouts. The lifted state becomes the single source of truth, which simplifies debugging and avoids contradictory UI. The trade-off is that intermediate components may pass props they do not use directly (prop drilling), which you can mitigate with composition, context, or state libraries when depth grows. Not all state should be lifted: local UI state that only one component cares about should stay local to avoid unnecessary coupling. Interview answers should show judgment: lift when coordination is required; keep local when encapsulation is clearer.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-017',
    question: 'Compare prop drilling with using Context for shared data.',
    answer:
      'Prop drilling is passing data through every level of the tree via explicit props until it reaches the component that needs it. It is simple, explicit, and easy to trace in small trees, but becomes noisy and fragile when many layers separate provider and consumer. Context removes intermediate prop passing by broadcasting a value from an ancestor to any descendant that opts in via `useContext`. That reduces boilerplate but introduces implicit dependencies: consumers are harder to trace statically, and misuse of context values can cause broad re-renders. Rule of thumb: use prop drilling for a few levels or when few components need the data; use context when many distant leaves need the same stable or slowly changing data like theme or auth. For frequently changing data with many consumers, consider specialized state libraries with selector patterns. Neither approach is universally superior; the decision is about scale and team conventions.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-018',
    question: 'How do Error Boundaries work, and what do they not catch?',
    answer:
      'An error boundary is a class component (or framework-provided equivalent) that implements `static getDerivedStateFromError` and/or `componentDidCatch` to intercept JavaScript errors thrown during rendering, in lifecycle methods, or in constructors of its descendants. When an error is caught, you can render a fallback UI instead of crashing the whole app and optionally log to an error reporting service. They do not catch errors inside event handlers, asynchronous code such as `setTimeout` or promise rejections unless those errors are rethrown during render, errors in the boundary itself, or errors during server-side rendering in the same way as client. For event handlers, use try/catch. For data fetching, handle errors in the async path. Modern apps often place boundaries around route segments or feature shells so one broken widget does not take down navigation. Mention that functional components cannot be error boundaries without a wrapper class or library helper in traditional React.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-019',
    question: 'What are portals, and why would you use `createPortal`?',
    answer:
      'Portals let you render children into a DOM node that exists outside the parent’s DOM hierarchy while preserving React context and event bubbling according to the React tree, not the HTML tree. `createPortal(child, domNode)` is common for modals, tooltips, dropdowns, and flyouts where CSS stacking contexts, `overflow: hidden` on ancestors, or `z-index` battles would otherwise clip or hide UI. Event handling still follows React’s synthetic event propagation through the component hierarchy, which surprises some developers who expect DOM-only bubbling. Accessibility benefits: you can render dialogs at the end of `document.body` while keeping focus management logic in React. In interviews, mention focus traps, `aria-modal`, and returning focus on close as complementary concerns to portals themselves.',
    codeExample:
      'createPortal(<Modal />, document.getElementById("modal-root")!);',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-020',
    question: 'What are fragments and why use `<>...</>` syntax?',
    answer:
      'Fragments let you group multiple sibling elements without adding an extra DOM node. That matters when a component must return multiple top-level nodes—because JSX requires a single parent—or when wrapping would break CSS layouts like flex or grid. The short syntax `<>...</>` corresponds to `React.Fragment` without props. Named `Fragment` with a `key` prop is available when mapping lists where keys must be on the outermost element returned from `map`. Without fragments, developers used unnecessary `div` wrappers that polluted the DOM and complicated styling. Mention that fragments do not support keys in the shorthand form, which is a common interview gotcha. Server-side rendering and hydration treat fragments transparently.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-021',
    question: 'What does React Strict Mode do in development?',
    answer:
      'Strict Mode is a development-only wrapper that activates additional checks and warnings for its descendants. In React 18+, it intentionally double-invokes component functions, initializers, and certain effects in development to expose impure side effects—code that breaks when run twice. The goal is to prepare components for concurrent rendering where React may start and abandon work. It also warns about deprecated APIs like legacy context, unsafe lifecycles, and missing keys. Strict Mode does not affect production bundles or performance characteristics in prod. Developers sometimes mistake double rendering for a bug; the correct response is to fix non-idempotent effects—for example, guard subscriptions or use cleanup functions. Mention that `useEffect` running twice on mount in Strict Mode helps catch missing cleanup for subscriptions.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-022',
    question: 'Explain React’s synthetic event system.',
    answer:
      'React wraps native browser events in a SyntheticEvent object that normalizes behavior across browsers—different property names, bubbling quirks, and timing—so you write one handler that works everywhere React supports. Events are delegated: listeners attach at the root instead of every node, which reduces memory and handles dynamic lists efficiently. Pooling was used in older React versions for performance; in React 17+ the delegation root moved to the app container and pooling was removed, so async access to event fields is safer in modern code. Understanding synthetic events matters when integrating with non-React code that expects native events, or when calling `stopPropagation` and `preventDefault` in composed UIs. Interview depth: compare `nativeEvent` access and how passive listeners interact with scroll performance.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-023',
    question: 'How does React 18 automatic batching change update behavior?',
    answer:
      'Before React 18, batching of multiple state updates into one re-render was mostly limited to React-managed events. Updates inside timeouts, promises, or native handlers could cause multiple paints. React 18’s automatic batching, when using `createRoot`, batches state updates from more sources by default, reducing intermediate renders and improving consistency. This can surface bugs where code assumed intermediate renders were visible—now the UI may jump directly to the final state. For rare cases requiring synchronous flush—reading layout immediately after a state change—you use `flushSync` from `react-dom`. Automatic batching interacts with concurrent features: updates can be prioritized and interrupted. Interviewers may ask how this affects third-party state stores; often they need to batch notifications or subscribe outside React’s tick.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-024',
    question: 'What is the difference between element, component, and instance in React?',
    answer:
      'An element is a plain object describing what you want to see on screen—type, props, and children—produced by JSX or `createElement`. It is immutable and cheap to create. A component is a function or class that accepts props and returns elements; it is the blueprint. An instance, in the class component era, referred to an instantiated class with `this`; function components do not have user-visible instances in the same way—React tracks fiber nodes internally. When people say “instance” informally for function components, they often mean the fiber or the component’s closure state via hooks. Clarifying this vocabulary helps debug reconciliation: changing element type at a position replaces the subtree. Props changes keep the same component type and reconcile deeper. This distinction is a favorite in senior interviews to test mental models.',
    codeLanguage: 'tsx',
  },
  {
    id: 'r-025',
    question: 'Why should side effects live in `useEffect` rather than directly in the component body?',
    answer:
      'The component body runs during render and must be pure: given props and state, it should compute UI without observable side effects like network calls, subscriptions, or direct DOM mutation outside React’s control. Violating purity can cause duplicate requests in Strict Mode, inconsistent output with concurrent rendering, and hard-to-reproduce bugs when React retries work. `useEffect` schedules work after commit, separating derivation from side effects. Deriving values from props/state belongs in render or `useMemo`; synchronizing with external systems belongs in effects with correct dependencies. Direct DOM reads that affect paint timing may belong in `useLayoutEffect` instead. This separation is foundational to React’s programming model and is often asked to assess whether a candidate understands render purity versus effectful work.',
    codeLanguage: 'tsx',
  },
]
