import type { InterviewQuestion } from '../types'

/** TypeScript ts-081–ts-100 — Expert (variance, advanced types, soundness, tooling depth) */
export const TS_BATCH_3: InterviewQuestion[] = [
  {
    id: 'ts-081',
    question:
      'Explain parameter bivariance for methods under `strictFunctionTypes` and why it exists.',
    answer:
      'For function properties in object types, TypeScript historically checks method parameters bivariantly (both directions allowed) for backward compatibility with common React and DOM patterns where a narrower handler was passed where a wider one was expected. Non-method function properties are checked contravariantly—stricter and sounder. Scenario: refactoring a callback prop to a plain function-typed property suddenly surfaces errors that methods hid—know why. Interview expert: you can opt into stricter behavior by declaring the property as a field whose type is a function type rather than a method signature. This touches variance theory: function parameters are contravariant positions; return types covariant. TypeScript trades some soundness for pragmatic adoption. Understanding the distinction helps read confusing error messages comparing two compatible-looking signatures. It is a deliberate language wart documented in the handbook.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-082',
    question:
      'What are homomorphic mapped types and why do optional modifiers preserve behavior?',
    answer:
      'A mapped type is homomorphic when it maps over `keyof T` in the raw form `{ [K in keyof T]: ... }`—TypeScript preserves modifiers like `readonly` and `?` on properties automatically, unlike arbitrary key unions that lose optionality nuance. Scenario: custom `DeepReadonly` without homomorphic care breaks optional fields by forcing `undefined` unions incorrectly—experts read lib.d.ts `Readonly` definitions for patterns. Interview: when you add `as` remapping or filter keys, homomorphic behavior may degrade—test edge cases. This spec detail explains why `Partial` and `Readonly` feel “right” on interfaces. Deviating for power requires compensating with `-?` and `-readonly` operators consciously. Library authors lean on homomorphic patterns for predictable ergonomics across versions.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-083',
    question:
      'Scenario: A conditional type distributes over a union unexpectedly. How do you stop distribution?',
    answer:
      'Wrap the checked type in a tuple or intersection trick: `[T] extends [U] ? X : Y` prevents naked type parameter distribution across `T` union members. Scenario: you want `Foo | Bar` as a whole to match a pattern, not split into `Foo` branch union `Bar` branch. Interview expert: distribution is one of the most confusing TS behaviors; bracket wrapping is the standard fix documented in handbook advanced types. Another approach: constrain `T extends U | V` carefully and structure conditionals to avoid naked `T` on left of `extends`. Debugging involves simplifying types with `type Preview<T> = ...` in playground. Teach teams this pattern to reduce copy-paste “magic” from StackOverflow. Mastery separates advanced generic authors from consumers.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-084',
    question:
      'What makes a user-defined type guard potentially unsound, and how do reviewers catch it?',
    answer:
      'A guard `x is Foo` only promises runtime truth; if implementation checks shallow fields but attacker supplies extra properties or prototype tricks, downstream code may assume invariants false at runtime. Scenario: `typeof x === "object" && x !== null` as guard for `Foo` is too weak if `Foo` needs specific keys—validate each required key and types. Interview: soundness is developer responsibility—TS trusts guards absolutely. Code review pairs guards with tests covering negative cases. For external input, schema validation beats guards. `asserts` functions similarly must throw reliably. Mention structural typing: two different interfaces with same shape are indistinguishable—guards cannot brand without extra markers. Expert answer acknowledges limits of compile-time proofs.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-085',
    question:
      'How do recursive types interact with compiler recursion depth limits?',
    answer:
      'Deeply nested instantiations of recursive conditional types or mapped types can hit `Type instantiation is excessively deep` errors—computation complexity explodes. Scenario: JSON `Json` type defined recursively without tail-recursion optimization patterns hits limits on deep literals. Interview expert: techniques include tail-recursive type aliases with accumulator parameters, depth-limited recursion using tuple length counters, or stopping at pragmatic `unknown` leaves. Sometimes `interface` recursion is handled differently than type alias recursion—know handbook notes. Libraries like `ts-toolbelt` encode depth limits. Production code favors validation libraries over infinitely precise JSON types. Performance tuning is part of expert TS maintenance in type-heavy codebases. Senior discussions often stress trade-offs—compile time, ergonomics, and library compatibility—so grounding your explanation in code review feedback, CI failures, and how typings align with actual JSON or DOM APIs reads as practical engineering rather than trivia.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-086',
    question:
      'What is the difference between `interface` merging across modules and `namespace` augmentation risks?',
    answer:
      'Augmenting third-party interfaces via `declare module "x" { interface Foo { } }` merges shapes globally for that module id—duplicate conflicting property types error. Wrong module specifier string silently creates orphan augmentation that never applies—subtle bug. Scenario: two teams augment same interface with incompatible optional fields—merge seems fine until assignability breaks elsewhere. Interview expert: prefer minimal augmentation surface; contribute upstream types. `namespace` augmentation is rarer and can pollute global scope if careless. Version skew between `@types` and runtime package causes phantom properties—pin versions. Document augmentation files clearly. This is maintenance expertise beyond writing application DTOs. Senior discussions often stress trade-offs—compile time, ergonomics, and library compatibility—so grounding your explanation in code review feedback, CI failures, and how typings align with actual JSON or DOM APIs reads as practical engineering rather than trivia.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-087',
    question:
      'Scenario: Publishing a dual ESM/CJS library—what TypeScript settings commonly bite authors?',
    answer:
      'Use `moduleResolution` `Node16`/`NodeNext`, `module` matching output, separate `types` conditions in `exports` map, `type` field in package.json `"module"`, and emit `declaration` plus `declarationMap` for consumers. Mistmatch where types resolve to CJS typings but runtime loads ESM causes `import` default interop errors. Scenario: forgetting `.`/`import` export conditions leaves tools picking wrong entry. Interview: test consumption from both `require` and `import` in a fixture package. `verbatimModuleSyntax` clarifies type-only exports in published `.d.ts`. Expert maintainers read Node documentation alongside TS 5 module handbook. Getting this wrong wastes thousands of developer hours across ecosystem. Senior discussions often stress trade-offs—compile time, ergonomics, and library compatibility—so grounding your explanation in code review feedback, CI failures, and how typings align with actual JSON or DOM APIs reads as practical engineering rather than trivia.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-088',
    question:
      'What is `unique symbol` branding and how does it strengthen nominal typing?',
    answer:
      'Declaring `declare const brand: unique symbol; type Id = string & { [brand]: void }` creates incompatible branded strings across different `unique symbol` declarations—harder to mix than string intersection with same structural brand field name only. Scenario: `UserId` vs `OrgId` both strings but must not assign. Interview expert: runtime remains plain string; security still needs validation—compile-time only. Factories cast after validation. Multiple `unique symbol` declarations in same scope differ—key to nominal separation. Works in `.ts` files; `.d.ts` uses declare const pattern. Contrast with enum-like wrappers. Expert teams codify branding in architecture guidelines to prevent ID confusion bugs in large domains.',
    codeExample:
      'declare const U: unique symbol;\ntype UserId = string & { readonly [U]: void };',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-089',
    question:
      'How does `infer` in multiple positions inside one conditional work?',
    answer:
      'Multiple `infer` declarations in one `extends` pattern must be consistent—TypeScript solves them together; if the pattern cannot match simultaneously, inference fails to `never` or false branch. Scenario: extracting both promise wrapped type and array element in one pattern requires careful structuring—often split into multiple conditional steps for readability. Interview expert: break complex inference chains into named intermediate type aliases for maintainers. Order of evaluation follows conditional nesting—debug by simplifying. Some patterns need tuple wrapping to tie inference variables. This is advanced type-level programming; overuse in app code harms onboarding. Library internals use it heavily—application developers read types more than author them.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-090',
    question:
      'What are phantom type parameters and why use them?',
    answer:
      'A generic parameter appears on a type but not on runtime values—carries compile-only tag: `type Matrix<R,C> = { data: number[] }` where `R`/`C` are not fields but distinguish types. Scenario: linear algebra wrappers preventing multiplying incompatible dimensions at compile time. Interview expert: erasure removes parameters—runtime cannot inspect `R`; must keep API functions generic to propagate tags. Similar to branding but for multiple dimensions. Over-engineering risk—use in libraries or safety-critical DSLs. Demonstrates using type system as proof assistant lite. Combine with function generic constraints to enforce operations. Rare in CRUD apps; common in typed FP libraries. Senior discussions often stress trade-offs—compile time, ergonomics, and library compatibility—so grounding your explanation in code review feedback, CI failures, and how typings align with actual JSON or DOM APIs reads as practical engineering rather than trivia.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-091',
    question:
      'Scenario: `tsc` reports errors only in CI, not locally—what do you check?',
    answer:
      'Verify same `tsconfig` path, TS version lock (`package.json` and lockfile), `NODE_ENV` differences affecting `types` inclusion, incremental cache corruption (`rm -rf tsbuildinfo`), different `skipLibCheck`, path case sensitivity on Linux CI versus macOS, and parallel `tsc` projects references ordering. Scenario: developer runs Vite without `tsc` while CI runs `tsc --noEmit`—errors only upstream. Interview expert: enforce `tsc` in pre-commit or CI always; align IDE TypeScript version with workspace. `extends` wrong relative path breaks silently sometimes. Disk case mismatches `import "./File"` vs `./file`. These operational issues dominate “mysterious CI” threads—expertise includes tooling forensics, not only types. Senior discussions often stress trade-offs—compile time, ergonomics, and library compatibility—so grounding your explanation in code review feedback, CI failures, and how typings align with actual JSON or DOM APIs reads as practical engineering rather than trivia.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-092',
    question:
      'What is `isolatedDeclarations` (TS 5.5+) and who benefits?',
    answer:
      'Forces exported symbols have explicit types that can be emitted per-file without whole-program inference—enables faster parallel `.d.ts` generation tools (e.g., `tsgo` direction) and stricter API contracts. Scenario: library author must annotate all exported functions and constants explicitly—more boilerplate, clearer public types. Interview: app code may opt in gradually; libraries shipping types benefit most. Errors guide missing annotations. Expert maintainers read release posts when adopting. Pairs with documenting public API surfaces. Trade-off: verbosity versus speed and clarity. Not beginner default—strategic for large packages. Represents TypeScript scaling to massive repos concerns beyond type correctness alone. Senior discussions often stress trade-offs—compile time, ergonomics, and library compatibility—so grounding your explanation in code review feedback, CI failures, and how typings align with actual JSON or DOM APIs reads as practical engineering rather than trivia.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-093',
    question:
      'Explain how `void` in return position differs for generic inference versus `undefined`.',
    answer:
      '`Promise<void>` resolves with undefined implicitly; some APIs treat `void` as “ignore fulfillment value” while `undefined` is explicit unit value—subtle assignability differences in strict settings and callback typings. Scenario: generic `async` middleware returning `Promise<void>` versus `Promise<undefined>` when chaining—usually compatible but edge cases in conditional types differ. Interview expert: read handbook notes on `void` in generic returns and strictFunctionReturn checks if enabled. Confusion appears in `React.useEffect` cleanup return typing discussions. Knowing spec intent avoids pointless casts. Deep corner—experts encounter when writing advanced generic utilities around async functions. Senior discussions often stress trade-offs—compile time, ergonomics, and library compatibility—so grounding your explanation in code review feedback, CI failures, and how typings align with actual JSON or DOM APIs reads as practical engineering rather than trivia.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-094',
    question:
      'What is `accessor` keyword in TS 4.9+ class field context (stage 3 ECMAScript) awareness?',
    answer:
      'TypeScript tracks class field proposals: auto-accessors and related syntax evolve; experts monitor release notes for `accessor` keyword support enabling auto-backed getters/setters with correct typing. Scenario: framework codegen may emit accessors—types must align. Interview: show you follow TC39 + TS alignment, not only app coding. Exact version features change—cite checking current handbook. This question filters continuous learners. Practical impact today may be limited but grows as engines ship. Experts prepare migrations rather than surprise breaks. Pair with `useDefineForClassFields` emit differences between modern and legacy class field behavior. Senior discussions often stress trade-offs—compile time, ergonomics, and library compatibility—so grounding your explanation in code review feedback, CI failures, and how typings align with actual JSON or DOM APIs reads as practical engineering rather than trivia.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-095',
    question:
      'How can `satisfies` still let a bug through if developers misunderstand it?',
    answer:
      '`satisfies` validates structure but does not add runtime checks—malformed data at runtime still possible if constructed dynamically without validation. Scenario: developer thinks `satisfies Schema` means “validated”—it only means static object literal matches type; API responses still need Zod. Interview expert: `satisfies` narrows literals but widening can still occur in downstream assignments if later assigned to wider typed variable. Teach that static types never replace runtime security. Combining `satisfies` with `as const` helps literals, not network boundaries. Misplaced confidence is the bug—education issue. Experts document boundaries between compile-time and runtime guarantees clearly in reviews. Senior discussions often stress trade-offs—compile time, ergonomics, and library compatibility—so grounding your explanation in code review feedback, CI failures, and how typings align with actual JSON or DOM APIs reads as practical engineering rather than trivia.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-096',
    question:
      'What is `import type` with `resolution-mode` attribute (TypeScript 5.0+)?',
    answer:
      'Allows `import type { X } from "./mod" with { "resolution-mode": "import" }` style attributes controlling how types resolve under `moduleResolution` bundler versus Node—addresses conditional type import scenarios in types-only positions for package `exports` conditions. Scenario: library types need `import` condition typings separate from `require`. Interview expert: niche feature for package authors wrestling dual conditions—read TS 5.0 announcement. Application devs rarely write this manually. Signals deep awareness of module system edge cases. Incorrect usage breaks only in specific consumers—test matrix wide. Part of expert toolkit for typing infrastructure, not daily components. Senior discussions often stress trade-offs—compile time, ergonomics, and library compatibility—so grounding your explanation in code review feedback, CI failures, and how typings align with actual JSON or DOM APIs reads as practical engineering rather than trivia.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-097',
    question:
      'Discuss soundness holes: excess property checking only on fresh object literals.',
    answer:
      'Assigning object literal directly to typed variable triggers excess property checks; assigning via intermediate variable widens and may skip excess checks—allowing extra props assignable structurally if target type is not exact. Scenario: API accepts `Options` but variable includes `hack: true` not in type—passes if not fresh literal. Interview expert: use exact types, branding, or `satisfies` at creation site to catch mistakes. Not a “bug” but documented behavior—experts design APIs knowing it. Sealed interfaces proposals may evolve story. Teach mid-level devs why two similar assignments differ in errors. Security-sensitive configs should validate at runtime regardless. Senior discussions often stress trade-offs—compile time, ergonomics, and library compatibility—so grounding your explanation in code review feedback, CI failures, and how typings align with actual JSON or DOM APIs reads as practical engineering rather than trivia.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-098',
    question:
      'How do you type a polymorphic `this` return for fluent builder methods?',
    answer:
      'Use `this` return type in class methods so subclasses return narrowed `this` type: `add(x: number): this { ... return this; }`. For functional builders, use recursive generics `T extends Builder<T>` pattern or interface with `chain(): this` carefully—gets verbose. Scenario: query builder API chain. Interview expert: breaks if not designed early—retrofit painful. Some patterns use `asserts` and private fields to hide construction steps. Advanced libraries use phantom parameters. Overuse in apps invites complexity—prefer simple objects sometimes. Demonstrates class `this` typing expertise beyond interfaces. Know limitations with inheritance and private fields affecting assignability. Senior discussions often stress trade-offs—compile time, ergonomics, and library compatibility—so grounding your explanation in code review feedback, CI failures, and how typings align with actual JSON or DOM APIs reads as practical engineering rather than trivia.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-099',
    question:
      'Scenario: You need a compile-time string set from runtime array—possible?',
    answer:
      'Purely at compile time, no—runtime array values are unknown to compiler. Use `as const` array and derive `type K = (typeof arr)[number]` when literals are static in source. If values come from network, type as `string` and validate at runtime; do not fake literal unions. Interview expert: beginners try to “cast” runtime strings to literal unions—unsound. Codegen can emit `as const` arrays from build-time data. Template literal types operate on compile-time unions only. Understanding limits prevents cargo-cult unsafe casts. Experts choose schema validation plus narrower application-level types after checks. Senior discussions often stress trade-offs—compile time, ergonomics, and library compatibility—so grounding your explanation in code review feedback, CI failures, and how typings align with actual JSON or DOM APIs reads as practical engineering rather than trivia.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-100',
    question:
      'As an expert wrap-up: how do you decide when a type-level program is “too clever” for a codebase?',
    answer:
      'Measure team comprehension: if only one person can change the type and PRs stall, simplify—even perfect types fail operationally. Cap conditional type depth; prefer runtime validation plus simpler types at boundaries. Scenario: 40-line nested `infer` type saves 10 lines of runtime checks but blocks onboarding—reject. Interview expert: align with lint rules and architecture RFCs; document patterns in ADR. Use gradual typing: strongest guarantees at module edges, pragmatic `unknown` inside exploratory code. TypeScript scales teams when types are readable. Expertise includes saying no to showcase types that harm velocity. The language is a tool for shipping reliable software, not a puzzle competition—balance beauty with maintainability and mentoring cost.',
    codeLanguage: 'typescript',
  },
]
