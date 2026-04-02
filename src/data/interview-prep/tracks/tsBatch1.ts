import type { InterviewQuestion } from '../types'

/** TypeScript ts-001–ts-040 — Beginner (types, tooling, everyday syntax) */
export const TS_BATCH_1: InterviewQuestion[] = [
  {
    id: 'ts-001',
    question: 'What problem does TypeScript solve compared to writing plain JavaScript?',
    answer:
      'TypeScript is a structural type system layered on JavaScript that performs static checking before runtime. It catches many mistakes at compile time—wrong property names, impossible states, incorrect argument counts, and unsafe `null`/`undefined` access when strict null checks are enabled—long before users hit the bug in production. The compiler erases types when emitting JavaScript, so the runtime behavior stays standard ECMAScript unless you use rare emit features. Teams gain safer refactors because renaming a field updates errors across the codebase instead of failing silently at runtime. Editor tooling improves with autocomplete and inline documentation derived from types. The trade-off is build complexity and learning curve. In interviews, emphasize that TS is a development-time safety net, not a second runtime language, and that soundness is intentional pragmatism rather than perfect mathematical proofs for all dynamic patterns.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-002',
    question: 'What is the role of the `tsc` compiler and what does it emit?',
    answer:
      '`tsc` type-checks your project according to `tsconfig.json` and can emit JavaScript files (possibly with source maps) for a chosen `target` and `module` setting, or run in `noEmit` mode for pure checking in CI. It strips type annotations, removes `interface` and `type` aliases, and rewrites only a few constructs like `enum` or legacy `namespace` depending on settings. Modern setups often use `tsc --noEmit` alongside a separate bundler (`esbuild`, `swc`, Vite) for speed while keeping `tsc` as the authority on types. Understanding emit matters when debugging output structure or shipping libraries with declaration files. Scenario: your build is fast but CI fails—often `tsc` is stricter than the dev server transpiler. Interview answer ties compiler flags to team policy, not just “it compiles.”',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-003',
    question: 'What is the difference between `.ts` and `.tsx` files?',
    answer:
      '`.tsx` enables JSX syntax in TypeScript, typically for React or similar frameworks, while `.ts` is plain TypeScript without JSX. The compiler parses JSX tags and type-checks them against your JSX factory settings (`jsx` option in `tsconfig`: `react`, `react-jsx`, etc.). Using JSX in a `.ts` file is a syntax error. Scenario: a beginner renames `component.tsx` to `.ts` and the whole file breaks—explain the extension contract. Monorepos sometimes separate app TSX from shared logic TS for clarity. Interview mention: `allowJs` can mix JavaScript into the program for gradual migration. The extension choice signals tooling (ESLint parser, Vitest environment) as well as the compiler. It is a simple question that filters file-structure literacy.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-004',
    question: 'How do you annotate variables and function parameters with types?',
    answer:
      'Use postfix annotations: `let count: number = 0`, `function greet(name: string): string { ... }`. Parameters list types in parentheses; return type follows a colon before the opening brace. When the initializer makes the type obvious, you can omit annotations and rely on inference: `const x = 1` infers `number`. Over-annotating every variable clutters code; under-annotating public APIs can obscure intent for library consumers. Scenario: a new hire annotates `const users: User[] = await fetchUsers()` when `User[]` is already inferred—acceptable for documentation, redundant for locals. Interviewers like hearing you balance inference versus explicit contracts at module boundaries. `void` marks functions whose return value callers should ignore intentionally.',
    codeExample:
      'function add(a: number, b: number): number {\n  return a + b;\n}',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-005',
    question: 'What is the difference between `interface` and `type` alias for object shapes?',
    answer:
      'Both describe object shapes and participate in structural typing. `interface` can be reopened and merged via declaration merging—useful for augmenting third-party types or splitting large models. `type` aliases support unions, intersections, mapped types, and conditional types more flexibly in one alias; they do not merge by default. For simple object props, teams often pick style-guide consistency over technical necessity. Scenario: extending a library `Window` with custom fields often uses `interface Window { myApp: ... }` augmentation. Interview: neither is universally “better”—know merge rules and expressiveness limits. `interface` extends other interfaces with `extends`; `type` uses `&` intersections. Duplicate property errors differ when merging carelessly—practice reading compiler messages.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-006',
    question: 'What are union types and literal types?',
    answer:
      'A union `A | B` means a value may be either kind—`string | number`. Literal types narrow to exact values: `"on" | "off"` or `404 | 200`. Unions model finite state and configuration flags better than `string` alone. Scenario: an HTTP status variable typed as `string` accepts nonsense; typing as `200 | 404 | 500` catches typos. Control flow narrows unions inside `if` checks: `typeof`, equality, or discriminant properties. Without narrowing, you only get the union’s shared members. Interview pitfall: forgetting `strictNullChecks` makes `null` sneak into unions unintentionally. Combining literals with unions is the backbone of discriminated unions at higher levels. Beginners should practice `switch` with `never` exhaustiveness later.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-007',
    question: 'What does optional chaining (`?.`) and nullish coalescing (`??`) look like in TypeScript?',
    answer:
      'They are JavaScript runtime operators; TypeScript understands them for control-flow narrowing: after `x?.y`, the compiler knows `x` was nullish if short-circuited. `??` narrows only for `null`/`undefined`, unlike `||` which treats `0` and `""` as missing. Scenario: configuring `const port = config.port ?? 3000` preserves port `0` if valid, whereas `||` would wrongly replace zero. Optional call `fn?.()` handles possibly undefined callbacks in typed APIs. Interview: relate to `strictNullChecks`—without it, `null` and `undefined` blur into other types more easily in older code. These operators reduce defensive `&&` ladders and improve readability. TS still requires you to narrow before accessing deeper properties without `?.`.',
    codeExample:
      'const name = user?.profile?.displayName ?? "Guest";',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-008',
    question: 'What is `strictNullChecks` and why enable it?',
    answer:
      'When `strictNullChecks` is true, `null` and `undefined` are not assignable to every type unless included in a union (`string | null`). You must narrow or guard before dereferencing, preventing a huge class of runtime `Cannot read property of null` errors. It is part of `strict` mode and is considered essential for professional TS codebases. Scenario: migrating a legacy JS project flips hundreds of errors—fix by typing APIs honestly with `| undefined` and using guards. Interview answer: short-term pain, long-term reliability. Without strict nulls, TypeScript feels like JavaScript with extra syntax. Combined with `noUncheckedIndexedAccess` (optional), array indexing becomes safer. Teams sometimes enable gradually per package in monorepos using project references.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-009',
    question: 'What is the difference between `any` and `unknown`?',
    answer:
      '`any` opts out of type checking: you can assign anything to it and call any method—silent footguns return. `unknown` is the type-safe top type: you may assign anything to it, but you must narrow or assert before using as a concrete type. Scenario: parsing JSON should yield `unknown` then validate with Zod or manual guards before use—never `as MyDto` without proof. Interviewers reward `unknown` in public boundaries and `any` only as escape hatch with comments and TODO. ESLint rules like `@typescript-eslint/no-explicit-any` push teams toward discipline. Understanding this distinction separates typed JavaScript from pretend types. Prefer `unknown` in catch blocks when `useUnknownInCatchVariables` is enabled.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-010',
    question: 'What is type inference?',
    answer:
      'The compiler deduces types from expressions without annotations: variable initializers, return types of functions with homogeneous returns, and generic parameters from arguments. Inference keeps code concise but can widen literals unexpectedly: `let x = "ready"` widens to `string` unless `as const` or a literal context preserves the union. Scenario: a config object loses literal keys after widening, breaking a function expecting `"dev" | "prod"`. Interview: know when to add `as const` or explicit annotations at let bindings. Return type inference fails if branches return different incompatible types—annotate return type to catch mistakes early. Inference interacts with contextual typing for callbacks—order of errors can confuse beginners. Trust inference locally; be explicit at package boundaries.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-011',
    question: 'What is `readonly` for properties and arrays?',
    answer:
      '`readonly` on a property prevents reassignment through that reference at compile time; for arrays, `readonly T[]` disallows mutating methods like `push` on the typed view (shallow immutability). `ReadonlyArray<T>` is the interface form. Scenario: passing a tuple to a function that must not mutate uses `readonly` to encode contract. Deep readonly requires recursive mapped types or libraries like `immer` typings. Interview: `readonly` is not a runtime freeze—only compile-time enforcement unless you call `Object.freeze`. It documents intent for teammates and improves API safety. Combined with `as const`, you get readonly deeply for literals. Distinguish `readonly` modifier from `Readonly<T>` utility at mid level.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-012',
    question: 'What is an index signature `[key: string]: SomeType`?',
    answer:
      'Index signatures describe objects with dynamic keys beyond fixed property names—all matching keys must have assignable values per the signature, and explicit properties must be compatible with the index type. Scenario: a bag of counters `Record<string, number>` or a cache map. Limitation: `number` index signatures actually coerce to string keys at runtime—know the ECMAScript object key rules. Interview: if you mix specific keys and an index signature, the specific value types must be subtypes of the index value type. `Record<K, V>` is a helper type alias for common cases. Overuse of string index signatures loses precision—prefer known keys when possible. For symbol keys, `symbol` index signatures exist rarely.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-013',
    question: 'What is a tuple type?',
    answer:
      'Tuples are arrays with fixed length and typed positions: `[string, number]` for pairs like coordinates or `[x, y]`. Useful for returning multiple ordered values without introducing an object type. Scenario: a `useState`-like pair `[T, (v: T) => void]` in teaching materials. Tuple types can have optional and rest elements with variadic forms in advanced TS. Interview: readonly tuples model immutable pairs. Excess property checks do not apply the same as objects—tuple assignment allows extra elements in some cases with structural rules—read error messages carefully. `as const` narrows to readonly tuple literals. Contrast with `Array<T>` when length is not fixed. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-014',
    question: 'What is `enum` in TypeScript, and what are common criticisms?',
    answer:
      'Numeric and string enums generate runtime objects and reverse maps for numeric enums, unlike union string literal types which erase completely. They can be convenient for autocomplete across files but introduce non-const behaviors and unexpected emit. Many style guides prefer `as const` objects plus union types for string sets to keep zero runtime cost and clearer structural typing. Scenario: refactoring a string enum used across packages can break consumers expecting runtime object shape. Interview: know `const enum` inlining pitfalls across compilation boundaries. If enums are required for compatibility with existing APIs, use them pragmatically. Modern TS often uses discriminated string unions instead for Redux-style actions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-015',
    question: 'What is `as const` and how does it affect inference?',
    answer:
      '`as const` assertion makes the compiler infer the narrowest literal types and `readonly` tuples recursively on object literals and arrays. Scenario: `const routes = ["/home", "/about"] as const` yields `readonly ["/home", "/about"]` instead of `string[]`, enabling exhaustive checks. Without it, widening loses discriminant precision. Interview: pairs with `satisfies` in TS 4.9+ when you want validation without widening. `as const` on a config object preserves literal keys for mapped type tricks later. It is a beginner-friendly tool with big impact on type precision. Misuse: applying to huge mutable objects you intend to mutate later causes readonly friction—apply narrowly. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeExample:
      'const modes = ["read", "write"] as const;\ntype Mode = (typeof modes)[number];',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-016',
    question: 'What is the `never` type?',
    answer:
      '`never` represents values that never occur—exhaustive checks in `switch`, functions that always throw, or impossible branches. Assigning to `never` inside a switch default after narrowing proves all cases handled; if a case remains, you get an error assigning a real type to `never`. Scenario: reducers with action unions use `default: return state` plus `never` action parameter to catch missing cases. Interview: `never` is the bottom type—subtype of everything. Confusing `void` with `never`: `void` means ignore return; `never` means does not return normally. Understanding `never` unlocks exhaustiveness and safe parsing patterns. It appears often once strict unions are adopted. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-017',
    question: 'What is a type assertion with `as` or angle-bracket syntax?',
    answer:
      'Assertions tell the compiler “trust me, this is type T” without runtime checking—unsafe if wrong. Use sparingly when you know more than the compiler after a guard it cannot follow, or when interoperating with DOM APIs. Scenario: `document.getElementById("root") as HTMLDivElement` assumes element exists and tag—better combined with runtime check. Interview anti-pattern: chaining `as any as Foo` to silence errors—signals tech debt. Prefer type guards and validation libraries. Angle-bracket assertions `<Type>value` conflict with JSX in `.tsx`, so `as` is standard there. Assertions do not convert values at runtime; they erase from type checking only. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-018',
    question: 'What is `typeof` in type positions?',
    answer:
      'In type queries, `typeof value` retrieves the type of a value: `type Point = typeof origin` after `const origin = { x: 0, y: 0 }`. It pairs with `keyof` and indexed access types. Scenario: deriving types from a constant config object avoids duplicating shape definitions. Interview: `typeof` in types is compile-time only, distinct from runtime `typeof` operator though related conceptually for primitives in guards. Works on functions to extract parameter tuples with `Parameters<typeof fn>`. Beginners confuse value space and type space—practice mental separation. It reduces drift between runtime data and types when used intentionally. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-019',
    question: 'What is `keyof` and indexed access types?',
    answer:
      '`keyof T` is a union of known keys of type `T`. `T[K]` looks up property types when `K` is a key union—`User["id" | "email"]`. Scenario: building a `Pick`-like helper manually for learning. Limitations: optional properties include `undefined` in the property type under strict nulls. Interview: `keyof` on primitives behaves specially (`keyof string` is union of `Number` methods etc.)—rare pitfall. Indexed access distributes over unions. These primitives underpin utility types like `Pick` and `Record`. Practice small examples before jumping to advanced mapped types. Essential for typed getters and validation schemas. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-020',
    question: 'What is an intersection type `A & B`?',
    answer:
      'Intersections combine members: an object must satisfy both sides. Conflicting property types must overlap or error—`{a:number} & {a:string}` is `never` for `a`. Scenario: mixing event payloads with timestamps: `BaseEvent & { at: Date }`. Interview: intersections are not always object merge at runtime—TS types do not emit merge code. With generics, intersections can produce surprising `never` when constraints fight. Use for mixins typing and composition patterns. Contrast with `extends` in interfaces which also combines shapes but with declaration merge differences. Over-intersecting large types slows compilation marginally in huge projects. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-021',
    question: 'What is structural typing (duck typing) in TypeScript?',
    answer:
      'TypeScript checks assignability by shape: if an object has the required properties with compatible types, it matches the interface—even if declared with a different name. Scenario: a `UserDTO` and `UserViewModel` with the same fields assign freely, which surprises nominally trained developers. Interview: privacy is not enforced by type names—use branding techniques later for nominal flavor. Structural typing aids testing with mocks implementing subsets. It can also allow accidental matches—unique symbols or brands mitigate when needed. Understanding structure versus name is core TS philosophy. Declaration merging and `private` fields introduce nominal-like rules for classes specifically. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-022',
    question: 'What is `void` as a function return type?',
    answer:
      '`void` means callers should ignore the return value; functions may still return values at runtime, but TypeScript allows assigning a `number`-returning function where `void` is expected for callback positions—special allowance to ignore results. Scenario: `array.forEach` callback return is ignored. Interview: do not confuse with `undefined` type which is stricter in some positions. `void` documents fire-and-forget side effects. Returning meaningful values from `void` functions is a code smell. This quirk relates to callback variance rules in TypeScript. Beginners learn `void` early for event handlers and subscriptions. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-023',
    question: 'What are `public`, `private`, and `protected` in classes?',
    answer:
      'Access modifiers control visibility at compile time: `public` default, `private` limits to class body, `protected` includes subclasses. They do not provide runtime privacy in emitted JS before modern private fields—`#` fields are true private at runtime. Scenario: hiding internal methods on a service class while exposing `run()`. Interview: `private` in TS is soft privacy—`as any` escapes. For hard privacy use `#field`. Constructors can be `protected` for factory patterns. Modifiers apply to parameters to create properties shorthand: `constructor(readonly id: string)`. Classes in TS are a familiar OOP layer over prototypes; know structural assignability still applies except for private/protected compatibility rules between classes.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-024',
    question: 'What does `implements` do for a class?',
    answer:
      '`implements Interface` checks the class statically satisfies the interface shape without affecting runtime emit—it is erased. Multiple interfaces can be listed. Scenario: ensuring a `PostgresUserRepository` class matches `UserRepository` contract. Interview: `implements` does not inherit implementation—only type checking. Missing methods error at compile time. Private properties in interfaces are illegal; use abstract classes or patterns for protected contracts. Classes can implement types with optional members—must handle undefined or provide defaults. It is a checklist for maintainers during refactors. Contrast with `extends` for inheritance of behavior. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-025',
    question: 'What is `abstract` class and methods?',
    answer:
      'Abstract classes cannot be instantiated directly; they may define abstract methods without bodies that subclasses must implement. Useful for shared base logic with enforced overrides. Scenario: a `BaseParser` with `abstract parse(input: string): Ast`. Interview: abstract classes emit runtime classes unlike interfaces—consider bundle size. TypeScript enforces implementation completeness. Compare with interface plus factory function pattern favored in functional styles. Abstract static members have limitations across TS versions—check current handbook. For interviews, show you know abstract is a class feature, not an interface alternative for multiple inheritance—TS has single inheritance for classes. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-026',
    question: 'Scenario: A coworker silences errors with `as any`. How do you respond in review?',
    answer:
      'Acknowledge urgency but explain `any` disables checking for that expression and all downstream uses, hiding real bugs and breaking autocomplete. Suggest `unknown` plus narrowing, proper generics, or fixing the upstream type definition. If truly unavoidable temporarily, require a comment with ticket link and narrow scope—never cast wide objects to `any`. Scenario: third-party library missing types—prefer `@types` package, local `.d.ts` augmentation, or `declare module` with minimal surface. Interview answer shows mentorship: pair on root cause, add ESLint rule tightening over time. Long-term `any` debt undermines migration ROI. Sometimes `satisfies` or conditional types remove the need entirely once investigated. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-027',
    question: 'What is `tsconfig.json` and which compiler options matter first?',
    answer:
      '`tsconfig.json` configures root files, module resolution, JSX, strictness, and output. Common essentials: `strict`, `target`, `module`, `moduleResolution`, `jsx`, `esModuleInterop`, `skipLibCheck`, `forceConsistentCasingInFileNames`. Scenario: CI uses different `tsconfig` than IDE—errors diverge; align extends paths. Interview: `paths` aliases require bundler/tsconfig agreement. `include`/`exclude` control graph size. `composite` and `references` enable monorepo project references. Beginners should memorize `strict` benefits before tweaking exotic flags. `noEmitOnError` keeps bad JS out of dist. Document team defaults in repo README to onboard quickly. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-028',
    question: 'What is `skipLibCheck` and when is it reasonable?',
    answer:
      '`skipLibCheck` skips type checking of declaration files in `node_modules`, speeding builds and avoiding duplicate-type conflicts between overlapping `@types`. Trade-off: you might miss incorrect `.d.ts` issues until runtime. Scenario: massive enterprise repo enables it for speed after verifying critical libraries manually. Interview: pragmatic default for many apps; library authors should still validate their own types. Pair with pinning `@types` versions to reduce drift. Turning it off occasionally in CI can surface dependency problems. Not an excuse to ship broken typings—balance velocity and safety. Explain trade-offs, not binary good/bad. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-029',
    question: 'What is declaration merging with `interface`?',
    answer:
      'Multiple `interface` declarations with the same name in the same scope merge into one combined interface, as long as members do not conflict incompatibly. Used to augment global or module interfaces when a library forgot fields. Scenario: extending `Express.Request` with `userId`. Interview: cannot merge `type` aliases the same way—use intersection or single alias. Merging surprises newcomers who accidentally duplicate names in a file. It is powerful for progressive typing of JS libraries. Know that `namespace` merging also exists historically—less common in greenfield ESM. Document augmentations in `global.d.ts` with clear comments for teammates. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-030',
    question: 'What is `namespace` and is it recommended today?',
    answer:
      '`namespace`/`module` keyword created TS-specific modules before ES modules; it still appears in legacy `.d.ts` files and some patterns like `React` UMD builds. Modern code should prefer `import`/`export` ESM. Scenario: reading old DefinitelyTyped files uses `namespace` to group types. Interview: do not teach namespaces to beginners as primary module system. `export as namespace` supports global script tags rarely. Understanding namespaces helps maintenance, not new feature design. Migration paths replace namespaces with ES modules and `const` objects. If you see `namespace` in app code, question whether refactor is due. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-031',
    question: 'What is `import type` / `export type`?',
    answer:
      'Type-only imports and exports are erased completely and guarantee no runtime import is emitted—useful to avoid circular runtime dependencies and to mark intent. Scenario: a value import from a heavy module only for types pulls runtime side effects; `import type` prevents that. Interview: `verbatimModuleSyntax` in TS 5+ encourages explicit `import type` versus value imports. Bundlers can tree-shake better with clear type-only edges. Mixed `import { type Foo, bar }` syntax clarifies lines. Beginners confused why runtime import missing—explain erasure. It is essential for library authors publishing ESM/CJS dual packages carefully. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-032',
    question: 'What is `esModuleInterop` and `allowSyntheticDefaultImports`?',
    answer:
      'CommonJS modules with `export =` interop awkwardly with ES default imports; `esModuleInterop` emits helper imports so `import fs from "fs"` works more ergonomically in TS output. `allowSyntheticDefaultImports` relaxes type checking only. Scenario: Jest or Node CJS libraries suddenly typecheck cleaner after enabling. Interview: understand your runtime module system matches emit—bundlers may differ. Misconfigured interop causes `undefined is not a function` at runtime despite clean types. These flags are nearly standard now in new projects. Read Node16/NodeNext module resolution docs when publishing libraries. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-033',
    question: 'What is a `.d.ts` declaration file?',
    answer:
      'Ambient declarations describe types for JavaScript without implementation—hand-written for untyped packages or generated by `tsc --declaration` for libraries. Scenario: `global.d.ts` declares `window.myConfig`. Triple-slash references are legacy; prefer imports. Interview: `declare module "pkg"` augments untyped npm package minimally. Publishing types separately under `@types` is community pattern. Ensure `types` field in `package.json` points consumers correctly. Declaration files never emit JS—they guide the checker only unless referenced oddly. Quality `.d.ts` unlocks editor experience for thousands of consumers. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-034',
    question: 'Scenario: Fetch returns JSON you do not trust. How do you type it in TypeScript?',
    answer:
      'Type the response as `unknown`, then parse and validate with a schema library (Zod, io-ts, Valibot) or manual type guards that narrow to your domain type. Avoid `as User` without checks—that lies to the compiler. Scenario: public API changes shape; runtime validation fails loudly instead of corrupting state silently. Interview: mention `unknown` + guard functions returning `value is User`. For quick prototypes, document risk; for production, validate. Combine with `satisfies` on static fixtures separately from runtime boundary. This pattern separates compile-time confidence from runtime truth. Security and correctness both improve. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-035',
    question: 'What is function overload typing?',
    answer:
      'Provide multiple call signatures above one implementation signature; the implementation must be compatible with all overloads. Scenario: a `createElement` helper returning different types based on tag string literals. Interview: overloads are compile-time only—single JS function at runtime. Prefer unions and generics when possible to reduce duplication. Order overloads from specific to general—first match wins. Overloads can become hard to maintain—watch for drift. Conditional return types sometimes replace overload sets in advanced code. Beginners use overloads for `Date` parsing variants—acceptable teaching example. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-036',
    question: 'What is a user-defined type guard function?',
    answer:
      'A function returning `x is Foo` tells the compiler narrowing applies when true: `function isUser(x: unknown): x is User { return typeof x === "object" && x !== null && "id" in x; }`. Scenario: filtering `unknown[]` to `User[]` with `filter(isUser)` requires type predicate overload understanding—sometimes needs generic helper. Interview: guards are runtime checks plus compile-time hints—both must be correct or you have unsoundness. Pair with exhaustive checks for discriminated unions. Do not use guards as branding without real validation. Testing guards with invalid inputs prevents silent acceptance. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-037',
    question: 'What is `satisfies` operator (TypeScript 4.9+)?',
    answer:
      '`expression satisfies Type` checks the expression matches `Type` without widening the inferred literal types of the expression like an annotation would. Scenario: config object must conform to `AppConfig` but keep literal keys for later mapped types. Interview: contrasts with `as` which forces; `satisfies` validates. Improves autocomplete on literals while enforcing shape. Older codebases on old TS lack it—feature-detect or polyfill not possible—upgrade compiler. Pairs with `as const` in docs examples. Reduces duplicate type definitions. When confused, compare error messages from annotation versus satisfies on the same object. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeExample:
      'const cfg = {\n  env: "prod",\n} satisfies { env: "dev" | "prod" };',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-038',
    question: 'What is `noImplicitAny`?',
    answer:
      'Raises errors on variables and parameters whose types implicitly become `any` because the compiler cannot infer them—forces explicit annotation or better inference context. Cornerstone of strict typing. Scenario: event handler parameters without types silently become `any` without this flag—hiding bugs. Interview: enabling it on legacy code surfaces hundreds of errors—fix incrementally per folder or with `// @ts-expect-error` tickets. Pair with ESLint `@typescript-eslint/no-implicit-any-catch` patterns. Teams sometimes enable per-package in monorepo gradually. It is the difference between typed surface and typed illusion. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-039',
    question: 'What is `this` parameter in function typings?',
    answer:
      'You can declare a fake first parameter `this: Foo` to specify the type `this` must have when the function is called as a method—helps type-check call site binding. Scenario: jQuery-style plugins or DOM event handlers expecting certain `this`. Interview: only affects type checking, not emit. Arrow functions do not get dynamic `this`—parameter unused. Rare in new React code but appears maintaining class libraries. Combine with `noImplicitThis` for safer plain functions. Understanding separates library authors from app-only developers. Not needed for most functional React hooks code. In production TypeScript teams, interview credit comes from naming migration cost, realistic `tsconfig` rollout, and where runtime validation still belongs; connecting compiler rules to refactors, flaky tests, and third-party `.d.ts` gaps shows judgment beyond textbook definitions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-040',
    question: 'Scenario: Two types look identical but assignment errors. What might be wrong?',
    answer:
      'Check for `private`/`protected` fields on classes—classes with same shape but different private fields are not assignable nominally. Look for `readonly` vs mutable array properties, excess property checking on object literals versus variables, or differing tuple arity. Scenario: passing object literal to function expecting interface errors on unknown extra props, but variable with extra props might not—excess property checks only on fresh literals. Interview: `exactOptionalPropertyTypes` makes optional props stricter about `undefined` assignment—another subtle flag. Branded types or unique symbols can block accidental assignment intentionally. Teach beginners to read full error spans and compare `Type A is not assignable to Type B` reasons carefully.',
    codeLanguage: 'typescript',
  },
]
