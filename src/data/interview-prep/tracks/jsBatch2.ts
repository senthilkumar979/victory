import type { InterviewQuestion } from '../types'

/** JavaScript js-041–js-080 — Mid-level (language + runtime behavior) */
export const JS_BATCH_2: InterviewQuestion[] = [
  {
    id: 'js-041',
    question: 'What is a closure in JavaScript?',
    answer:
      'A closure is a function that retains access to variables from its enclosing lexical scope even after the outer function has finished executing. The engine keeps those variables alive in a closure environment object reachable from the inner function. Closures power factory functions, module patterns, and callbacks that read configuration from outer scopes. Classic interview loop example: `for (var i=0;i<3;i++) setTimeout(()=>console.log(i),0)` logs `3` thrice because one shared `i` updates—fix with `let` or IIFE capturing copy. Closures are not free memory-wise: holding references to large outer variables prevents GC. Understanding closures separates “JavaScript knows functions” from “JavaScript knows scoping.” They are purely lexical—`this` is separate and not captured by arrow versus function rules as closure variables are.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-042',
    question: 'Explain hoisting and the temporal dead zone for `let` and `const`.',
    answer:
      'Hoisting means variable bindings are created during the scope’s creation phase before line-by-line execution, but `var` initializes as `undefined` while `let`/`const` enter a temporal dead zone until their declaration line is evaluated—access throws `ReferenceError`. Function declarations hoist fully; `const` assigned function expressions do not. TDZ applies to default parameter evaluation order when earlier params reference later `let` bindings incorrectly—subtle spec corner. Interview: hoisting is not “moving code up”—it is compiler bookkeeping. `class` declarations are hoisted like `let` with TDZ. Understanding TDZ explains why `typeof x` on undeclared global is safe but `typeof x` after `let x` line in TDZ is not before declaration in block. This mental model prevents “undefined vs error” confusion during debugging.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-043',
    question: 'How do `call`, `apply`, and `bind` work on functions?',
    answer:
      'They manipulate `this` and arguments for a function. `fn.call(thisArg, a, b)` invokes immediately with a spread argument list. `fn.apply(thisArg, [a, b])` takes an array-like or array of arguments—historically used before spread `fn(...args)` made `apply` less necessary for calls. `fn.bind(thisArg, partialArgs)` returns a new bound function with fixed `this` and partially applied leading arguments, useful for event listeners preserving context. Arrow functions ignore these for `this` rebinding—`bind` cannot override arrow lexical `this`. Interview: `bind` creates a new function; excessive binding in hot paths has minor cost. `call`/`apply` appear in class inheritance patterns mimicking `super` in older code. Knowing these APIs reads legacy libraries and interview questions about explicit `this` control.',
    codeExample:
      'const log = console.log.bind(console);',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-044',
    question: 'What is the prototype chain, and how does property lookup work?',
    answer:
      'Every object may link to another object via `[[Prototype]]` (exposed as `Object.getPrototypeOf` or legacy `__proto__`). When reading `obj.x`, if `obj` lacks own property `x`, the engine walks the chain until it finds `x` or reaches `null`. Assignment `obj.x = v` usually creates an own property without traversing prototypes for write unless the property is an accessor on the prototype with a setter. `hasOwnProperty` distinguishes own versus inherited. `Object.create(proto)` builds objects with a chosen prototype. Classes desugar to prototype linkage between constructor `prototype` and instance `[[Prototype]]`. Interview: know `in` operator checks entire chain; `Object.hasOwn` checks own only. Prototype pollution attacks mutate `Object.prototype`—defensive coding avoids unsafe deep merge from user input. This model is core JavaScript OOP distinct from classical class copies.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-045',
    question: 'How do ES6 `class` syntax and prototypes relate?',
    answer:
      '`class` is syntactic sugar over constructor functions and prototypes: methods go on `prototype`, static methods on constructor, inheritance uses `extends` setting `[[Prototype]]` links and `super` calls. Unlike some languages, classes are still dynamic objects you can mutate after definition—though style discourages it. Hoisting differs: class declarations are TDZ like `let`. Private fields `#x` are true hard private at language level, not just convention. Instance methods are non-enumerable unlike hand-rolled prototype assignments sometimes. Interview: `typeof MyClass` is `"function"`. Subclass must call `super()` before using `this` in constructor. Mixing `class` fields with `super` in inheritance has specific initialization ordering worth reading when bugs appear. Classes improve readability but do not change the prototype fundamentals underneath.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-046',
    question: 'What is a Promise, and how do `.then` / `.catch` compose?',
    answer:
      'A Promise represents a future value: pending, fulfilled with a value, or rejected with a reason. `.then(onFulfilled, onRejected)` returns a new Promise chaining transformations; returning a Promise in `onFulfilled` flattens. `.catch(onRejected)` is shorthand for `.then(undefined, onRejected)`. Omitting `return` inside `then` breaks chains by returning `undefined`. Unhandled rejections surface as global events in environments—always end chains with `catch` or use `async/await` try/catch. `Promise.resolve`/`reject` wrap values. Interview: `then` callbacks are asynchronous microtasks—ordering interacts with the event loop. Synchronous throw inside `then` becomes rejection. `finally` runs for settle and is useful for cleanup without altering the resolution value unless it throws or returns a rejected promise. Promises abstract inversion of control compared to callback-only APIs.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-047',
    question: 'How does `async` / `await` relate to Promises?',
    answer:
      '`async` functions always return a Promise. `await` pauses the `async` function until a Promise settles, yielding the fulfilled value or throwing the rejection—syntactic sugar over `then`. Errors propagate to the nearest `try/catch` in the same `async` function. Multiple sequential `await`s sum latencies; independent tasks should `Promise.all` for concurrency. `await` on non-thenables wraps as resolved immediately. Top-level `await` is allowed in ES modules, pausing module evaluation—impacts graph loading. Interview: `async` stack traces improve readability versus deep `then` chains. Mixing `await` in tight loops without batching can serialize work accidentally—performance smell. Returning a value from `async` wraps in `Promise.resolve`. Understanding that `await` does not block the main thread globally—only the async function’s continuation—is crucial for UI responsiveness explanations.',
    codeExample:
      'async function load() {\n  const r = await fetch(url);\n  return r.json();\n}',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-048',
    question: 'Describe the event loop at a mid-level: call stack, tasks, and microtasks.',
    answer:
      'JavaScript runs one call stack per agent, processing synchronous code until empty. Asynchronous APIs schedule work: macrotasks (timers, I/O callbacks, UI events) and microtasks (promise `then`, `queueMicrotask`, mutation observers in browsers). After each macrotask, the engine drains the microtask queue completely before rendering or the next macrotack—so microtasks can starve if they enqueue more microtasks infinitely. This explains why `Promise.resolve().then(...)` runs before `setTimeout(...,0)` typically. `await` schedules continuations as microtasks in the spec model. Interview: `process.nextTick` in Node is a separate high-priority queue—not identical to microtasks but similar ordering caveats. Understanding the loop clarifies logging order interview puzzles and avoids starving the UI with microtask loops. It is still a high-level model; engine internals add worker threads for some I/O.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-049',
    question: 'What are `Promise.all`, `Promise.allSettled`, `Promise.race`, and `Promise.any`?',
    answer:
      '`Promise.all` fulfills with an array of results when all fulfill; rejects fast on first rejection. `allSettled` waits for every input to settle, returning status objects `{status,value}` or `{status,reason}`—useful when partial failure is acceptable. `race` settles with the first settled promise—common for timeouts. `any` fulfills with the first fulfillment; rejects `AggregateError` only if all reject—good for redundant endpoints. Interview: `all` short-circuits rejection—do not use when independent errors should all be collected. Empty `all` resolves to empty array. Choosing the right combinator prevents subtle bugs in parallel `fetch` patterns. These are pure JavaScript concurrency coordination without threads. Always handle rejections to avoid `unhandledRejection`.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-050',
    question: 'What is debouncing versus throttling (conceptually in JS)?',
    answer:
      'Debouncing delays invoking a function until after a quiet period of repeated calls—useful for resize or search input firing expensive work only when typing pauses. Throttling limits execution to at most once per interval regardless of call frequency—useful for scroll handlers. Both are higher-order function patterns implemented with timers and often `requestAnimationFrame` for visual updates. Interview: implement with `setTimeout` clearing or timestamp comparison; libraries like Lodash provide battle-tested variants with cancel methods. Incorrect cleanup leaks timers on unmount in SPAs—framework-specific but JS timers underlie it. Choosing debounce vs throttle affects UX latency versus sampling rate. Neither replaces backend rate limiting for abuse protection. Pure functions inside make testing easier.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-051',
    question: 'What is `structuredClone`, and how does it compare to JSON cloning?',
    answer:
      '`structuredClone` performs a deep clone for many structured types per HTML/ECMA algorithm: objects, arrays, Dates, Maps, Sets, ArrayBuffers, and more, preserving cycles JSON cannot represent. Functions, prototypes, and some DOM nodes are not cloneable—throws `DataCloneError`. It is available in modern browsers and Node 17+. JSON round-trip loses `undefined`, functions, symbols, types like `Date` unless revived, and fails on cycles. Interview: choose `structuredClone` for in-process deep copies when supported; otherwise library or manual strategies. It is still not a universal “clone everything”—weak collections and certain objects reject. Performance can be heavy on large graphs. Know feature detection for older environments. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeExample:
      'const copy = structuredClone(original);',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-052',
    question: 'What do `Object.freeze`, `seal`, and `preventExtensions` do?',
    answer:
      '`preventExtensions` blocks adding new properties; existing properties remain mutable. `seal` prevents add/remove/reconfigure attributes but still allows value changes on writable data properties. `freeze` makes data properties non-writable and seals the object—shallow immutability: nested objects remain mutable unless recursively frozen. In strict mode, mutations throw `TypeError`; sloppy mode may fail silently on assignment. Interview: `freeze` is not deep by default; libraries build deep freeze for config objects. `const` binds variable assignment, not deep immutability—common confusion. These are useful for defensive constants and `Object.freeze` on module namespace imports in some patterns though namespaces are already sealed specially. Reflect APIs mirror these operations for programmatic style.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-053',
    question: 'When would you use `Map` and `Set` instead of plain objects and arrays?',
    answer:
      '`Map` allows any key type including objects, remembers insertion order, and avoids prototype key collisions—handy for dynamic key spaces from user data. Size is `O(1)` via `.size` unlike counting object keys. `Set` stores unique values with fast membership tests—dedupe and graph edge sets. WeakMap/WeakSet hold weakly referenced keys for metadata without preventing GC—mid-level follow-up. Interview: objects coerce string keys; Maps do not surprise with `toString` keys on plain objects used as keys accidentally. Iteration order of plain integer-like keys in objects has historical quirks; Maps are predictable. For JSON serialization, Maps/Sets need conversion. Choosing structures by access pattern (frequent add/remove, key types) shows engineering maturity beyond “always `{}`”.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-054',
    question: 'What are iterables, iterators, and the `for...of` protocol?',
    answer:
      'An iterable implements `Symbol.iterator` returning an iterator object with `next()` returning `{value, done}`. Built-in iterables include `Array`, `String`, `Map`, `Set`, and generator objects. `for...of` consumes iterables. Generator functions `function*` yield values lazily when iterated. Custom iterables enable streaming large data without loading everything into memory. Interview: iterators can be infinite—guard loops. Spread and `Array.from` consume iterables fully—dangerous on infinite sequences. Async iterators (`Symbol.asyncIterator`) pair with `for await...of` for streams—bridging to promises. Understanding the protocol explains why some objects are not iterable despite looking array-like—need `Array.from` or explicit iterator. This is language-level, not DOM NodeList specifics though NodeLists iterate in modern browsers.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-055',
    question: 'What are generator functions (`function*`) and `yield`?',
    answer:
      'Generators are pausable functions: calling them returns an iterator; `yield` emits a value and suspends until `next` resumes with an optional injected value. They implement lazy sequences, coroutine-like control flow, and can simplify iterators manually. `yield*` delegates to another iterable. Errors can be thrown into generators via `throw` on iterator. Interview: generators are not async unless paired with promises—`async function*` exists for async iteration. Overuse harms readability compared to simpler arrays for small collections. They underpin some libraries (Redux-Saga historically). Understanding single-threaded cooperative multitasking model clarifies that generators do not run concurrently on multiple cores. Use when laziness or custom iteration state machine is clearer than class-based iterators.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-056',
    question: 'What are regular expressions in JavaScript at a practical level?',
    answer:
      'Regex literals `/pattern/flags` or `RegExp` constructor define patterns for `match`, `replace`, `search`, and `split`. Common flags: `g` global, `i` ignore case, `m` multiline, `s` dotAll, `u` unicode, `y` sticky. Capturing groups `(...)` and non-capturing `(?:...)` extract pieces. Be cautious: catastrophic backtracking can hang on evil strings—avoid nested quantifiers on user input or set limits. `String.prototype.matchAll` returns iterator of matches with groups for global regex. Interview: test regexes; readability suffers in complex patterns—sometimes parse manually. Unicode property escapes `\p{...}` with `u` flag help international validation. `RegExp` objects are stateful with `lastIndex` when global—reuse bugs appear. Sanitize user-supplied regex construction to prevent ReDoS.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-057',
    question: 'How do you subclass `Error` for custom errors?',
    answer:
      'Use `class ValidationError extends Error` and call `super(message)`. Set `this.name` and maintain `Error.captureStackTrace` in V8 (Node/Chrome) for cleaner stacks. Custom errors aid `instanceof` checks in `catch` blocks versus string matching `message`. Preserve `cause` option in modern `Error` constructor to chain underlying errors—improves diagnostics. Interview: throwing non-Error values is legal but loses stack consistency—prefer `Error`. In transpiled code, prototype chain may break if Babel not configured—use `setPrototypeOf` workaround historically. For libraries, stable `code` properties help programmatic handling. This is pure JS error modeling before HTTP mapping layers in servers. Always attach context without leaking secrets in messages. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeExample:
      'class AppError extends Error {\n  constructor(msg) {\n    super(msg);\n    this.name = "AppError";\n  }\n}',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-058',
    question: 'What is currying and partial application in JavaScript?',
    answer:
      'Currying transforms a function `f(a,b,c)` into nested unary functions `a => b => c => ...` each taking one argument. Partial application fixes some arguments early, producing a smaller arity function—`bind` partially applies `this` and args. Libraries like Ramda promote curried functional style. Interview: currying improves reuse in point-free pipelines but can hurt readability for teams unfamiliar with FP. Implementation uses closures returning functions. Not to be confused with partial from `bind` only—manual wrappers can curry any arity. Performance is negligible for app code; ergonomics dominate the decision. In TS-heavy codebases, typings for curried functions get verbose. Use when HOF patterns genuinely simplify configuration, not as default for every function.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-059',
    question: 'What is an IIFE, and why was it used before modules?',
    answer:
      'An Immediately Invoked Function Expression `(function(){ ... })();` creates a new scope, hiding variables from the global object and avoiding `var` collisions in script concatenation. Pre-ES-module code wrapped libraries this way. Variants include `(() => { ... })();` though arrow IIFEs cannot be constructors. Passing `window` or `exports` parameters created UMD patterns bridging browser and CommonJS. Interview: modules replace most IIFE use; still appears in legacy bundles. Understand why it worked: function expression versus statement parsing requires outer parens. ASI can bite if line starts with `(` after previous statement without semicolon—leading `;` idiom defensively. Modern bundlers scope modules; IIFE less necessary except quick snippets.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-060',
    question: 'What is dynamic `import()` and how does it differ from static `import`?',
    answer:
      'Dynamic `import("./mod.js")` returns a Promise resolving to the module namespace object, enabling code splitting and conditional loading based on runtime conditions. Static `import` is hoisted, analyzed at build time for tree shaking, and cannot be conditional at top level. Dynamic import computes specifier strings—careful with bundler chunk naming. In browsers, it respects CORS and module type. Interview: use for route-based lazy loading; avoid for tiny modules unless tooling benefits. `import()` in Node ESM loads asynchronously; sync `require` differs in CJS. Some linters forbid dynamic imports with non-literal specifiers without allowlist due to analysis limits. Combines naturally with `async` functions and `await import(...)`.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-061',
    question: 'What is `import.meta` in ES modules?',
    answer:
      '`import.meta` is an object exposing module metadata: in browsers `import.meta.url` is the module URL; in Node it resolves to `file://` path for the current module. Bundlers like Vite expose additional fields (`import.meta.env`). It replaces older patterns needing `__filename` in CommonJS when migrating to ESM. Interview: only available in module code—not scripts or eval unless module. Useful for resolving assets relative to module location. Do not stringify secrets into `import.meta` at build time unintentionally. Understanding `import.meta` clarifies modern tooling and SSR boundaries. It is standard ECMAScript module host integration, growing over time with proposals like `import.meta.resolve` in some environments. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-062',
    question: 'How does `Array.prototype.reduce` work, and what mistakes are common?',
    answer:
      '`reduce` folds an array to one value using an accumulator and current element, optional initial value. Without initial value, first element becomes accumulator and iteration starts at index 1—empty array throws `TypeError`. Callback signature `(acc, cur, idx, arr)`. Common mistakes: forgetting `return acc`, mutating `acc` when immutability expected, using `reduce` for simple sums where `for` loop might be clearer at scale. Interview: `reduce` can build objects or Maps elegantly. For large arrays, `reduce` is not inherently faster than loops. Some style guides discourage `reduce` for readability—team choice. Understand it because libraries chain it and interviews love “implement map/filter using reduce” exercises. Purity of reducer aids testing.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-063',
    question: 'What are `flat` and `flatMap` on arrays?',
    answer:
      '`flat(depth)` flattens nested arrays by depth default 1; `Infinity` flattens fully. Holes in sparse arrays are skipped similarly to other iterators. `flatMap` maps then flattens one level—useful when each element maps to zero or more items without manual `concat` spread. Interview: `flatMap` cannot flatten deeper than one level without another `flat`. Performance memory grows with large intermediate arrays—profile. Replacing `map`+`filter` in one pass with `flatMap` returning `[]` or singleton arrays is idiomatic. Know that `flat` removes empty slots in some paths—sparse array behavior can surprise. These methods are modern replacements for manual recursion in data cleanup tasks. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeExample:
      'const tokens = records.flatMap((r) => r.tags);',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-064',
    question: 'What is `Object.fromEntries`?',
    answer:
      'It builds an object from iterable key-value pairs like those from `Object.entries` or `Map`. Useful invert maps: `Object.fromEntries(Object.entries(o).map(([k,v]) => [v,k]))` with caution for collisions. Combines with `filter` pipelines to reconstruct objects immutably. Interview: requires iterable of `[key, value]` pairs; non-string keys coerce to string for object keys. Complements `Object.entries` for round trips when values are JSON-safe. Edge: duplicate keys later entries win. For frequent updates, `Map` may remain better than object reconstruction. Appears in modern data massaging before API payloads. Know it replaces reduce patterns for object building verbosity. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-065',
    question: 'Explain `instanceof` and its relation to `Symbol.hasInstance`.',
    answer:
      '`obj instanceof Constructor` checks whether `Constructor.prototype` appears in the prototype chain of `obj`, not whether `obj` was literally created by that constructor—can be fooled by `Object.setPrototypeOf` or realm boundaries if constructors differ across iframes. Custom `instanceof` behavior via `Constructor[Symbol.hasInstance]` allows alternative checks. Interview: prefer `Array.isArray` for arrays. Cross-realm `instanceof` fails for objects created in another window—use `Array.isArray` or tag checks. `instanceof` for primitives is false except boxed objects—rare. Understanding prototype semantics clarifies why `instanceof` is not a type system. It is still useful for custom class hierarchies in single realm Node apps. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-066',
    question: 'What are property descriptors (`Object.defineProperty`)?',
    answer:
      'Descriptors control attributes: `value`/`writable` for data properties, or `get`/`set` for accessors, plus `enumerable` and `configurable` flags. `defineProperty` creates or mutates properties with precise control, used by frameworks for reactivity or immutability tooling. `Object.getOwnPropertyDescriptor` inspects them. Interview: `readOnly` patterns use `writable:false`. Accessors enable computed properties and validation on set. Misconfigured descriptors cause silent failures in strict mode throws. `Proxy` wraps objects intercepting these operations at a higher level—related mid topic. Understanding descriptors explains `Object.keys` omissions for non-enumerable properties. Not everyday app code unless building libraries. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-067',
    question: 'What is `Reflect` used for?',
    answer:
      '`Reflect` provides functional counterparts to object operations: `get`, `set`, `defineProperty`, `deleteProperty`, `ownKeys`, `apply`, `construct`—returning booleans or values in consistent ways compared to `Object` methods throwing. It pairs cleanly with `Proxy` traps where trap behavior mirrors `Reflect` defaults. Interview: everyday business logic rarely imports `Reflect`; library authors use it to forward operations in proxies. Knowing it exists explains modern meta-programming patterns. It does not add new power—just normalized API. Use when writing transparent proxies delegating to target with minor tweaks. Part of ES2015 alongside Proxy as reflection twin. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-068',
    question: 'What is a `Proxy` object at a conceptual level?',
    answer:
      'A `Proxy` wraps a target object, intercepting operations like `get`, `set`, `has`, `apply`, `construct` via handler traps. Enables reactive systems, validation, logging, or virtualization. Performance overhead exists—do not wrap entire hot objects unnecessarily. Revocable proxies `Proxy.revocable` cut access after call—useful for secure membranes. Interview: traps must maintain invariants for non-configurable properties or the engine throws. `Proxy` is not a security boundary against malicious code in same realm—attackers can unwrap references. Common interview: implement `get` trap for default values. Understanding proxy vs `defineProperty` accessors: proxies centralize many properties at once. Used heavily in Vue 3 reactivity and Immer drafts conceptually. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-069',
    question: 'What is `SameValueZero` equality and where appears?',
    answer:
      'Algorithm treats `NaN` equal to `NaN` and distinguishes `+0` and `-0` unlike `===` for `NaN` but like `Object.is` for zeros—actually `SameValueZero` treats `+0` and `-0` as equal. Used by `Map`/`Set` key comparisons and `Array.prototype.includes`. Interview contrasts `===`, `Object.is`, and `SameValueZero` for interview trivia. Explains why `includes` finds `NaN` in array while `indexOf` does not. Helps read spec for Set uniqueness semantics. Not daily vocabulary but separates candidates who memorized `===` from those who understand engine equality families. Important when implementing custom keyed collections mimicking Set behavior. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-070',
    question: 'How does exception `finally` interact with `return` in the `try` block?',
    answer:
      'If `try` has `return` and `finally` exists, `finally` executes before the function actually returns, and a `return` inside `finally` overrides a `try` return value—surprising control flow. `finally` runs even if `try` throws unless process aborts. Async generators and await in finally add complexity with pending suspensions. Interview puzzles exploit this ordering. Best practice: keep `finally` for cleanup without `return` unless intentional. Similar override applies to `throw` in `finally`. Understanding this prevents mysterious lost return values when refactoring resource cleanup. It is in the spec and consistent across engines—predictable once learned, obscure until then. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-071',
    question: 'What is `ArrayBuffer` and typed arrays at a basic level?',
    answer:
      '`ArrayBuffer` is a fixed-length raw binary buffer; typed arrays like `Uint8Array` provide typed views over that memory for numeric access without boxing every element. Used for WebGL, files, crypto, and efficient binary protocols. `DataView` supports mixed endian reads. Interview: separate from normal number arrays—length fixed at creation, shared memory possible with workers using `SharedArrayBuffer` under strict browser conditions. Not everyday CRUD JS but appears in performance and platform APIs. Know they exist to read fetch `arrayBuffer()` results. Manipulation requires understanding byte offsets and endianness for multi-byte types. Garbage collection frees buffer when no views reference it. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-072',
    question: 'What is `queueMicrotask`?',
    answer:
      'It schedules a microtask callback to run after the current task completes, before rendering or macrotasks—same queue as promise reactions. Useful to defer work to yield to promise resolutions or maintain ordering guarantees without `setTimeout(0)` macrotask delay. Abuse can starve the event loop if microtasks enqueue more microtasks recursively. Interview compares to `Promise.resolve().then(fn)`—similar effect. Use sparingly for library primitives; application code often uses promises instead. Understanding microtasks clarifies logging order with `queueMicrotask` versus `setTimeout`. In Node, ordering relative to `nextTick` differs slightly—host-specific nuance for advanced only. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-073',
    question: 'What are private class fields (`#field`) in JavaScript?',
    answer:
      'Hard private fields are only accessible inside the class body, enforced by syntax—no runtime escape via `this[\"#x\"]` tricks. Subclasses do not inherit private fields from parents as accessible members—each class has its own private namespace. Static private fields exist too. Unlike TypeScript `private` which erases at compile time, JS private is real at runtime in modern engines. Interview: must be declared in class field form; cannot be added dynamically on instances after the fact like normal properties easily. Debugging is harder—no console enumeration. Use when encapsulation invariants matter. Public stable APIs can remain minimal while internals stay `#`. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeExample:
      'class Counter {\n  #n = 0;\n  inc() {\n    this.#n++;\n  }\n}',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-074',
    question: 'What is `globalThis`?',
    answer:
      'It provides a standard way to reference the global object across environments: `window` in browsers, `global` in Node, `self` in workers. Polyfilled for older engines. Use when writing isomorphic libraries detecting globals. Interview: avoid polluting global; prefer modules. `globalThis` reduces environment-specific conditionals. Security: untrusted code can still alter globals—no sandbox. It formalizes previously ad hoc `typeof window !== "undefined"` checks. For beginners learning, know it exists; for mid-level, use sparingly when authoring portable packages. Combined with `var` in non-module scripts still creates global properties—another reason to use modules. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-075',
    question: 'How does `JSON` handle `undefined`, `Date`, and `BigInt`?',
    answer:
      '`JSON.stringify` omits object properties whose values are `undefined`; in arrays it converts `undefined` elements to `null`. `Date` serializes to ISO strings via `toJSON` on the prototype. `BigInt` throws unless you convert manually in a replacer. `JSON.parse` does not revive dates automatically—use reviver to detect ISO pattern strings and return `Date` if appropriate. Functions and symbols are omitted from objects during stringify. Interview: reviver runs depth-first; can build maps or class instances if shape agreed. Never `eval` JSON. Understanding stringify replacer filtering helps redact sensitive fields before logging. These rules are pure JS standard library behavior affecting every HTTP JSON client.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-076',
    question: 'What is `Array.prototype.at`, and why was it added?',
    answer:
      '`at(index)` returns the element at index, supporting negative indices counting from end—`arr.at(-1)` last item—without fragile `arr[arr.length-1]`. It treats non-integers after coercion and returns `undefined` out of range. Interview: older environments need polyfill or alternative. Slightly clearer intent in code reviews. Does not mutate. Works on string-like behaviors? Strings have `at` too similarly. Helps readability in pipeline code. Not a performance magic—O(1) like index access. Part of making array ergonomics match other languages. Combine with optional chaining if array possibly nullish from expression. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-077',
    question: 'What is `Object.hasOwn` versus `Object.prototype.hasOwnProperty`?',
    answer:
      '`Object.hasOwn(obj, key)` is a static method immune to prototype pollution replacing `hasOwnProperty` on objects that might null out their prototype or override `hasOwnProperty` maliciously. It checks own enumerable or non-enumerable string or symbol keys consistently. Older pattern `Object.prototype.hasOwnProperty.call(obj, key)` remains valid. Interview: prefer `Object.hasOwn` in new code for clarity and safety. Edge cases with boxed objects still coerce. It is part of hardening everyday property checks when processing arbitrary JSON-derived objects. Know that `in` operator still checks prototype chain—different question. Small API addition with large readability and security narrative. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-078',
    question: 'What is a “thenable” and how can it affect `Promise.resolve`?',
    answer:
      'A thenable is an object with a `then` method—Promises are thenables. `Promise.resolve(x)` if `x` is thenable will adopt its state by calling `then`, which can cause accidental promise assimilation if plain objects mistakenly define `then` for other reasons (jQuery historical gotcha). Interview: avoid naming methods `then` on non-promise objects returned from APIs. This is why some libraries renamed methods. Understanding assimilation explains interoperability between third-party promise-like libraries. Spec ensures chaining flattens nested promises. Rare in modern code but memorable trivia explaining mysterious async hangs or resolutions. Part of mastering Promise edge cases beyond happy-path `then`. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-079',
    question: 'What is `AbortController` used for in modern JavaScript?',
    answer:
      '`AbortController` pairs with `AbortSignal` to cancel ongoing operations: fetch requests listen to `signal` and abort when `controller.abort()` is called, rejecting with `AbortError`. Useful for timeouts, user navigation away, or superseding stale searches. Multiple consumers can share one signal. Interview: promise cancellation is not generic—needs cooperative APIs; `AbortController` standardizes cancellation for web platform operations. Node fetch and undici support it. Remember to handle `AbortError` distinctly from network errors in UI. Clearing timeouts on abort avoids leaks. This is ECMAScript / WHATWG integration point for async cancellation story beyond language promises alone. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeExample:
      'const ac = new AbortController();\nfetch(url, { signal: ac.signal });\nsetTimeout(() => ac.abort(), 5000);',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-080',
    question: 'How does `typeof function` differ for `async function` and generators?',
    answer:
      '`typeof async function(){}` is `"function"`; `typeof function*(){}` is `"function"` as well—`typeof` does not distinguish async or generator kinds. `Object.prototype.toString.call` can return `[object AsyncFunction]` or `[object GeneratorFunction]` in some engines for finer discrimination. Interview: use `Symbol.toStringTag` or `constructor.name` cautiously for debugging, not security. Async functions return promises when called; generators return iterators. The uniform `typeof` reflects callable nature only. Understanding this avoids misguided runtime type checks. For feature detection, prefer capability checks (`thing && typeof thing.then === "function"`) over `typeof` alone when distinguishing thenables. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
]
