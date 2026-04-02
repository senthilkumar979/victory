import type { InterviewQuestion } from '../types'

/** JavaScript js-081–js-100 — Expert-level language & runtime depth (still JS-only) */
export const JS_BATCH_3: InterviewQuestion[] = [
  {
    id: 'js-081',
    question:
      'Explain microtask draining and how a microtask loop can starve the event loop.',
    answer:
      'After the call stack empties following a task, the engine runs all microtasks queued—primarily promise reactions and explicit `queueMicrotask` callbacks—until the microtask queue is empty before taking the next macrotask (timer, I/O, UI event). If each microtask enqueues another microtask synchronously, the macrotask queue never runs in between: timers stall, input feels frozen, and rendering may not occur—classic starvation pattern. Interviewers use this to test whether you understand that “async” does not mean “later on the next tick” in all cases; microtasks run in the same turn as the preceding synchronous completion. Fixing requires batching with `setTimeout`/`requestAnimationFrame` to yield or restructuring algorithms. Node’s `process.nextTick` queue runs even earlier than promise microtasks in Node—ordering differs slightly from browsers, another expert footnote. This is engine-scheduling behavior defined by HTML and ECMAScript host integration, not arbitrary.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-082',
    question:
      'What are Promise resolution “jobs” and why can nested `Promise.resolve` chains still interleave with rendering?',
    answer:
      'Promise settlement schedules reactions as microtasks. Each turn processes microtasks until drained, but browsers may interleave rendering opportunities between macrotasks—not between each microtask—depending on host policy, while still guaranteeing microtasks run before the next macrotask in the HTML model. Nested `then` chains remain microtasks and therefore complete before the next timer callback fires. Interview depth: understanding this clarifies logging puzzles mixing `setTimeout`, `Promise`, and `requestAnimationFrame`. Expert candidates articulate that scheduling is host-defined for rendering but microtask checkpoint after callback is standardized. Overly deep microtask recursion can still overflow stack if synchronous—different issue. This topic separates “I used async/await” from “I know when the UI thread breathes.” It remains JavaScript runtime semantics, not framework magic.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-083',
    question:
      'What is `WeakRef` and `FinalizationRegistry` used for, and what guarantees do they provide?',
    answer:
      '`WeakRef` holds a weak reference to an object without keeping it alive: `deref()` returns the object if still alive or `undefined` if collected. `FinalizationRegistry` registers cleanup callbacks invoked after an object becomes unreachable—useful for releasing native resources associated with JS wrappers, with best-effort timing not immediate. They are not deterministic destructors like C++ RAII: garbage collection timing varies; never rely on finalizers for correctness of business logic—only opportunistic cleanup. Interview: expert answer stresses nondeterminism and that engines may skip finalizers under pressure. Misuse can resurrect objects accidentally if callbacks capture strongly. These APIs address long-standing GC pressure patterns in WASM and DOM bindings. They are advanced ECMAScript features rarely needed in everyday app code but signal mature understanding of memory management trade-offs in JavaScript.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-084',
    question:
      'What is tail-call optimization in ECMAScript, and can you rely on it in engines?',
    answer:
      'ES6 specified proper tail calls where some tail-position recursive calls reuse stack frames, enabling constant-stack recursion for algorithms like trampolined interpreters. In practice, major browsers largely did not ship PTC for web compatibility and debugging concerns; V8 disables it. Node similarly does not guarantee TTC in common builds. Interview expert answer: know the spec versus reality—do not depend on TTC for production JS; rewrite recursion to iteration or use trampolines explicitly. This distinction shows you read beyond textbook ES6 marketing. Some functional patterns assume TTC; JavaScript engineers should defensively iterative-ize hot paths. The language allows it; deployment reality does not. Always benchmark and inspect stack depth for recursive solutions.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-085',
    question:
      'At a conceptual level, what are “hidden classes” and inline caches in optimizing JIT compilers?',
    answer:
      'Engines like V8 assign hidden classes (shapes) to objects that share the same property layout and transition history so property access can compile to fast loads instead of dictionary lookups. Monomorphic inline caches assume one observed shape at a call site; polymorphic caches handle a few shapes; megamorphic means many shapes and falls back to slower paths. Mutating object shapes after creation—adding properties in arbitrary order—causes shape transitions and deopts. Expert interviews: explain why stable object schemas matter for hot loops even in dynamic JS. Deleting properties can revert to dictionary mode—slow. This is not an API you call—it informs library design and why some benchmarks lie. It stays JavaScript engine internals, not DOM. Understanding shapes clarifies micro-optimization debates without claiming premature optimization everywhere.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-086',
    question:
      'What are Proxy invariants, and when does a Proxy `get` trap throw?',
    answer:
      'Proxies cannot violate invariants of non-configurable, non-writable properties: a `get` trap cannot report a value different from the target’s actual value for such properties, or the engine throws `TypeError`. Similar rules apply to `set` traps on non-writable properties without setter. Configurable properties allow more freedom. `getOwnPropertyDescriptor` traps must return compatible descriptors. Interview expert level: this prevents proxies from impersonating frozen objects arbitrarily. Implementing virtual objects still has spec boundaries. Revocable proxies throw fixed errors once revoked. Understanding invariants explains cryptic errors when wrapping sealed objects. It also connects to how reactive systems must define properties carefully before observation. This is spec-accurate meta-programming knowledge beyond “proxy logs property access” demos.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-087',
    question:
      'What makes module namespace exotic objects special?',
    answer:
      'ES module namespace objects expose live read-only bindings to exported names: reads reflect current binding value in the module even though properties appear non-configurable accessor-like in spec terms. They are not ordinary objects—`Symbol.toStringTag` and prototype behaviors differ from plain `{}`. `Object.assign` and spreading may throw on uninitialized bindings during TDZ. Interview expert: namespace objects help explain `import * as ns` semantics and why mutating `ns` fails. Proxies wrapping namespaces have additional invariants. Serialization must map exports explicitly—namespace objects are not JSON-friendly wholesale. Understanding this clarifies live binding versus snapshot misconceptions when re-exporting. It is deep ECMAScript module machinery, not bundler trivia, though bundlers emulate pieces.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-088',
    question:
      'How does top-level `await` affect module evaluation order?',
    answer:
      'A module with top-level `await` blocks completion of its module evaluation until the awaited promise settles, which can delay dependents in the module graph that import it (depending on static import graph and whether they need its exports before running). Dynamic `import()` separately returns promises resolving when fetched and evaluated. Cyclic graphs with TLA require careful spec ordering—cycles can deadlock logically if mutually awaited improperly. Interview expert: TLA turns modules into async resources affecting startup latency in browsers and servers—measure waterfall. Bundlers may split chunks around TLA boundaries. It is powerful for initialization scripts but not free. Compare with deferring work inside `async main()` function in CommonJS patterns. This is language-level async module evaluation semantics beyond syntax sugar.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-089',
    question:
      'What are `SharedArrayBuffer` and `Atomics` at a high expert overview?',
    answer:
      '`SharedArrayBuffer` shares raw memory between threads (workers) with `Atomics` providing atomic read-modify-write operations to avoid data races on typed array elements—building blocks for parallel algorithms in pure JS. Browsers gated SAB behind cross-origin isolation headers for Spectre mitigation, complicating deployment. Interview: expert mention of memory model—sequentially consistent atomics for integer operations on shared memory, not a full replacement for mutex abstractions in all cases. Wrong usage still races at logical level if algorithms incorrect. Most app developers never touch this—appears in WASM runtimes, codecs, and scientific computing. Knowing existence and security context demonstrates breadth. It is ECMAScript + host integration, still JavaScript topic boundary-wise.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-090',
    question:
      'Walk through `ToPrimitive` when an object is coerced with `+` or `==`.',
    answer:
      'When an operation needs a primitive from an object, `ToPrimitive` consults `Symbol.toPrimitive` if present with preferred hint (`number` or `string` or `default`). Otherwise it tries `valueOf` then `toString` for hint `number`, or reversed order for hint `string`, calling methods if they return objects until a primitive or throw. This explains why `{} + []` stringification surprises occur and why custom value objects should implement `Symbol.toPrimitive` cleanly. Interview expert: connects to `Date` objects coercing to numbers via `valueOf`. Mishandled `toString` returning object causes `TypeError`. Understanding order prevents coercion bugs in operator overloading attempts. It is spec machinery behind seemingly magical `+` conversions. Pure JavaScript—no DOM.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-091',
    question:
      'What is the difference between `SameValue`, `SameValueZero`, and strict equality?',
    answer:
      '`Object.is` implements `SameValue`: `NaN` equals `NaN`, and `+0` differs from `-0`. Strict `===` differs on `NaN` inequality and treats `+0` and `-0` as equal. `SameValueZero` matches `SameValue` except it treats `+0` and `-0` as equal—used by `Map`/`Set` and `includes`. Interview expert trivia underpins subtle collection behaviors and `Object.defineProperty` no-op updates when `SameValue` holds. Knowing names helps read ECMA-262 algorithms in proposals. Day-to-day you rarely name them, but expert panels like precision. It also clarifies `Object.is` use for signed zero-sensitive math. This is language semantics, not TypeScript structural typing. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-092',
    question:
      'What is `Symbol.species` and how can it affect built-in methods like `map`?',
    answer:
      'Well-known symbol `Symbol.species` on a constructor lets subclasses override the species constructor used by methods that create derived instances—e.g., `Array` methods consult `this.constructor[Symbol.species]` to construct results. Misconfigured species can return incompatible types or break invariants. Interview expert: few hand-author this except library authors extending typed arrays or collections. Understanding explains rare subclass bugs when `map` returns wrong type. Default species is the `this` constructor. It is advanced meta API for extensibility. Combined with subclassing builtins—often discouraged due to engine bugs historically—`species` is niche but spec-important. Demonstrates you read beyond MDN summaries into subclassing semantics. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-093',
    question:
      'Why can extending built-in `Array` or `Error` be problematic in JavaScript engines historically?',
    answer:
      'Older engines mishandled subclassing builtins: wrong `[[Prototype]]` chains for `Error` broke `instanceof` across realms; `Array` subclassing required calling super and adjusting species behavior. Modern engines improved, but transpilers like Babel sometimes emitted code that failed `instanceof` for native `Error` subclasses without `setPrototypeOf` polyfill patterns. Interview expert: know to test cross-browser if you subclass `Error` in libraries. Many teams compose errors instead of extending. Arrays subclassing still surprises if forgetting `super` or species. This is practical expert caution grounded in deployment reality, not just syntax. It connects transpilation targets and polyfills to runtime correctness—key for library authors shipping plain JS. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-094',
    question:
      'What is a “realm” in ECMAScript, and why do iframes matter for constructors?',
    answer:
      'A realm consists of global objects and associated intrinsics (`Array`, `Promise`, etc.). Each iframe or worker has its own realm with distinct constructors even if source text is identical—`x instanceof Array` can be false if `x` came from another frame’s `Array`. `Array.isArray` is reliable cross-realm. `structuredClone` and `postMessage` help transfer data. Interview expert: explains mysterious `instanceof` failures in micro-frontend or embedded widget integrations. `Symbol` registry `Symbol.for` shares global symbols across realms within agent. Understanding realms clarifies why some identity checks fail despite identical shapes. It is spec infrastructure for secure and modular web apps, still core JS rather than React.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-095',
    question:
      'How do async generators (`async function*`) differ from async functions and sync generators?',
    answer:
      'Async generators yield promises resolving to values and implement async iteration protocol—consumers use `for await...of`. They bridge pull-based iteration with asynchronous sources like streams. Backpressure and error propagation follow async iterator interface: `throw` and `return` on iterator matter. Interview expert: combining sync `yield` with awaiting inside same function is illegal—must be `yield await`. Misuse leads to confusing iterator states. Used in WHATWG streams interop and some Node APIs. Not common in business CRUD but appears in library code reading web streams. Understanding triple comparison: sync generator yields sync values; async function returns single promise; async generator yields awaited chunks lazily. This is advanced control-flow composition in the language itself.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-096',
    question:
      'What are import maps (conceptually) relative to bare specifiers in browsers?',
    answer:
      'Import maps let browsers resolve bare specifiers like `import "lodash"` to URLs without bundlers, mapping module names to concrete addresses and scopes. This is a web platform feature consumed by JavaScript module loading, affecting how pure ESM loads in modern browsers without build steps for demos. Interview expert in JS ecosystem context: relates to native modules versus bundler resolution. Security: controlling import maps prevents supply-chain confusion if attacker injects map. Not every Node environment uses import maps the same way—primarily browser. Still counts as JavaScript module loading knowledge engineers face shipping unbundled internal tools. Understanding complements dynamic `import` and `import.meta.url` for path resolution strategies.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-097',
    question:
      'Explain why `0.1 + 0.2 !== 0.3` and practical mitigations in JavaScript.',
    answer:
      'IEEE-754 double-precision binary floating-point cannot represent all decimals exactly—`0.1` and `0.2` have repeating binary expansions, so addition introduces rounding error. This is language-agnostic math reality surfaced in JS `number` type. Mitigations: compare with epsilon tolerance `Math.abs(a-b) < 1e-10`, format with `toFixed` for display only, use integer minor units (cents) with integers or `BigInt`, or decimal libraries for financial core. Interview expert: never use binary floats for money without policy. `Number.EPSILON` aids comparisons near one. `Number.isInteger` and safe integer range guard some aggregates. Understanding separates engineers who blame JS from those who understand numerics. Still pure JavaScript number semantics question. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-098',
    question:
      'What is the difference between sloppy mode and strict mode for `delete` and variables?',
    answer:
      'In sloppy mode, deleting plain variable names fails silently; in strict mode, `delete` on direct bindings throws `SyntaxError` if parsed as such, and runtime `delete` on unqualified identifiers is disallowed. Deleting configurable object properties works similarly in both. Strict mode also disallows duplicate parameter names in non-simple parameter lists historically and tightens `eval` scope. Interview expert: reading legacy bundles may see sloppy patterns; modules are strict. `delete` on `length` of arrays fails or is ignored depending on case—arrays exotic objects. These edge behaviors appear in linters and security scanners flagging `delete` misuse. Understanding clarifies minifier interactions and dead code assumptions.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-099',
    question:
      'How does `Function.prototype.toString` behave for native and bound functions?',
    answer:
      'Engine-dependent: native functions often return `[native code]` body; bound functions stringify as `function () { [native code] }` masking original source. This affects metaprogramming relying on source introspection—fragile. Interview expert: do not depend on `toString` for security or logic; use explicit metadata. Some engines preserve comments in stored source for user functions unless minified. `toString` invoked on class constructors includes class syntax. This is niche but appears when debugging proxies wrapping functions. Relates to policy of hiding implementation in security-sensitive environments. Pure JavaScript reflection trivia separating mid from expert awareness of reliability limits. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-100',
    question:
      'As an expert wrap-up: how do you decide when JavaScript language features are “safe” to adopt in production?',
    answer:
      'Evaluate engine support matrices versus your target browsers and Node LTS using sources like MDN baseline, `compat-table`, and internal analytics on user agents. Pair syntax with transpiler (`swc`, Babel) and polyfill strategy only when necessary—over-polyfilling bloats bundles. For stage-3 proposals, weigh team risk tolerance; for stage-2, usually avoid unless isolated. Measure runtime behavior in CI with real integration tests, not just unit tests in JSDOM missing engine features. Consider security posture: some features (`eval`, dynamic code) always risky. Document upgrade paths when language changes alter error types or timing. Expert answer balances innovation with operability: ship features engineers can debug and operators can support. This meta-question is still JavaScript-focused—about the language ecosystem lifecycle rather than frameworks.',
    codeLanguage: 'javascript',
  },
]
