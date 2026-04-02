import type { InterviewQuestion } from '../types'

/** JavaScript js-001–js-040 — Beginner (language fundamentals only) */
export const JS_BATCH_1: InterviewQuestion[] = [
  {
    id: 'js-001',
    question: 'What is JavaScript, and where does it typically run?',
    answer:
      'JavaScript is a high-level, dynamic programming language that conforms to the ECMAScript standard. It was created for scripting behavior in web browsers—updating the DOM, handling events, and talking to servers—so it is the primary language of client-side web interactivity. Today it also runs on servers via runtimes like Node.js and Deno, and in embedded or desktop contexts through various engines. The language is single-threaded in the sense of one call stack per realm but uses an event loop for asynchronous work. It is garbage-collected, prototype-based for objects, and loosely typed: variables do not declare static types in plain JS. Interview answers should separate the language (ECMAScript) from host environments (browser APIs like `fetch` or `document` are not part of the core language spec, though they are essential in web development). Knowing this boundary helps when learning pure JavaScript versus platform APIs.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-002',
    question: 'What is the difference between `let`, `const`, and `var`?',
    answer:
      '`var` is function-scoped or globally scoped, is hoisted and initializes as `undefined`, and allows redeclaration in the same scope—behavior that often surprises beginners. `let` is block-scoped, is hoisted into a temporal dead zone until its declaration line (access before init throws `ReferenceError`), and cannot be redeclared in the same block. `const` is also block-scoped and TDZ-governed but binds a constant reference: you cannot reassign the variable, though object properties of a `const` object can still mutate unless frozen. Modern style prefers `const` by default, `let` when reassignment is needed, and avoids `var` in new code. In loops, `let` creates a fresh binding per iteration for closures, while classic `var` in a `for` loop shares one binding—classic interview trap. Understanding scoping rules prevents subtle bugs in callbacks and conditionals.',
    codeExample:
      'const base = { x: 1 };\nbase.x = 2; // OK\n// base = {}; // TypeError',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-003',
    question: 'What are JavaScript’s primitive types?',
    answer:
      'ECMAScript defines seven primitive types: `undefined`, `null`, `boolean`, `number`, `bigint`, `string`, and `symbol`. Primitives are immutable: operations return new values rather than mutating the original (for example, string methods return new strings). Everything else is an object, including arrays, functions, dates, and plain objects. `typeof null` historically returns `"object"`—a long-standing bug you should mention in interviews. `typeof` helps distinguish primitives at runtime though it lumps all objects as `"object"` unless you refine with `Array.isArray` or other checks. `BigInt` represents integers beyond `Number.MAX_SAFE_INTEGER`. `Symbol` creates unique property keys. Junior candidates should connect primitives to pass-by-value semantics when copying variables, while object references are shared when assigned.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-004',
    question: 'Explain `null` versus `undefined` in everyday code.',
    answer:
      '`undefined` means a variable has been declared but not assigned, a missing object property, or the default return of a function without `return`. The language assigns `undefined` automatically in those situations. `null` is an intentional empty value programmers assign to signal “no object” or cleared state—often from APIs that distinguish “missing” from “explicitly empty.” Both are falsy. `null == undefined` is true due to abstract equality rules, but `null === undefined` is false. `typeof undefined` is `"undefined"` while `typeof null` is `"object"`. Style guides sometimes prefer `undefined` for internals and `null` for public APIs. Optional chaining and nullish coalescing (`??`) treat `null` and `undefined` as nullish, unlike `||` which treats all falsy values alike. Clear mental models reduce defensive checks scattered everywhere.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-005',
    question: 'What is the difference between `==` and `===`?',
    answer:
      'The triple equals operator `===` checks value and type without coercion: if types differ, the result is false. The double equals `==` allows type coercion via abstract equality algorithm rules—for example, `0 == false` is true and `"" == false` is true—which surprises readers and hides bugs. Almost all teams and linters recommend `===` and `!==` as default. Knowing `==` still matters for reading legacy code and spec trivia. Special cases include `NaN === NaN` being false (use `Number.isNaN`), and `Object.is` for distinguishing `-0` and `+0`. Interviewers want to hear that predictable comparisons reduce defects. When you truly need coercion, explicit `Number()`, `String()`, or `Boolean()` calls document intent better than relying on `==`.',
    codeExample:
      "0 == false  // true\n0 === false // false",
    codeLanguage: 'javascript',
  },
  {
    id: 'js-006',
    question: 'What are truthy and falsy values in JavaScript?',
    answer:
      'In a boolean context—`if`, `while`, logical operators—values coerce to boolean. Falsy values are: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, and `NaN`. Everything else is truthy, including empty arrays `[]`, empty objects `{}`, and the string `"0"`. This trips beginners who think empty array is falsy. Use explicit comparisons (`length === 0`) instead of relying on truthiness for collections. `Boolean(x)` or double negation `!!x` normalize to boolean. `&&` and `||` return one of the operands, not strictly boolean, which enables idioms like `name || "guest"` but also footguns with `0` or `""` as valid data—hence `??` for nullish-only defaults. Interview answers should show awareness of default-parameter behavior versus `||` in function signatures.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-007',
    question: 'How do template literals work?',
    answer:
      'Template literals use backticks and embed expressions inside `${}` which are evaluated and coerced to strings. They support multi-line strings without escape sequences, improving readability for HTML snippets or SQL strings (though embedding raw SQL in client code is usually wrong architecturally). Tagged templates pass cooked and raw string arrays plus values to a function, enabling libraries like styled-components or i18n helpers. Compared to concatenation with `+`, templates reduce noise. Edge cases include nested backticks and needing to escape `${` when literal. Interview mention: tagged templates receive the exact spacing and line breaks of the source. For beginners, focus on interpolation and multiline; for mid-level, mention tags. Always remember template literals are strings—they do not sanitize HTML for XSS.',
    codeExample:
      'const n = 3;\n`You have ${n} items`;',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-008',
    question: 'How do you create and use plain objects in JavaScript?',
    answer:
      'Object literals use curly braces with comma-separated key-value pairs. Keys are strings or symbols; unquoted keys must be valid identifiers and are still string keys at runtime. Access with dot notation when the key is fixed (`obj.name`) or bracket notation when dynamic (`obj[key]`). Bracket notation also allows keys that are not valid identifiers (`obj["my-key"]`). Objects are reference types: assigning `const a = obj; b = obj` shares one object. Spread `{ ...obj }` copies enumerable own properties shallowly. `Object.keys`, `values`, and `entries` enumerate properties for iteration. Prototype properties are not own properties unless defined directly. Beginners confuse objects with JSON: JSON is a text format; objects live in memory with methods and undefined values disallowed in JSON.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-009',
    question: 'What are arrays in JavaScript, and how do they differ from typed arrays?',
    answer:
      'JavaScript arrays are dynamic lists implemented as objects with numeric string keys and a `length` property that tracks the highest index plus one—not always dense memory like low-level arrays. They can hold mixed types, though homogeneous arrays are clearer. Methods like `push`, `pop`, `shift`, and `unshift` mutate the array; `concat` and `slice` return new arrays. `Array.isArray` distinguishes real arrays from array-like objects. Typed arrays (`Uint8Array`, etc.) back binary data buffers and behave closer to fixed numeric storage—relevant for WebGL, files, and performance. Interviewers like hearing that `length` is writable and can create sparse holes if set manually. Iteration with `for...of` or `forEach` skips empty slots differently than `map` in some cases—another subtle topic for later levels.',
    codeExample:
      'const xs = [1, 2, 3];\nxs.push(4);',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-010',
    question: 'Explain `for`, `for...of`, and `for...in` loops.',
    answer:
      'Classic `for` loops give index control and work well when you need the index or custom stepping. `for...of` iterates iterable values—arrays, strings, Maps, Sets, and generators—yielding each element, which is usually what you want for arrays instead of manual indexing. `for...in` enumerates enumerable property keys of an object including inherited ones unless filtered with `hasOwnProperty`, so it is a poor default for arrays (indices as strings, prototype pollution surprises). Use `for...in` for plain object key iteration when appropriate or prefer `Object.keys`. Interview trap: modifying an array while iterating forward can skip elements—iterate backwards or build a new list. Understanding iterators unlocks `for...of` beyond built-ins when you learn generator functions later.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-011',
    question: 'What is a function declaration versus a function expression?',
    answer:
      'A function declaration `function foo() {}` is hoisted fully—you can call `foo` before its line in the same scope because the binding is created during creation phase. A function expression assigns a function value to a variable: `const foo = function () {}` or arrow form; it follows `let`/`const` TDZ rules and is not callable above its declaration. Named function expressions help stack traces (`const f = function inner() {}`). Hoisting differences matter in conditional blocks where declarations behave oddly in sloppy historical patterns—use `const` assigned functions for clarity. Interviewers check whether you know arrows are not hoisted like declarations and cannot be used as constructors. Choose declarations for top-level named helpers; expressions when passing inline or assigning conditionally.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-012',
    question: 'What are arrow functions, and how do they differ from regular functions?',
    answer:
      'Arrow functions provide concise syntax and lexically bind `this` from the enclosing scope instead of getting their own dynamic `this` determined by call site. They cannot be used as constructors with `new`, have no `prototype` property, and do not have an `arguments` object (use rest parameters). They suit callbacks where you want outer `this`, such as event handlers in classes if not using class fields. For methods that need their own `this`, prefer regular methods or explicit binding. Arrows are anonymous unless assigned to a variable—hurting debug names unless named variable is used. Interview mention: `return { a: 1 }` needs parentheses `() => ({ a: 1 })` because braces would start a block. Understanding lexical `this` prevents classic React class or jQuery confusion when migrating mental models.',
    codeExample:
      'const add = (a, b) => a + b;',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-013',
    question: 'What does `typeof` return, and what are its quirks?',
    answer:
      '`typeof` is a unary operator returning a string describing the type of its operand. It distinguishes `"string"`, `"number"`, `"bigint"`, `"boolean"`, `"undefined"`, `"symbol"`, and `"function"` for callable objects. Non-callable objects return `"object"`, including `null`—the famous spec quirk. Arrays are `"object"`; use `Array.isArray`. Functions are `"function"` even though they are objects. `typeof` an undeclared variable throws in modules and strict sloppy global cases differ—`typeof undeclared` is `"undefined"` in browsers for global lookup safety. Interviewers like `typeof NaN` being `"number"`. For precise checks, combine `typeof` with other predicates. It is a quick guard for optional APIs but not a complete type system. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-014',
    question: 'How does `JSON.stringify` and `JSON.parse` work?',
    answer:
      '`JSON.stringify` converts JavaScript values to a JSON string: objects, arrays, strings, numbers, booleans, and `null` serialize; `undefined`, functions, and symbols inside objects are omitted or dropped in arrays as `null` depending on position. Circular references throw. A `replacer` function or array filters keys; `space` pretty-prints. `JSON.parse` parses JSON text to values with an optional `reviver` to transform results—useful for reviving dates if you encode them as strings and convert in reviver. JSON is strict: keys must be double-quoted strings. Security note: never `JSON.parse` untrusted data without validation if it feeds into dangerous sinks, though parsing itself is not `eval`. Interview: know `BigInt` serialization requires a custom replacer in modern engines. These two functions are the backbone of HTTP JSON payloads.',
    codeExample:
      'JSON.stringify({ a: 1 });\nJSON.parse(\'{ "a": 1 }\');',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-015',
    question: 'What is `try` / `catch` / `finally` in JavaScript?',
    answer:
      '`try` wraps code that may throw; `catch` receives the thrown value (any type, though `Error` instances are conventional). `finally` runs whether `try` completes, throws, or returns—useful for cleanup unless the process exits abruptly. If `try` returns and `finally` also returns, the `finally` return wins—an interview edge case. Async errors in promises are not caught by surrounding `try/catch` unless you `await` inside an async function. Synchronous `try/catch` handles synchronous throws only. Custom errors extend `Error` with `class MyError extends Error` for clearer semantics. Never swallow errors silently in `catch` without logging in production systems. Beginners should practice rethrowing after logging when upper layers should decide. This structure is fundamental before learning promise error handling.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-016',
    question: 'What is strict mode (`"use strict";`)?',
    answer:
      'Strict mode is a restricted variant of JavaScript that catches common mistakes and disables confusing features. It can be enabled per function or for whole scripts/modules (ES modules are strict by default). It forbids assigning to undeclared variables, deletes plain names, duplicate parameter names in simple lists, and `this` being the global object in plain function calls (it becomes `undefined` instead in many cases). Octal literals and `with` are disallowed. It enables more optimizations in engines. Interview answer: modules are strict—no pragma needed. Legacy scripts opt in at top. Strict mode makes code more predictable for teams. Some errors move from silent failures to throws, which is good for quality. Know that concatenated scripts share one strict pragma scope incorrectly if placed only in inner parts—place at file top.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-017',
    question: 'What is automatic semicolon insertion (ASI), and why does it matter?',
    answer:
      'JavaScript parsers insert semicolons in certain newline positions when statements seem complete, following ASI rules. This can break return statements if you newline before an object literal—`return` followed by newline then `{` inserts semicolon after `return`, returning `undefined`. Similar issues hit `break`/`continue` with labels. Many teams use linters with semicolon-required or no-ASI-safe newline rules. ASI is not “optional semicolons always work”—placement matters. Interviewers test whether you know the classic `return` gotcha. Prettier often adds semicolons or formats to avoid hazards. Understanding ASI is reading spec behavior, not recommending clever minimalism. When in doubt, explicit semicolons or formatter-enforced style remove debate. IIFE prefixes like `;(function(){})()` prevent prior line concatenation issues in bundles.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-018',
    question: 'What are default parameters and rest parameters?',
    answer:
      'Default parameters let functions define fallback values when `undefined` is passed: `function f(a = 1) {}`—note that `null` does not trigger the default, only `undefined`. Default expressions evaluate at call time left-to-right and can reference earlier parameters. Rest parameters `function f(...args)` collect remaining arguments into a real array, unlike the legacy `arguments` object which is array-like. Rest must be last in the parameter list. Combining defaults and destructuring parameters cleans up option objects. Interview: `arguments` is not available in arrow functions—use rest. Defaults improve API ergonomics without manual `x = x || 1` that breaks valid falsy `0`. Understanding the difference between `null` and `undefined` for defaults prevents subtle API bugs.',
    codeExample:
      'function sum(...n) {\n  return n.reduce((a, b) => a + b, 0);\n}',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-019',
    question: 'What is the spread operator (`...`) for arrays and objects?',
    answer:
      'Spread expands iterables into individual elements in array literals (`const a = [...b, 3]`) or object enumerable own properties into object literals (`const o = { ...defaults, ...input }`). It performs shallow copies: nested objects still share references. Order matters for overriding keys in objects. In function calls, spread passes elements as separate arguments (`fn(...arr)`). It requires iterables—plain objects are not iterable for array spread. Interview mention: spread in objects is ES2018; older environments need transpilation. Combining spread with `Set` dedupes arrays: `[...new Set(xs)]`. Know that spread clones are not deep—use structured cloning or libraries for deep copies. Spread readability beats `apply` for many `Math.max` patterns: `Math.max(...nums)`.',
    codeExample:
      'const copy = { ...user, name: "Pat" };',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-020',
    question: 'How do string methods like `slice`, `substring`, and `indexOf` work?',
    answer:
      '`indexOf` and `includes` search substrings, returning index or boolean. `slice(start, end)` extracts a substring with optional negative indices counting from end—it does not mutate the original string because strings are immutable. `substring` is similar but handles negative indices differently (often coerced to zero), so `slice` is usually preferred. `split` breaks on delimiters into arrays; `join` reverses for arrays of strings. `trim` removes whitespace. `replace` replaces first match or all with regex `g` flag; `replaceAll` is explicit for strings. `toLowerCase`/`toUpperCase` normalize case. Interview: repeated concatenation in hot loops creates many intermediate strings—`join` on array is often better. Unicode-aware operations may need `normalize` or segmenters for grapheme clusters in international apps. For beginners, immutability and index basics are the core lesson.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-021',
    question: 'How do `parseInt`, `parseFloat`, and `Number` differ?',
    answer:
      '`parseInt(string, radix)` parses from the start until invalid character; always pass radix `10` to avoid legacy octal confusion on leading zeros. `parseFloat` parses decimal floats until invalid stop. `Number(value)` uses type coercion rules and returns `NaN` on failure—stricter for whole-string validity than `parseInt` partial parsing. `Number.isNaN` checks for `NaN` without coercion unlike global `isNaN`. `Number.isFinite` rejects `Infinity`. Unary `+` is shorthand coercion to number with readability trade-offs. Interview edge: `parseInt("8n")` vs BigInt confusion—keep types separate. For integers beyond safe range use `BigInt` literals. Validating user input should use explicit parsing and range checks, not loose `==` tricks. These APIs appear constantly in forms and URL parameters.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-022',
    question: 'What is `NaN`, and why do comparisons with `NaN` behave oddly?',
    answer:
      '`NaN` means “not a number” as an IEEE-754 floating-point sentinel from invalid math like `0/0` or failed parses. Any comparison with `===` to `NaN` is false, including `NaN === NaN`. Use `Number.isNaN` to detect `NaN` reliably; global `isNaN` coerces non-numbers first and can misreport. `Object.is(NaN, NaN)` is true. Arrays containing `NaN` cannot be found with `indexOf` using `===` semantics—use `findIndex` with `Number.isNaN`. Cleaning data pipelines must treat `NaN` distinctly from `null` or `undefined`. Interview mention: aggregate statistics must filter `NaN` or results propagate bad values. Understanding floating-point also explains `0.1 + 0.2 !== 0.3`—use rounding or decimal libraries for money at application boundaries.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-023',
    question: 'How does the `Date` object work in basic usage?',
    answer:
      'The built-in `Date` represents an instant in time internally as milliseconds since Unix epoch UTC, though local string displays depend on timezone. `new Date()` captures now; `new Date(isoString)` parses ISO 8601; invalid parse yields `Invalid Date`—always validate with `isNaN(date.getTime())`. Mutators like `setFullYear` modify the object in place—dates are mutable unlike strings. `getMonth` is zero-based—a classic bug. For serious calendar logic, teams increasingly adopt `Temporal` as it stages into the language, but many codebases still use `Date` or libraries like date-fns or Luxon. Interview: storing UTC ISO strings in JSON avoids ambiguity. Local formatting uses `toLocaleString` with `Intl` options. Beginners should avoid parsing locale-specific strings without a known format.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-024',
    question: 'What are `Math` object basics you use often?',
    answer:
      '`Math` provides static methods and constants: `Math.floor`, `ceil`, `round`, `trunc` for rounding strategies; `Math.min`/`Math.max` with spread for arrays; `Math.random` for pseudo-random floats in `[0,1)`—not cryptographically secure; `Math.abs`, `sign`, `hypot`, `pow`, `sqrt` for numeric utilities; `Math.PI` and `Math.E` constants. There is no `Math.sum` built-in—use `reduce`. Interview caveat: `Math.random` seeding is engine-defined—use Web Crypto `getRandomValues` for security needs in browsers or `crypto` in Node. Rounding errors still stem from IEEE doubles—`toFixed` returns string. For clamping values, `Math.min(Math.max(x, lo), hi)` is idiomatic. Junior interviews expect recognition of `Math` as a namespace object, not a constructor—`new Math()` is nonsense. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-025',
    question: 'What is destructuring assignment for arrays and objects?',
    answer:
      'Destructuring unpacks values from arrays or properties from objects into bindings: `const [a, b] = pair` and `const { name, age } = user`. Default values apply for missing properties: `const { x = 1 } = obj`. Renaming uses `const { name: fullName } = obj`. Nested patterns mirror structure. Swapping variables without temp uses `([a, b] = [b, a])`. Function parameters can destructure for options objects. It improves readability versus repetitive `obj.foo` access. Interview: destructuring uses `ToObject` on `null`/`undefined` and throws—guard with defaults `const { x } = obj ?? {}`. Rest in destructuring collects remaining properties `const { a, ...rest } = obj`. Order matters for arrays; for objects, names map regardless of order. It is syntactic sugar but ubiquitous in modern JS.',
    codeExample:
      'const { id, ...fields } = payload;',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-026',
    question: 'What is the `switch` statement, and what should beginners watch for?',
    answer:
      '`switch (expr)` compares with `===` to `case` labels, not loose equality. Each `case` usually ends with `break` or `return`; fall-through runs subsequent cases unless you intentionally group cases. `default` handles no match. For string unions, `switch` can be clearer than long `if/else` chains. Common bug: forgetting `break` causes accidental fall-through. Another bug: duplicating logic across cases—extract helpers. Some style guides prefer object maps or `Map` for dispatch tables when data-driven. Interview: `switch(true)` pattern exists for range checks but is stylistically controversial. With TypeScript, exhaustiveness checking on discriminated unions often replaces `switch`—but in pure JS, `switch` remains fine. Document intentional fall-through with comments to satisfy reviewers.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-027',
    question: 'What is the `arguments` object in non-arrow functions?',
    answer:
      'Traditional `function` declarations bind an `arguments` array-like object containing all passed parameters, useful before rest parameters existed. It is not a real array—convert with `Array.from(arguments)` or spread in modern code. Arrow functions do not have `arguments`; use rest parameters instead. In strict mode, `arguments` does not alias named parameters when reassigned—legacy sloppy mode had coupling. Interview: prefer `...args` for new code. `arguments.callee` is forbidden in strict mode and harms optimization. Understanding `arguments` helps read older libraries. Default and rest parameters reduce its necessity. If you see `arguments` in modern codebases, question whether refactor is due. It ties into how engines optimize known arity in hidden classes conceptually.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-028',
    question: 'What does it mean that strings are immutable in JavaScript?',
    answer:
      'String methods return new strings; they never mutate the original sequence in place. Variables can be reassigned to new strings, but individual characters cannot be set via index like some languages—use slice concatenation or arrays for mutation-heavy workflows. Immutability helps with hashing keys and predictable sharing. Interview connect: this is why large string building in loops uses `Array.join` or template accumulation patterns. Surrogate pairs for emoji mean `length` counts UTF-16 code units, not always user-perceived characters—`[...str]` or iterators handle better for grapheme-sensitive work with additional libraries. Comparing strings uses lexicographic Unicode order by code unit, which may surprise for localized sorting—`localeCompare` helps. Immutability also means passing strings to functions without fear of callee mutation.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-029',
    question: 'What are common `Array` methods: `map`, `filter`, `find`, `some`, `every`?',
    answer:
      '`map` transforms each element into a new array of the same length. `filter` keeps elements where predicate true. `find` returns first match or `undefined`; `findIndex` returns index or `-1`. `some` tests if any element matches; `every` tests all. They do not mutate the original array (except the callback could mutate elements if they are objects—avoid). They skip holes in sparse arrays inconsistently—avoid sparse arrays. Interview: `forEach` executes side effects and returns `undefined`; cannot break early—use `for...of` with `break`. Chaining `map`/`filter` creates intermediate arrays—fine for small data; for huge datasets consider single-pass loops or iterators. These methods underscore functional style in modern JS teaching. Understanding callback parameters `(element, index, array)` helps debugging.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-030',
    question: 'What is `Array.prototype.sort`, and what are its pitfalls?',
    answer:
      '`sort` mutates the array in place and returns the same array reference—surprising if you expected immutability. Default sort converts elements to strings and compares UTF-16 code units, so `[10, 2, 1].sort()` misorders numbers as `"10"`, `"1"`, `"2"`. Pass a comparator `(a, b) => a - b` for numeric ascending. Comparator should be consistent and transitive to avoid engine-dependent chaos. For stability, modern ECMAScript requires stable sort—older engines varied. Interview: copy before sort if immutability needed: `[...xs].sort(...)`. Sorting objects requires choosing a key in comparator. Locale-aware sorting uses `localeCompare` in comparator with options. Mutating while sorting is undefined behavior—don’t. Knowing default string sort prevents classic interview trick questions.',
    codeExample:
      'nums.sort((a, b) => a - b);',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-031',
    question: 'What is a shallow copy versus assignment for objects and arrays?',
    answer:
      'Assignment `const b = a` copies the reference: both variables point to the same object, so mutating `b.x` changes `a.x`. A shallow copy duplicates top-level keys but nested objects still alias: `Object.assign({}, obj)` or `{ ...obj }`. Deep copy duplicates nested graphs—`structuredClone` in modern environments, or libraries, or `JSON` round-trip with loss of functions and dates unless revived. Interview: spread and `Object.assign` are shallow. Freezing with `Object.freeze` is shallow immutability—nested objects remain mutable unless recursively frozen. Choosing copy depth depends on data shape and performance. Mistaking shallow for deep causes shared-state bugs across React state updates or Redux reducers if not careful—though React is framework, the JS concept is the root cause.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-032',
    question: 'What is optional chaining (`?.`) and nullish coalescing (`??`)?',
    answer:
      'Optional chaining short-circuits access when base is `null` or `undefined`: `user?.profile?.name` returns `undefined` instead of throwing. It works for properties, calls `fn?.()`, and bracket access `arr?.[0]`. Nullish coalescing `a ?? b` returns `b` only when `a` is `null` or `undefined`, unlike `||` which treats `0`, `""`, and `false` as needing replacement. Together they reduce defensive `&&` ladders. Interview: optional chaining does not short-circuit other falsy values—only nullish bases. Chaining calls skips execution if earlier part is nullish. Browser support is broad in maintained environments; transpile if needed for legacy. Over-nesting `?.` may hide data bugs—sometimes explicit validation is clearer. These operators are among the most practical modern syntax additions for application code readability.',
    codeExample:
      'const port = config.port ?? 3000;',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-033',
    question: 'What are `Symbol` values used for at a beginner-friendly level?',
    answer:
      '`Symbol` is a primitive that creates unique property keys even if descriptions match: `Symbol("x") !== Symbol("x")`. Well-known symbols like `Symbol.iterator` customize iteration protocol. Use symbols to avoid name collisions on objects when libraries share namespaces, or for semi-private properties not enumerated by `Object.keys` (still reachable via `Reflect.ownKeys`). They are not secret—do not use for security. JSON ignores symbol keys. Interview at junior level: awareness that symbols exist and typical use is meta-programming and library internals. Everyday app code may rarely construct symbols until learning frameworks using them. `Symbol.for` registers global symbols by string key—shared across realms. Understanding enumerability differences clarifies why some keys skip `for...in`.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-034',
    question: 'What is the difference between `Object.keys`, `Object.getOwnPropertyNames`, and `for...in`?',
    answer:
      '`Object.keys` returns enumerable own string keys. `getOwnPropertyNames` returns all own string keys including non-enumerable. `for...in` enumerates enumerable keys including inherited ones unless guarded with `hasOwnProperty` or `Object.hasOwn` (modern). Symbol keys require `getOwnPropertySymbols` or `Reflect.ownKeys` for everything. Interview: choose API matching whether you need inherited or symbol properties. `Object.entries` pairs keys with values for enumerable own properties—handy for loops. These distinctions matter when serializing or cloning objects. Mistaking `for...in` for arrays causes string indices and prototype pollution surprises. For plain data transfer objects, `keys`/`entries` are usually right. Framework code reading descriptors digs into `getOwnPropertyDescriptor` later. When you practice aloud, connect each idea to a tiny code snippet you have typed yourself—interviewers notice confidence from muscle memory, not from memorizing bullet lists alone.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-035',
    question: 'What is a module in JavaScript (ES modules) at a high level?',
    answer:
      'ES modules use `import` and `export` to split code into files with explicit dependencies resolved at load time (static structure). `export` can be named or default; imports must match binding rules—live read-only bindings for exports, not copies. Cyclic imports are allowed but require careful initialization order; avoid when possible. Modules are automatically strict. In browsers, `type="module"` scripts defer by default. In Node, `.mjs` or `"type": "module"` enables ESM. Interview contrast: CommonJS `require` is dynamic synchronous loading historically in Node—interop still appears in tooling. Tree shaking relies on static `import`. Dynamic `import()` returns promises for code splitting—mid-level topic. For beginners, know files export APIs and import dependencies explicitly instead of global script tags polluting `window`.',
    codeExample:
      'export function add(a, b) {\n  return a + b;\n}',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-036',
    question: 'What is `this` in simple scenarios (not yet deep binding rules)?',
    answer:
      'In global non-strict scripts, top-level `this` may refer to the global object; in modules, top-level `this` is `undefined`. In object methods using regular function syntax, `this` refers to the object receiving the call at invocation time: `obj.method()`. If you assign `const f = obj.method; f()`, `this` is lost unless bound—classic pitfall. Arrow functions inherit `this` lexically, not helpful if you thought arrow as object method and expected dynamic `this`—often wrong for prototype methods. Constructors with `new` bind `this` to the new instance. Interview beginners should state `this` depends on call site for normal functions. Deep rules (`call`, `apply`, `bind`) come in mid-level answers. Misunderstanding `this` drives many event-handler bugs in vanilla DOM code before frameworks abstract it.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-037',
    question: 'What is `eval`, and why is it discouraged?',
    answer:
      '`eval` executes a string as code in the current lexical scope (direct eval), defeating optimizations and creating security holes if the string includes user input—XSS escalates to arbitrary code. Indirect eval behaves like global eval in sloppy ways. Modern code should parse structured data with `JSON.parse` or use interpreters for DSLs, not string `eval`. CSP in browsers can block `eval`. Linters flag `eval`. Interview: mention performance deopt and security. `new Function` is slightly sandboxed from local scope but still dangerous with untrusted input. Template injection attacks mirror `eval` risks on servers. Students learning JS might see toy examples with `eval`; production rejects it except rare devtools. Understanding why it is banned shows mature engineering judgment beyond syntax knowledge.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-038',
    question: 'What are `setTimeout` and `setInterval`?',
    answer:
      'They schedule callbacks on the timer task queue after a minimum delay in milliseconds—not guaranteed exact times because the event loop may be busy. `setTimeout` runs once; `setInterval` repeats until cleared with `clearInterval`. Return numeric ids are used to cancel via `clearTimeout`. Passing strings as code is legacy and unsafe like `eval`. In browsers, throttling in background tabs affects timers. `setInterval` can drift if callback duration exceeds interval—use recursive `setTimeout` for steadier pacing. Interview bridge: timers are macrotasks; microtasks from promises run between turns differently—exact ordering is mid-level. For animations, `requestAnimationFrame` syncs to display refresh in browsers. Node timers APIs mirror with slight differences. Never rely on timers for cryptographic timing.',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-039',
    question: 'What is `Intl` and a common use case?',
    answer:
      'The `Intl` object provides internationalization APIs: `Intl.NumberFormat` for locale-aware number formatting, `Intl.DateTimeFormat` for dates, `Intl.RelativeTimeFormat` for phrases like “3 days ago”, and `Intl.Collator` for locale-correct string sorting. It reduces hand-rolled locale logic. Options objects configure currency, time zone, and numbering systems. Interview: formatting should happen close to UI using user locale, while storage stays normalized (often UTC ISO). `Intl` is implemented in modern engines broadly. Fallbacks may be needed for extremely old environments—polyfills exist. This is still JavaScript language standard library, not DOM. Junior developers should stop concatenating manual date strings for users and adopt `Intl` with clear locale strategy from product requirements.',
    codeExample:
      'new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(1234.5);',
    codeLanguage: 'javascript',
  },
  {
    id: 'js-040',
    question: 'What is `BigInt`, and when would you use it?',
    answer:
      '`BigInt` represents integers of arbitrary precision beyond `Number.MAX_SAFE_INTEGER` (2^53-1). Literals append `n`: `123n`. You cannot mix `BigInt` and `Number` in arithmetic without explicit conversion—throws `TypeError`. Use for large IDs, cryptography integers, or integer-only financial calculations where doubles risk rounding (though decimals still need decimals library). `JSON.stringify` throws on `BigInt` unless you add a replacer converting to string. Interview: choose `BigInt` when integrity of large integers matters more than float performance. Serialization contracts must agree string versus number representation. Not all APIs support `BigInt` in typed arrays or WebGL contexts—stay within number when interfacing those. For many apps, strings carrying big IDs from JSON are enough without arithmetic.',
    codeExample:
      'const x = 9007199254740993n;',
    codeLanguage: 'javascript',
  },
]
