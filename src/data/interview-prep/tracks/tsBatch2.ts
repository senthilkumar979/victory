import type { InterviewQuestion } from '../types'

/** TypeScript ts-041–ts-080 — Mid-level (generics, utilities, modules, narrowing) */
export const TS_BATCH_2: InterviewQuestion[] = [
  {
    id: 'ts-041',
    question: 'What are generics and why use `<T>` on functions and types?',
    answer:
      'Generics parameterize types by other types, letting one implementation work for many concrete types while preserving relationships—`function identity<T>(x: T): T` returns the same type it receives. Without generics you choose `any` or overloads, losing precision. Scenario: a `firstOrDefault<T>(items: T[], predicate: (x: T) => boolean): T | undefined` keeps element type through the pipeline. Interview: generics are erased at emit but enforced at compile time. Constraints `T extends HasId` limit allowable `T` and unlock property access. Inference often fills `T` from arguments; explicit `identity<string>("a")` when needed. Excessive generic complexity hurts readability—balance. Generics underpin arrays `Array<T>`, Promises `Promise<T>`, and most utility types.',
    codeExample:
      'function wrap<T>(x: T): { value: T } {\n  return { value: x };\n}',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-042',
    question: 'What is `extends` as a generic constraint?',
    answer:
      '`T extends U` means type parameter `T` must be assignable to `U`, allowing access to `U` members inside generic code. Scenario: `function getId<T extends { id: string }>(x: T) { return x.id; }` works because constraint guarantees `id`. Interview: conditional types reuse `extends` in different syntax later—overload mental model: constraint vs condition. Multiple constraints intersect: `T extends A & B`. `keyof` constraints pair with indexed access for safe keys. If constraint too wide, errors become `Property does not exist`—tighten thoughtfully. Constraints enable default generic parameters `T = string` for optional customization. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-043',
    question: 'What do the utility types `Partial`, `Required`, and `Readonly` do?',
    answer:
      '`Partial<T>` makes all properties optional—handy for PATCH DTOs. `Required<T>` makes all properties required, stripping `?`. `Readonly<T>` maps properties to readonly recursively one level for objects—shallow. Scenario: building update payloads where only some fields change uses `Partial<User>`. Interview: these are mapped type aliases in lib.d.ts—learn by reading definitions. Deep variants need custom mapped types or libraries. `Partial` does not recurse into nested objects automatically—nested optionality differs. Combine with `Pick` for targeted partials. Know limitations when optional becomes `undefined` under `exactOptionalPropertyTypes`. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-044',
    question: 'What are `Pick`, `Omit`, and `Record`?',
    answer:
      '`Pick<T, K>` selects keys `K` from `T`. `Omit<T, K>` removes keys. `Record<K, V>` builds object type with keys from union `K` mapping to `V`. Scenario: `Pick<User, "id" | "email">` for public profile view. `Record<Status, number>` counts per status. Interview: `Omit` implemented as `Pick` with `Exclude` on keys. Watch `Record<string, T>` allowing any string key—sometimes too loose. These utilities speed API typing without hand duplication. For strict key unions from arrays, derive with `as const` and indexed access. `Pick`/`Omit` distribute over unions in ways you should test—surprises appear with union sources. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-045',
    question: 'What are `Exclude` and `Extract` on unions?',
    answer:
      '`Exclude<U, X>` removes union members assignable to `X`. `Extract<U, X>` keeps members assignable to `X`. Scenario: `Exclude<string | number | boolean, boolean>` yields `string | number`. `Extract` pulls function types from a union of callables and objects. Interview: foundation for `Omit` (`Pick` with `Exclude<keyof T, K>`). Understanding set-like operations on unions unlocks advanced string manipulation types later. They operate on types, not runtime values. Pair with `NonNullable` to drop `null`/`undefined`. Practice small unions on paper before giant template types. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-046',
    question: 'What are `ReturnType`, `Parameters`, and `ConstructorParameters`?',
    answer:
      'They introspect function and constructor types: `ReturnType<typeof fn>` extracts return type; `Parameters<typeof fn>` tuple of params; `ConstructorParameters<typeof C>` for `new` args. Scenario: wrapping a library function while preserving argument tuple `(...args: Parameters<typeof orig>) => ReturnType<typeof orig>`. Interview: breaks if overloads—resolves to last overload signature in some TS versions—know limitation. Use conditional inference for more precise extraction in expert cases. Avoid on generic functions before instantiation—often errors. Great for adapter layers and middleware typing without duplicating signatures manually. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-047',
    question: 'What is `NonNullable<T>` and `Awaited<T>`?',
    answer:
      '`NonNullable<T>` removes `null` and `undefined` from `T`. `Awaited<T>` unwraps Promise-like layers recursively—critical for accurate `async` return types in TS 4.5+. Scenario: `type U = Awaited<Promise<Promise<number>>>` resolves to `number`. Interview: `Awaited` models `await` behavior in type space for `Promise.all` typings improvements. Use when building generic async utilities. `NonNullable` cleans unions after filtering guards sometimes need help the compiler cannot infer. Together they reduce awkward conditional types beginners copy-paste. Check TS version support when adopting `Awaited` in libraries. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-048',
    question: 'What is a discriminated union and how do you narrow it?',
    answer:
      'Model variants with a shared literal discriminant field like `kind: "success" | "error"` and different payloads per case. Narrow with `switch (x.kind)` or `if` checks; TypeScript narrows `x` in each branch. Scenario: Redux actions or fetch results `{status:"ok", data}` vs `{status:"err", message}`. Interview: exhaustiveness uses `never` in default with `assertNever(x)`. Discriminant must be a literal type on each variant—string widening breaks narrowing if not `as const`. Optional discriminants weaken checks—keep required. This pattern is idiomatic TS and appears constantly in application code. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeExample:
      'type Ok = { kind: "ok"; data: string };\ntype Err = { kind: "err"; code: number };\ntype Res = Ok | Err;',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-049',
    question: 'Scenario: `switch` on a string union misses a new variant after refactor. How does TS help?',
    answer:
      'Assign the switch variable to `never` in `default` with a helper `function assertNever(x: never): never { throw new Error(); }`—when a union gains a case, `default` receives non-never and errors. Alternatively enable `noFallthroughCasesInSwitch` ESLint and keep unions in one module. Scenario: API adds `"pending"` status—compiler flags incomplete `switch` immediately. Interview: combine runtime error in `assertNever` for defense in depth. Without this pattern, `default` returns silently and bugs hide. Also consider `satisfies` on const status lists to keep literals synced. Document team standard so everyone uses the same exhaustiveness approach. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-050',
    question: 'What is a mapped type `{ [K in keyof T]: ... }`?',
    answer:
      'Mapped types iterate keys of `T` transforming each property type—utilities like `Readonly` and `Partial` are built this way. You can filter keys with `as` remapping (TS 4.1+) or `Exclude` combinations. Scenario: `type Nullable<T> = { [K in keyof T]: T[K] | null }` for form drafts. Interview: modifiers `?` and `readonly` can be applied per key with `+`/`-` prefixes. Homomorphic mapped types preserve optionality semantics—advanced detail. Errors in mapped types are hard to read—start small. This is the gateway to template literal types and conditional mapped types at expert tier. Practice reimplement `Pick` manually once. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-051',
    question: 'What are conditional types `T extends U ? X : Y`?',
    answer:
      'Conditional types select one of two types based on assignability check—distributing over naked type parameters in unions unless bracketed. Scenario: `type Flatten<T> = T extends Array<infer U> ? U : T` unwraps array element types using `infer`. Interview: distribution means `A|B extends U ? X : Y` becomes union of each branch—powerful but confusing. Wrap `T` in tuple `[T] extends [U] ? X : Y` to disable distribution when needed. Conditionals often paired with `infer` to extract pieces. They power most advanced utility libraries. Mid-level developers should read handbook examples before cargo-culting StackOverflow types. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-052',
    question: 'What does `infer` do inside conditional types?',
    answer:
      '`infer X` introduces a type variable inferred from a matching pattern in the `extends` clause—common for extracting array element, function return, or parameter types without manual lookups. Scenario: `type Element<T> = T extends (infer U)[] ? U : never`. Interview: `infer` only valid in true branch of conditional type positions per grammar rules. Multiple `infer` positions compare and must be consistent or error. Enables `ReturnType` implementation teaching. Mis-inferred never means pattern did not match—debug by simplifying. It is the type-level regex capture group metaphorically. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-053',
    question: 'What is template literal types?',
    answer:
      'String literal types can combine with unions in template patterns: `` `id-${number}` `` or event names `"click" | "hover"`. Cross product of unions expands combinations—can explode compile time if huge. Scenario: typed event bus `on<Name extends \`user:${string}\`>(...)`. Interview: pairs with intrinsic string manipulation types `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`. Useful for routing keys and CSS variables. Watch performance on large unions—CI timeouts happen. Beginners awe at demos; mid-level engineers weigh practicality. Still pure type system—no runtime string building. Combine with mapped types for keys generation. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-054',
    question: 'What is `noUncheckedIndexedAccess`?',
    answer:
      'When enabled, indexing `obj[key]` with `key: string` or array access returns `T | undefined` because the key might be missing—forces narrowing or optional chaining. Scenario: safer dictionary reads at cost of verbose code. Interview: great for new projects; painful migration for existing code touching hundreds of index accesses. Explains difference between `Record` with known finite keys versus broad `string` keys. Pair with non-null assertion `!` sparingly when logically guaranteed—document why. Improves honesty about partial data shapes from APIs. Team decision, not universal default yet. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-055',
    question: 'What is `exactOptionalPropertyTypes`?',
    answer:
      'Optional property `x?: number` cannot be explicitly set to `undefined` unless the type includes `undefined` explicitly—mirrors exact optional semantics from some APIs. Scenario: `fetch` body where omitting field differs from sending `undefined`. Interview: migration breaks code assigning `undefined` widely—fix by union `| undefined` or delete keys. Aligns with `exactOptionalPropertyTypes` in strict config sets for precision. Interacts with `Partial` and database ORMs—test thoroughly. Mid-level teams enable when domain distinguishes missing vs undefined. Read release notes when upgrading TS—behavior refined over versions. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-056',
    question: 'What is `const` type parameters (TypeScript 5.0)?',
    answer:
      'Generic functions can declare `const T` type parameter to infer literal types instead of widening: `function tuple<const T extends readonly unknown[]>(x: T) { return x; }` preserves tuple literals. Scenario: better typing for `routes` array without `as const` at call site. Interview: reduces boilerplate while keeping inference precise. Not a replacement for all `as const` patterns—evaluate case by case. Requires modern TS—document minimum version in libraries. Helps framework authors improve inference ergonomics. If inference too literal, widen with explicit type argument `tuple<string>(...)`. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-057',
    question: 'Scenario: You need nominal typing for two string IDs that must not mix. Approach?',
    answer:
      'Use branded types: `type UserId = string & { __brand: "UserId" }` with factory functions casting after validation, or `declare const brand: unique symbol; type OrderId = string & { [brand]: true };` Branded strings prevent accidentally passing `ProductId` where `UserId` expected while staying runtime strings. Scenario: GraphQL IDs or ULIDs from different tables. Interview: structural typing otherwise treats all strings equal—brands add compile-only discrimination. Zod/refinement can produce branded outputs. Document pattern for team consistency. Overuse annoys—apply at system boundaries. Expert variant uses `unique symbol` properties for stronger nominal separation. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeExample:
      'type UserId = string & { readonly __brand: unique symbol };',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-058',
    question: 'What is an assertion function `asserts x is Foo`?',
    answer:
      'Functions returning `asserts value is Type` tell TypeScript control flow narrows after call if function returns normally—if it throws otherwise. Scenario: `assertIsNumber(x)` throws if not number; following code treats `x` as `number`. Distinct from `x is number` predicates which return boolean. Interview: use for invariant enforcement in test utilities and internal APIs. Implementation must actually throw on failure or types lie. Pairs with Node `assert` module patterns. Less common than type guards but powerful for framework code. Read handbook section carefully—syntax placement matters on function signatures. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-059',
    question: 'What is `override` keyword on class methods?',
    answer:
      '`override` ensures a method actually overrides a base class method—TYpescript errors if superclass renames or removes method, catching drift during refactors. Enabled with `noImplicitOverride` flag. Scenario: large inheritance hierarchies in UI frameworks or parsers. Interview: purely compile-time; erased in JS output. If team avoids inheritance, feature rarely appears. Helps when subclassing third-party classes across version bumps. Pair with `abstract` patterns consciously. Not related to Java `override` runtime semantics—still only static check. Modern class feature for safer OO in TS. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-060',
    question: 'What is `satisfies` with union of object shapes?',
    answer:
      'You can validate an object against a union of possible shapes while preserving the specific literal subtype for each property compatible with the check. Scenario: CSS-like objects where keys must be valid but literals stay narrow for autocomplete. Interview: contrasts with annotation that widens and `as` that forces. Read errors when object matches none of union members—good feedback. Experiment in playground when migrating config objects. Works with array literals too. If confused, extract variable with `satisfies` then hover types in IDE. Key mid-level skill for config-heavy apps. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-061',
    question: 'How does TypeScript handle `catch` clause variables?',
    answer:
      'Historically `catch (e)` was `any`; with `useUnknownInCatchVariables`, `e` is `unknown`, forcing narrowing before use—aligns with safer JSON handling mindset. Scenario: log `e` with `instanceof Error` check or `toString()`. Interview: pattern `if (e instanceof Error) { ... } else { ... }`. In some environments `AggregateError` appears—prepare unions. Align ESLint try/catch rules with team style. Unknown catches reduce accidental property access on thrown strings or numbers. This is mid-level soundness upgrade from TS 4.4 onward. Document in CONTRIBUTING for library contributors. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-062',
    question: 'What is `moduleResolution: "bundler"` or `"Node16"` about?',
    answer:
      '`Node16`/`NodeNext` aligns TS with Node ESM resolution and `exports` fields in `package.json`—critical for dual packages. `bundler` trusts bundler rules for modern Vite/Webpack while relaxing some checks—faster iteration. Scenario: publishing a library—use Node16 resolution and `module` settings matching consumers or types lie. Interview: misconfiguration causes `import` type errors despite runtime working. Read TS handbook module reference whenever touching `package.json` exports. `types`/`typings` fields matter. Mid-level engineers own this during monorepo migrations—not just build engineers. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-063',
    question: 'What is `isolatedModules` and why do Babel/swc users enable it?',
    answer:
      'Ensures each file transpiles independently—disallows features needing cross-file type info to emit correctly, like `const enum` inlining assumptions or some `namespace` merges that Babel cannot see. Scenario: Vite + esbuild transpilation with `tsc` checking only—must align constraints. Interview: prevents silent divergence between typecheck and transform. `isolatedModules: true` is default in many starters. Explains why `export const enum` might be banned—use string unions instead. Keeps emit faithful per file for fast tools. If errors appear after enabling, refactor flagged constructs rather than disabling blindly. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-064',
    question: 'What is `verbatimModuleSyntax`?',
    answer:
      'Forces explicit `import type`/`export type` for type-only imports/exports, preventing accidental value imports that erase to nothing confusing bundlers. Part of modern strict module hygiene in TS 5+. Scenario: side-effect imports mistakenly typed as type-only disappear at emit—runtime breaks. Interview: pairs with ESLint `consistent-type-imports`. Migration adds churn but clarifies intent in code review. Helps dual emit CJS/ESM packages. Read release blog for rationale. Mid-level teams adopt during TS 5 upgrades gradually. Not beginner-first flag—enable after understanding `import type`. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-065',
    question: 'What are triple-slash directives and should you use them?',
    answer:
      'Legacy `/// <reference path="..." />` and `types` references include declaration files explicitly—mostly replaced by `import` and `tsconfig` `types` array. Scenario: maintaining ancient `.ts` files in DefinitelyTyped tests. Interview: avoid in new app code—use modules. Still appear in autogenerated headers occasionally. Understanding helps reading old codebases. `/// <reference types="jest" />` sometimes simpler for global augment in tests—acceptable locally. Prefer `tsconfig` `types` for globals. Know history to avoid cargo-cult copying from outdated tutorials. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-066',
    question: 'Scenario: Circular imports between two `.ts` files cause confusing types. Fixes?',
    answer:
      'Restructure modules to extract shared types into a third `types.ts` with type-only imports, or convert value cycles to dynamic `import()` at runtime boundaries. Use `import type` to break type-only cycles that confuse emit. Scenario: models importing services importing models—introduce interfaces file. Interview: `tsc --traceResolution` helps debug. Sometimes `namespace` or lazy initialization functions break runtime cycles while types remain clean. ESLint `import/no-cycle` warns early. Not unique to TS—JS has runtime circular issues too—but TS surfaces first during checking. Plan module graph intentionally in features. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-067',
    question: 'What is `declare global` / `declare module` augmentation?',
    answer:
      '`declare global { interface Window { myField: string } }` extends globals in a module file. `declare module "foo" { export function bar(): void }` augments existing module declarations. Scenario: attaching telemetry to `globalThis` in Node with typing. Interview: augmentation must be consistent—duplicate identifiers conflict. Use `export {}` to make file a module when using `declare global`. For npm packages without types, minimal `declare module` shims unblock compilation temporarily—replace with real types later. Know difference between value and type augmentation paths. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-068',
    question: 'What is `enum` vs `const enum` performance trade-off?',
    answer:
      '`const enum` inlines members at compile time—zero runtime object—but breaks if consumers compile without knowing invariants across project boundaries or `isolatedModules` forbids. Regular `enum` emits lookup objects—runtime cost but stable. Scenario: library should avoid `const enum` unless inlined bundle guaranteed—otherwise consumer `tsc` may diverge. Interview: string unions + `as const` often replace both. If bundle size critical and single build pipeline, `const enum` debated. Read TS handbook warnings. Mid-level library authors weigh DX versus consumer compile graphs. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-069',
    question: 'How do you type `this` in React class components (mid-level historical)?',
    answer:
      'Class components declare `state` and props interfaces; event handlers use arrow class fields or `bind` to preserve `this`. Typing refs with `React.createRef<ElementType>()`. Scenario: legacy codebase interview question—most new code uses function components. Interview: `this` parameter trick rarely applies; instance methods use class property arrows. Know `Component<P,S>` generics. For hooks codebases, question tests understanding of migration. Still valid TS patterns for maintaining older UI. Demonstrates class typing alongside functional style preference in modern React. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-070',
    question: 'What is `ReadonlyArray<T>` versus `readonly T[]`?',
    answer:
      'Nearly equivalent for arrays; `ReadonlyArray` is interface with methods returning readonly views, `readonly T[]` syntax sugar preferred stylistically. Scenario: function accepting read-only input should not require mutable array from caller. Interview: assignability: mutable arrays assign to readonly, not vice versa. Tuple readonly forms `readonly [number, string]` protect positions. Helps express intent in public APIs. Combine with `as const` outputs. Small stylistic choice impacts readability in large codebases—lint rules sometimes enforce one. Understand immutability direction in assignments. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-071',
    question: 'What is `as const satisfies` combination pattern?',
    answer:
      'Validate wide union conformance while preserving narrow literals: `const theme = { mode: "dark" } as const satisfies ThemeConfig` ensures shape matches `ThemeConfig` but keeps `mode` literal `"dark"` not widened to `string`. Scenario: design tokens and config maps. Interview: order matters—`satisfies` then `as const` vs combined syntax per TS version docs—follow current handbook. Reduces duplication of type alias and const assertion. If error, message points to offending key—developer-friendly. Mid-level pattern spreading in TS 5 examples. Practice in playground to build intuition. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-072',
    question: 'What is `NoInfer<T>` utility (TS 5.4+)?',
    answer:
      'Prevents type inference from using positions wrapped with `NoInfer` when solving generics—useful when you want later arguments not to widen earlier inferred literals. Scenario: `defineConfig<T>(defaults: T, options: Partial<NoInfer<T>>)` keeps `T` anchored to defaults. Interview: niche but solves real generic inference bugs in config APIs. Requires recent TS—feature gate libraries. Read release notes example carefully before applying. Mid-level authors of DSLs encounter this. Without it, hacks involved dummy type parameters—cleaner now. Document minimum TS version if exporting helper types relying on it. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-073',
    question: 'Scenario: Third-party `.d.ts` is wrong. What steps do you take?',
    answer:
      'Patch locally with `declare module` augmentation or fork types under `@types` version pin; open upstream PR to DefinitelyTyped or library. Use `patch-package` for temporary fixes in CI. Avoid `as any` at call site—narrow scope with `interface` augmentation matching real runtime. Scenario: function optional param incorrectly required—augment module merging interface overload. Interview: `skipLibCheck` might hide issue—verify. Document patches in README for team. Long-term wrong types erode trust in compiler—invest in fixes. Sometimes wrap library in thin typed adapter module you control. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-074',
    question: 'What is `keyof` with `as` remapping in mapped types?',
    answer:
      'TS 4.1+ allows `as NewKey` clause to rename or filter keys while mapping: `{ [K in keyof T as \`${string & K}Changed\`]: T[K] }` pattern for prefixed keys. Scenario: event naming transforms. Interview: can filter with `as K extends \`on${string}\` ? K : never` style conditional key transforms—gets expert quickly but mid-level should recognize syntax reading libraries. Errors become gnarly—build incrementally. Enables powerful API typing in libraries like tRPC internals. Practice reading emitted hover types from small examples before production use. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-075',
    question: 'What is `strictFunctionTypes` and callback parameter behavior?',
    answer:
      'Under strict function types, function parameters are checked contravariantly for function types in object properties except methods which remain bivariant for historical reasons—catch unsound callbacks. Scenario: assigning broader parameter function where narrower expected now errors—good. Interview: `strictFunctionTypes` part of `strict`. Explains weird errors around event handlers assigning incompatible signatures. Method bivariance hack documented in handbook—use property function type to enforce strictness if needed. Mid-level soundness topic connecting to variance theory lightly. Helps understand why some React prop types seem picky. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-076',
    question: 'How do you type a generic React `useState` initial value from API?',
    answer:
      'Annotate state `useState<User | null>(null)` or `useState<User>()` with default requiring assertion if shape partial—prefer union with loading states `User | undefined` pattern. Scenario: fetch user then set—discriminated union `{status:"idle"|"loading"|"ok", user?:User}` models better than many separate booleans. Interview: inference from `null` alone becomes `null` only—annotation needed. Use Zod inferred types `z.infer<typeof schema>` for parity with runtime validation. Not React-exclusive—TS pattern with hooks. Shows practical bridging of TS types with UI state machines mid-level engineers implement daily. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-077',
    question: 'What is `Project references` in `tsconfig`?',
    answer:
      'Split monorepo into subprojects with `composite: true`, `references` array pointing to other `tsconfig` projects—enables incremental builds and ordered compilation. Scenario: `packages/app` references `packages/lib` for types without rebuilding unnecessarily. Interview: requires `declaration` emit for referenced libs usually. `tsc -b` builds graph. Misconfigured paths cause phantom errors. Mid-level monorepo maintainers configure this. Helps scale TS beyond single mega-config. Understand `paths` mapping vs project references interplay. Not beginner setup—appears in growing codebases. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-078',
    question: 'What is `@deprecated` JSDoc / TS support?',
    answer:
      'Mark APIs deprecated with JSDoc `@deprecated reason`—editors strike through and show warnings. TS 4.0+ improved support. Scenario: guiding consumers off legacy function toward replacement. Interview: pair with runtime `console.warn` optionally for libraries. Not a hard compiler error unless ESLint rule added. Useful in large internal platforms. TypeScript reads JSDoc in JS files with `checkJs` too—cross-language. Documentation and types together improve migration. Mid-level platform teams standardize deprecation timelines in comments and changelogs matching `@deprecated`. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-079',
    question: 'Scenario: Union type too large slows `tsc`. What investigation steps?',
    answer:
      'Use `--extendedDiagnostics`, `--generateTrace`, or `--incremental` profiling to find hot types; simplify huge template literal cross products; replace mega unions with string type and runtime validation; split types across modules to aid caching. Scenario: autogenerated API unions with thousands of string literals. Interview: sometimes `simplify` conditional types or avoid nested mapped type explosions. Trade precise types for pragmatic `string` at boundaries. Consult TS wiki performance section. Mid-level maintainers balance beauty and compile time. Not everyday app issue until codegen pipelines grow. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
  {
    id: 'ts-080',
    question: 'What is `checkJs` / `// @ts-check` for JavaScript files?',
    answer:
      'Enable type checking in `.js` files using JSDoc types—gradual migration path without converting to `.ts` immediately. `// @ts-nocheck` disables per file. Scenario: legacy file add JSDoc `@param {string} name` for safety. Interview: less ergonomic than TS syntax but valuable for incremental adoption. `allowJs` must be on. Types expressed via `@typedef`. Good for Node scripts before full conversion. Mid-level engineers use this bridging teams off pure JS. Know limitations versus full TS—some advanced types awkward in JSDoc. Prefer `.ts` long term for new code. Mature codebases pair these concepts with incremental strictness, shared lint rules, and honest types at module boundaries so inference stays helpful without hiding impossible states; explaining that balance is what separates confident mid-level answers from shallow memorization.',
    codeLanguage: 'typescript',
  },
]
