import type { CodingExercise } from './types'

/** JavaScript coding scenarios: five beginner and five mid-level (10 total). */
export const JAVASCRIPT_CODING_EXERCISES: CodingExercise[] = [
  {
    id: 'js-cart',
    difficulty: 'beginner',
    title: 'Immutable shopping cart',
    scenario: `You are building checkout logic for a storefront. The cart is modeled as an array of line items: each item has a string id, display name, unit price (number), and quantity (positive integer).

Write small pure functions (no classes required) that:
• addItem(cart, item) — if the id already exists, increase qty by the incoming item's qty (default 1); otherwise append a new line.
• removeItem(cart, id) — drop that line entirely.
• getTotal(cart) — sum of price * qty for all lines.

Prefer immutable updates (return new arrays/objects) so React or other callers can detect changes cheaply. Do not mutate the input cart argument.`,
    constraints: [
      'Use plain modern JavaScript (ES2015+).',
      'Treat cart as read-only input; return new structures.',
      'Assume price and qty are valid numbers when grading your own solution.',
    ],
    hints: [
      'Use Array.prototype.findIndex to locate an existing line by id before deciding to merge quantities or push a clone.',
      'Spread syntax [...cart] and .map/.filter are enough—no need for Immer or lodash unless you want them.',
      'getTotal is a one-liner with .reduce starting from 0.',
    ],
    answerFiles: [
      {
        path: 'cart.js',
        language: 'javascript',
        code: `/**
 * @typedef {{ id: string; name: string; price: number; qty: number }} LineItem
 * @param {LineItem[]} cart
 * @param {Omit<LineItem, 'qty'> & { qty?: number }} item
 * @returns {LineItem[]}
 */
export function addItem(cart, item) {
  const qty = item.qty ?? 1;
  const i = cart.findIndex((x) => x.id === item.id);
  if (i === -1) return [...cart, { ...item, qty }];
  return cart.map((x, j) =>
    j === i ? { ...x, qty: x.qty + qty } : x,
  );
}

/** @param {LineItem[]} cart @param {string} id @returns {LineItem[]} */
export function removeItem(cart, id) {
  return cart.filter((x) => x.id !== id);
}

/** @param {LineItem[]} cart @returns {number} */
export function getTotal(cart) {
  return cart.reduce((sum, x) => sum + x.price * x.qty, 0);
}
`,
      },
    ],
  },
  {
    id: 'js-todo-filter',
    difficulty: 'beginner',
    title: 'Filter a todo list',
    scenario: `You have an in-memory list of todos: each item is \`{ id: string, title: string, done: boolean }\`.

Implement \`filterTodos(todos, filter)\` where \`filter\` is one of \`"all"\`, \`"active"\` (not done), or \`"completed"\` (done). Return a new array; do not mutate the input.

If \`filter\` is anything else, return a shallow copy of the original array so the UI does not break.`,
    constraints: [
      'Use Array.prototype.filter where appropriate.',
      'Return a new array reference even for the "all" case.',
    ],
    hints: [
      'Compare filter to the three string literals with strict equality.',
      'For "active", keep items where done is false; for "completed", where done is true.',
      'Spread or .slice() gives you a copy for the default branch.',
    ],
    answerFiles: [
      {
        path: 'todos.js',
        language: 'javascript',
        code: `/**
 * @typedef {{ id: string; title: string; done: boolean }} Todo
 * @param {Todo[]} todos
 * @param {'all' | 'active' | 'completed' | string} filter
 * @returns {Todo[]}
 */
export function filterTodos(todos, filter) {
  if (filter === 'all') return [...todos];
  if (filter === 'active') return todos.filter((t) => !t.done);
  if (filter === 'completed') return todos.filter((t) => t.done);
  return [...todos];
}
`,
      },
    ],
  },
  {
    id: 'js-get-path',
    difficulty: 'beginner',
    title: 'Safe nested property read',
    scenario: `APIs and config objects are often nested. Implement \`getAt(object, path, defaultValue)\` that returns the value at a path or \`defaultValue\` when any segment is missing.

\`path\` may be a dot-separated string like \`"user.address.city"\` or an array of keys like \`["user", "address", "city"]\`. Empty path should return the object itself (or default if object is null/undefined—your choice, but document mentally: returning the root is typical).

Do not throw; treat \`null\` or non-object values in the middle of the walk as "missing" and return \`defaultValue\`.`,
    constraints: [
      'No eval or Function constructor.',
      'Ignore empty segments in dot paths (e.g. "a..b" treats like "a.b").',
    ],
    hints: [
      'Normalize path: if string, split on "." and filter out empty strings.',
      'Loop keys; if current is null/undefined or not a plain object, return defaultValue.',
      'After the loop, if the final value is undefined, return defaultValue; else return the value.',
    ],
    answerFiles: [
      {
        path: 'getAt.js',
        language: 'javascript',
        code: `function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * @param {unknown} obj
 * @param {string | string[]} path
 * @param {unknown} [defaultValue]
 */
export function getAt(obj, path, defaultValue = undefined) {
  const keys = Array.isArray(path)
    ? path
    : String(path)
        .split('.')
        .filter((k) => k.length > 0);

  if (keys.length === 0) {
    return obj === undefined ? defaultValue : obj;
  }

  let cur = obj;
  for (const key of keys) {
    if (!isPlainObject(cur) && !Array.isArray(cur)) return defaultValue;
    if (cur == null) return defaultValue;
    cur = cur[key];
  }
  return cur === undefined ? defaultValue : cur;
}
`,
      },
    ],
  },
  {
    id: 'js-slugify',
    difficulty: 'beginner',
    title: 'Slugify a display string',
    scenario: `Blog posts and product names need URL-safe slugs. Implement \`slugify(text)\` that:

• Trims leading/trailing whitespace.
• Lowercases the string.
• Replaces any run of non-alphanumeric characters with a single hyphen \`-\`.
• Removes leading/trailing hyphens from the result.

If the result would be empty (e.g. input was \`"***"\`), return \`"item"\` as a fallback.`,
    constraints: [
      'Use String and RegExp methods only—no slug libraries.',
      'Assume typical Unicode letters count as non-alphanumeric for this exercise unless you want to allow them; ASCII letters and digits are enough for tests.',
    ],
    hints: [
      'After toLowerCase and trim, use replace with /[^a-z0-9]+/g for hyphen runs.',
      'A second replace can strip /^-+|-+$/g.',
      'If the string is empty after processing, return "item".',
    ],
    answerFiles: [
      {
        path: 'slugify.js',
        language: 'javascript',
        code: `/** @param {string} text */
export function slugify(text) {
  const s = String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'item';
}
`,
      },
    ],
  },
  {
    id: 'js-group-by-key',
    difficulty: 'beginner',
    title: 'Group array items by a field',
    scenario: `Given an array of objects that share a property name (for example \`department\`), implement \`groupByKey(items, key)\` that returns a plain object whose keys are the distinct values of \`item[key]\` and whose values are arrays of items sharing that key.

Use only values that exist on the objects; if some items lack the key, you may group them under \`"undefined"\` as a string key, or skip them—pick one approach and stay consistent (reference solution uses String(value) so \`undefined\` becomes \`"undefined"\`).

Do not mutate the input array or its items.`,
    constraints: [
      'Return a new object and new inner arrays.',
      'Key values should be coerced to strings for object keys (e.g. numbers become "1").',
    ],
    hints: [
      'Start from const result = {} and for..of over items.',
      'const k = String(item[key]) handles most key types.',
      'Initialize result[k] to [] before pushing a copy or push to existing array.',
    ],
    answerFiles: [
      {
        path: 'groupBy.js',
        language: 'javascript',
        code: `/**
 * @param {Record<string, unknown>[]} items
 * @param {string} key
 * @returns {Record<string, Record<string, unknown>[]>}
 */
export function groupByKey(items, key) {
  /** @type {Record<string, Record<string, unknown>[]>} */
  const out = {};
  for (const item of items) {
    const k = String(item[key]);
    if (!out[k]) out[k] = [];
    out[k].push(item);
  }
  return out;
}
`,
      },
    ],
  },
  {
    id: 'js-fetch-cache',
    difficulty: 'mid',
    title: 'Resilient fetch + memoized loader',
    scenario: `Your app loads user profiles from a REST API. Network flakes are common on mobile, so callers want automatic retries with a small delay between attempts.

Implement fetchWithRetry(url, options) where options may include maxRetries (default 3), delayMs (base delay, default 400), and fetchImpl (default global fetch). On each failure, wait longer before the next try (linear backoff: delayMs * attemptIndex is fine). If all attempts fail, rethrow the last error.

Also implement createUserCache(fetchUser) returning an async function loadUser(id) that calls fetchUser(id) at most once per id and caches fulfilled results in a Map. If fetchUser rejects, do not cache the failure so a later call can retry.`,
    constraints: [
      'Use async/await; avoid third-party retry libraries.',
      'fetchWithRetry should return the Response object on success.',
      'The cache should only store successful resolutions.',
    ],
    hints: [
      'A for-loop with try/catch and await sleep(ms) between attempts keeps the control flow readable.',
      'Extract sleep as const sleep = (ms) => new Promise((r) => setTimeout(r, ms)).',
      'Use inflight promises so concurrent requests for the same id share one fetch.',
    ],
    answerFiles: [
      {
        path: 'network.js',
        language: 'javascript',
        code: `const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {string} url
 * @param {{ maxRetries?: number; delayMs?: number; fetchImpl?: typeof fetch }} [options]
 */
export async function fetchWithRetry(url, options = {}) {
  const {
    maxRetries = 3,
    delayMs = 400,
    fetchImpl = fetch,
  } = options;
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetchImpl(url);
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      return res;
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) break;
      await sleep(delayMs * (attempt + 1));
    }
  }
  throw lastError;
}

/**
 * @template T
 * @param {(id: string) => Promise<T>} fetchUser
 */
export function createUserCache(fetchUser) {
  /** @type {Map<string, Promise<T>>} */
  const inflight = new Map();
  /** @type {Map<string, T>} */
  const done = new Map();

  return async (id) => {
    if (done.has(id)) return done.get(id);
    if (!inflight.has(id)) {
      inflight.set(
        id,
        fetchUser(id).then(
          (user) => {
            done.set(id, user);
            inflight.delete(id);
            return user;
          },
          (err) => {
            inflight.delete(id);
            throw err;
          },
        ),
      );
    }
    return inflight.get(id);
  };
}
`,
      },
    ],
  },
  {
    id: 'js-debounce',
    difficulty: 'mid',
    title: 'Debounce a function',
    scenario: `Search inputs and resize handlers should not fire on every keystroke or pixel. Implement \`debounce(fn, waitMs)\` returning a new function that waits until \`waitMs\` milliseconds have passed without further calls before invoking \`fn\` with the **last** arguments received.

If the debounced function is called again before the timer fires, reset the timer. Use \`setTimeout\` / \`clearTimeout\`; no lodash.`,
    constraints: [
      'Preserve \`this\` if you like by using a regular function for the wrapper, or document that callers should use arrow functions at bind sites.',
      'The returned function should accept any number of arguments.',
    ],
    hints: [
      'Store timeout id in a closure variable cleared on each invocation.',
      'Use let lastArgs and spread them into fn when the timer finally runs.',
      'Optional: return a function with .cancel that clears the pending timeout—nice for tests.',
    ],
    answerFiles: [
      {
        path: 'debounce.js',
        language: 'javascript',
        code: `/**
 * @param {(...args: unknown[]) => void} fn
 * @param {number} waitMs
 */
export function debounce(fn, waitMs) {
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let t;
  /** @type {unknown[]} */
  let lastArgs = [];

  const debounced = (...args) => {
    lastArgs = args;
    clearTimeout(t);
    t = setTimeout(() => {
      fn(...lastArgs);
    }, waitMs);
  };

  debounced.cancel = () => clearTimeout(t);
  return debounced;
}
`,
      },
    ],
  },
  {
    id: 'js-map-limit',
    difficulty: 'mid',
    title: 'Concurrent async map with a limit',
    scenario: `You have a list of IDs and an async mapper \`async (id) => result\`. Running hundreds of network calls at once can overwhelm the server. Implement \`mapLimit(items, limit, mapper)\` that returns a Promise resolving to an array of results **in the same order as \`items\`**, while having at most \`limit\` mapper calls in flight at any time.

When \`limit\` is greater than the list length, only spawn as many workers as needed. Empty input should resolve to \`[]\`.`,
    constraints: [
      'Use async/await and Promise—no external pool libraries.',
      'Preserve result order even though tasks finish out of order.',
    ],
    hints: [
      'Classic pattern: shared atomic index incremented by workers, each worker loops until index >= length.',
      'Store results in a pre-sized array and assign by index inside the mapper await.',
      'Spawn min(limit, items.length) parallel worker async functions, then Promise.all them.',
    ],
    answerFiles: [
      {
        path: 'mapLimit.js',
        language: 'javascript',
        code: `/**
 * @template T, R
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T, index: number) => Promise<R>} mapper
 * @returns {Promise<R[]>}
 */
export async function mapLimit(items, limit, mapper) {
  if (items.length === 0) return [];
  const results = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await mapper(items[i], i);
    }
  }

  const n = Math.min(Math.max(1, limit), items.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}
`,
      },
    ],
  },
  {
    id: 'js-query-string',
    difficulty: 'mid',
    title: 'Parse and build query strings',
    scenario: `Implement \`parseQuery(search)\` that takes a string like \`"?a=1&b=two"\` or \`"a=1&b=two"\` and returns a plain object with string keys and **string** values (use \`URLSearchParams\`).

Implement \`stringifyQuery(params)\` that takes an object whose values are strings (or numbers coerced with String) and returns a query string **without** a leading \`?\`, suitable for appending to a URL yourself.

If the same key appears twice in the input, last value wins (match URLSearchParams behavior).`,
    constraints: [
      'Use the built-in URLSearchParams API.',
      'Do not add a ? prefix in stringifyQuery output.',
    ],
    hints: [
      'Strip optional leading ? from parseQuery input before passing to URLSearchParams.',
      'Object.fromEntries(params.entries()) builds the record.',
      'For stringify, new URLSearchParams() then append each key, or pass object to constructor if values are strings.',
    ],
    answerFiles: [
      {
        path: 'query.js',
        language: 'javascript',
        code: `/** @param {string} search */
export function parseQuery(search) {
  const s = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(s);
  return Object.fromEntries(params.entries());
}

/**
 * @param {Record<string, string | number | boolean>} obj
 */
export function stringifyQuery(obj) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    p.set(k, String(v));
  }
  return p.toString();
}
`,
      },
    ],
  },
  {
    id: 'js-mini-emitter',
    difficulty: 'mid',
    title: 'Tiny synchronous event emitter',
    scenario: `Build a factory \`createEmitter()\` returning an object with:

• \`on(eventName, handler)\` — register a function for string \`eventName\`. Return an \`unsubscribe\` function that removes that handler.
• \`off(eventName, handler)\` — remove one handler (no-op if not registered).
• \`emit(eventName, payload)\` — call all handlers for that event synchronously, in registration order.

If a handler throws, let the error propagate (no try/catch required). Unsubscribing during emit should not skip handlers that were already scheduled for this emit—snapshot the handler list before looping.`,
    constraints: [
      'Handlers are synchronous; emit does not return a Promise.',
      'Use Map<string, Set<function>> or similar for storage.',
    ],
    hints: [
      'on can push to a Set and return () => set.delete(handler).',
      'emit should copy [...set] or Array.from(set) before iterating.',
      'off deletes from the set; if set empty you can delete the map entry.',
    ],
    answerFiles: [
      {
        path: 'emitter.js',
        language: 'javascript',
        code: `export function createEmitter() {
  /** @type {Map<string, Set<Function>>} */
  const listeners = new Map();

  return {
    /**
     * @param {string} eventName
     * @param {(...args: unknown[]) => void} handler
     */
    on(eventName, handler) {
      if (!listeners.has(eventName)) listeners.set(eventName, new Set());
      listeners.get(eventName).add(handler);
      return () => this.off(eventName, handler);
    },

    /**
     * @param {string} eventName
     * @param {(...args: unknown[]) => void} handler
     */
    off(eventName, handler) {
      const set = listeners.get(eventName);
      if (!set) return;
      set.delete(handler);
      if (set.size === 0) listeners.delete(eventName);
    },

    /**
     * @param {string} eventName
     * @param {unknown} [payload]
     */
    emit(eventName, payload) {
      const set = listeners.get(eventName);
      if (!set?.size) return;
      for (const fn of [...set]) fn(payload);
    },
  };
}
`,
      },
    ],
  },
]
