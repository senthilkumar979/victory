import type { CodingExercise } from './types'

/** TypeScript: five beginner and five mid-level scenarios (10 total). */
export const TYPESCRIPT_CODING_EXERCISES: CodingExercise[] = [
  {
    id: 'ts-narrow-format',
    difficulty: 'beginner',
    title: 'Narrow string | number',
    scenario: `Implement \`formatValue(value: string | number): string\` that:
• If \`value\` is a \`number\`, return its fixed two-decimal string using \`toFixed(2)\`.
• If it is a \`string\`, return it **trimmed** (empty string after trim becomes \`"(empty)"\`).

Use \`typeof\` narrowing—no type assertions (\`as\`) in the implementation.`,
    constraints: [
      'Keep the parameter type as a union; do not overload for this exercise.',
    ],
    hints: [
      'if (typeof value === "number") return value.toFixed(2);',
      'Else branch TypeScript narrows to string.',
    ],
    answerFiles: [
      {
        path: 'formatValue.ts',
        language: 'typescript',
        code: `export function formatValue(value: string | number): string {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  const t = value.trim();
  return t === '' ? '(empty)' : t;
}
`,
      },
    ],
  },
  {
    id: 'ts-generic-identity',
    difficulty: 'beginner',
    title: 'Generic identity function',
    scenario: `Write \`function identity<T>(value: T): T\` that returns the argument unchanged.

Then declare \`const a = identity("hi")\` and \`const b = identity(42)\` in comments or a tiny demo block showing that \`a\` is inferred as \`string\` and \`b\` as \`number\` without explicit type arguments.

Add a second overload-free helper \`asConstArray\` that takes a readonly tuple type argument conceptually—or simply document that \`identity\` preserves literal types when passed \`as const\` values.`,
    constraints: [
      'No any; use a single type parameter T.',
    ],
    hints: [
      'export function identity<T>(value: T): T { return value; }',
      'identity("x" as const) preserves literal type "x".',
    ],
    answerFiles: [
      {
        path: 'identity.ts',
        language: 'typescript',
        code: `export function identity<T>(value: T): T {
  return value;
}

// const a = identity('hi');     // string (widened)
// const b = identity(42);     // number
// const c = identity('hi' as const); // literal "hi"
`,
      },
    ],
  },
  {
    id: 'ts-pick-partial',
    difficulty: 'beginner',
    title: 'Pick and Partial for updates',
    scenario: `Given:

\`\`\`ts
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}
\`\`\`

Define \`type UserPreview = Pick<User, "id" | "name">\`.

Implement \`function applyUserPatch(user: User, patch: Partial<Pick<User, "name" | "email">>): User\` that returns a **new** object: same \`id\` and \`role\`, but \`name\` and \`email\` overridden when provided in \`patch\`. Do not mutate \`user\`.`,
    constraints: [
      'Use object spread or explicit property copy.',
      'Return type must be User.',
    ],
    hints: [
      'return { ...user, ...patch }; after patch is narrowed to allowed keys only.',
      'Partial makes each property optional.',
    ],
    answerFiles: [
      {
        path: 'userPatch.ts',
        language: 'typescript',
        code: `export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export type UserPreview = Pick<User, 'id' | 'name'>;

export function applyUserPatch(
  user: User,
  patch: Partial<Pick<User, 'name' | 'email'>>,
): User {
  return { ...user, ...patch };
}
`,
      },
    ],
  },
  {
    id: 'ts-discriminated-result',
    difficulty: 'beginner',
    title: 'Discriminated union + exhaustiveness',
    scenario: `Model async results:

\`type Ok<T> = { status: "ok"; data: T }\`
\`type Err = { status: "error"; message: string }\`
\`type Result<T> = Ok<T> | Err\`

Implement \`function describeResult<T>(r: Result<T>): string\` using a \`switch (r.status)\` that returns a human-readable string for each case. Add \`default\` with \`const _exhaustive: never = r\` (or \`return assertNever(r)\`) so adding a new variant causes a compile error.`,
    constraints: [
      'Use switch(true) on r.status or switch (r.status).',
      'Include a never helper assertNever(x: never): never.',
    ],
    hints: [
      'case "ok": return "OK: " + JSON.stringify(r.data);',
      'case "error": return "Error: " + r.message;',
      'default: return assertNever(r);',
    ],
    answerFiles: [
      {
        path: 'result.ts',
        language: 'typescript',
        code: `export type Ok<T> = { status: 'ok'; data: T };
export type Err = { status: 'error'; message: string };
export type Result<T> = Ok<T> | Err;

export function assertNever(x: never): never {
  throw new Error('Unexpected: ' + x);
}

export function describeResult<T>(r: Result<T>): string {
  switch (r.status) {
    case 'ok':
      return 'OK: ' + JSON.stringify(r.data);
    case 'error':
      return 'Error: ' + r.message;
    default:
      return assertNever(r);
  }
}
`,
      },
    ],
  },
  {
    id: 'ts-unknown-guard',
    difficulty: 'beginner',
    title: 'Type guard from unknown JSON',
    scenario: `Implement \`function isUserRecord(x: unknown): x is { id: string; name: string }\` that returns \`true\` only when \`x\` is a non-null object with string \`id\` and string \`name\` own properties (use \`typeof\` checks).

Implement \`function parseUser(input: unknown): { id: string; name: string }\` that throws \`Error\` with a clear message if \`isUserRecord\` fails.

Avoid \`as\` on \`input\` in the guard—use \`Reflect.get\` or equivalent after \`in\` checks.`,
    constraints: [
      'Use type predicate return type on isUserRecord.',
      'Check typeof x === "object" && x !== null before reading keys.',
    ],
    hints: [
      'After object check, use "id" in x && "name" in x before reading values.',
      'Use Reflect.get(x, "id") and typeof ... === "string" to avoid assertions on input.',
    ],
    answerFiles: [
      {
        path: 'parseUser.ts',
        language: 'typescript',
        code: `export function isUserRecord(x: unknown): x is { id: string; name: string } {
  if (typeof x !== 'object' || x === null) return false;
  if (!('id' in x) || !('name' in x)) return false;
  const idVal: unknown = Reflect.get(x, 'id');
  const nameVal: unknown = Reflect.get(x, 'name');
  return typeof idVal === 'string' && typeof nameVal === 'string';
}

export function parseUser(input: unknown): { id: string; name: string } {
  if (!isUserRecord(input)) {
    throw new Error('Expected object with string id and name');
  }
  return { id: input.id, name: input.name };
}
`,
      },
    ],
  },
  {
    id: 'ts-satisfies-routes',
    difficulty: 'mid',
    title: 'satisfies for config literals',
    scenario: `Declare \`const routes\` describing page paths. Each value must be \`{ path: string; label: string }\`. Use \`as const satisfies Record<string, { path: string; label: string }>\` so:
• Keys stay as literal key types where possible.
• Extra wrong properties or wrong value shapes are rejected.

Export \`routes\` and a helper type \`RouteKey = keyof typeof routes\`.`,
    constraints: [
      'Use satisfies, not only as const.',
      'Include at least three route entries (e.g. home, about, settings).',
    ],
    hints: [
      'const routes = { ... } as const satisfies Record<string, { path: string; label: string }>;',
      'export type RouteKey = keyof typeof routes;',
    ],
    answerFiles: [
      {
        path: 'routes.ts',
        language: 'typescript',
        code: `export const routes = {
  home: { path: '/', label: 'Home' },
  about: { path: '/about', label: 'About' },
  settings: { path: '/settings', label: 'Settings' },
} as const satisfies Record<string, { path: string; label: string }>;

export type RouteKey = keyof typeof routes;
`,
      },
    ],
  },
  {
    id: 'ts-branded-id',
    difficulty: 'mid',
    title: 'Branded primitive for IDs',
    scenario: `Create a **nominal** \`UserId\` type so plain \`string\` cannot be assigned accidentally:

\`type UserId = string & { readonly __brand: unique symbol }\` (declare \`declare const userIdBrand: unique symbol;\`).

Export \`function createUserId(raw: string): UserId\` that trims and throws if empty; export \`function userIdEquals(a: UserId, b: UserId): boolean\`.

Demonstrate in a comment that \`const x: UserId = "u1" as any\` is the wrong pattern—callers should use \`createUserId\`.`,
    constraints: [
      'Use unique symbol branding pattern.',
      'Do not use enums for this exercise.',
    ],
    hints: [
      'declare const brand: unique symbol; type UserId = string & { readonly [brand]: typeof brand };',
      'Or __brand: unique symbol with declare const userIdBrand: unique symbol;',
    ],
    answerFiles: [
      {
        path: 'brandedUserId.ts',
        language: 'typescript',
        code: `declare const userIdBrand: unique symbol;

export type UserId = string & { readonly [userIdBrand]: typeof userIdBrand };

export function createUserId(raw: string): UserId {
  const t = raw.trim();
  if (!t) throw new Error('UserId cannot be empty');
  return t as UserId;
}

export function userIdEquals(a: UserId, b: UserId): boolean {
  return a === b;
}

// const bad: UserId = 'x'; // compile error
// const ok = createUserId('  u1  ');
`,
      },
    ],
  },
  {
    id: 'ts-zod-schema',
    difficulty: 'mid',
    title: 'Zod schema + inferred type',
    scenario: `Using Zod (\`z\` from \`"zod"\`), define \`const ProductSchema\` for:
• \`sku\`: string, min length 3
• \`price\`: number, non-negative
• \`tags\`: array of strings, default \`[]\`

Export \`type Product = z.infer<typeof ProductSchema>\`.

Export \`function parseProduct(input: unknown): Product\` using \`.parse()\` (let Zod throw on failure).`,
    constraints: [
      'Reference uses z.object / z.string().min(3) / z.number().min(0) / z.array(z.string()).default([]).',
    ],
    hints: [
      'import { z } from "zod";',
      'export const ProductSchema = z.object({ ... });',
      'export type Product = z.infer<typeof ProductSchema>;',
    ],
    answerFiles: [
      {
        path: 'productSchema.ts',
        language: 'typescript',
        code: `import { z } from 'zod';

export const ProductSchema = z.object({
  sku: z.string().min(3),
  price: z.number().min(0),
  tags: z.array(z.string()).default([]),
});

export type Product = z.infer<typeof ProductSchema>;

export function parseProduct(input: unknown): Product {
  return ProductSchema.parse(input);
}
`,
      },
    ],
  },
  {
    id: 'ts-unwrap-array',
    difficulty: 'mid',
    title: 'Conditional type: unwrap array',
    scenario: `Implement a utility type:

\`type UnwrapArray<T>\` — if \`T\` is an array of \`infer U\`, result is \`U\`; otherwise \`T\`.

Add \`type Examples\` in comments showing \`UnwrapArray<string[]>\` is \`string\` and \`UnwrapArray<number>\` is \`number\`.

Export a function stub \`function head<T>(arr: T extends readonly (infer U)[] ? readonly U[] : never): T extends readonly (infer U)[] ? U | undefined : never\` **or** a simpler version \`function head<U>(arr: readonly U[]): U | undefined\` and explain in the scenario that the exercise focuses on the **type** \`UnwrapArray\`.`,
    constraints: [
      'Use T extends ... ? infer U : ... pattern.',
    ],
    hints: [
      'type UnwrapArray<T> = T extends readonly (infer U)[] ? U : T;',
      'readonly array in extends handles readonly T[].',
    ],
    answerFiles: [
      {
        path: 'unwrapArray.ts',
        language: 'typescript',
        code: `export type UnwrapArray<T> = T extends readonly (infer U)[] ? U : T;

// type E1 = UnwrapArray<string[]>; // string
// type E2 = UnwrapArray<number>; // number

export function head<U>(arr: readonly U[]): U | undefined {
  return arr[0];
}
`,
      },
    ],
  },
  {
    id: 'ts-mutable-mapped',
    difficulty: 'mid',
    title: 'Mapped type: strip readonly',
    scenario: `Given \`interface Config { readonly apiUrl: string; readonly timeout: number }\`, define:

\`type Mutable<T> = { -readonly [K in keyof T]: T[K] }\`

Export a function \`function cloneMutableConfig(c: Config): Mutable<Config>\` that returns a shallow copy with writable properties (same values).

Demonstrate that \`Mutable<Config>\` allows reassignment of \`apiUrl\` on the result object.`,
    constraints: [
      'Use minus readonly (-readonly) in mapped type.',
      'Shallow copy only—nested objects would still be readonly references if any.',
    ],
    hints: [
      'type Mutable<T> = { -readonly [K in keyof T]: T[K] };',
      'return { ...c }; spread loses readonly on target type when assigned to Mutable<Config>.',
    ],
    answerFiles: [
      {
        path: 'mutableConfig.ts',
        language: 'typescript',
        code: `export interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

export function cloneMutableConfig(c: Config): Mutable<Config> {
  return { ...c };
}

// const m = cloneMutableConfig({ apiUrl: '/', timeout: 5 });
// m.apiUrl = 'https://x'; // OK
`,
      },
    ],
  },
]
