import type { CodingExercise } from './types'

/** JavaScript coding scenarios: beginner, mid, expert (expert uses multiple answer files). */
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
      'In the cache wrapper, check cache.has(id) before awaiting fetchUser; on success use cache.set.',
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
    id: 'js-event-pipeline',
    difficulty: 'expert',
    title: 'Event hub with middleware pipeline',
    scenario: `Design a tiny in-browser event system split across modules (as you would in a real repo).

1) eventHub.js exports createEventHub() returning { on(type, handler), emit(type, payload) }. Handlers are synchronous; emit invokes all subscribers for that exact string type. on returns an unsubscribe function.

2) withMiddleware.js exports withMiddleware(hub, middlewares) wrapping emit so that each middleware receives (type, payload, next). Middlewares run in order; the last next() should deliver to the real hub.emit. Middlewares may transform the payload passed to next.

3) main.js imports both, builds a hub, wraps it with a logging middleware and a validation middleware that drops events when payload is null, then registers a sample handler.

This models plugin-style extension without classes, though class syntax is fine if you prefer.`,
    constraints: [
      'No DOM events—plain JS objects only.',
      'Copy handlers before iterating so unsubscribe during emit does not break the loop.',
      'Keep middleware signature stable for testability.',
    ],
    hints: [
      'Store listeners in a Map<string, Set<fn>> so add/remove stays O(1) average.',
      'When emitting, iterate [...set] or Array.from(set) to snapshot callbacks.',
      'Middleware recursion: define const run = (i, p) => i < mws.length ? mws[i](type, p, (q) => run(i + 1, q)) : hub.emit(type, p).',
    ],
    answerFiles: [
      {
        path: 'eventHub.js',
        language: 'javascript',
        code: `export function createEventHub() {
  /** @type {Map<string, Set<Function>>} */
  const listeners = new Map();

  return {
    /**
     * @param {string} type
     * @param {(payload: unknown) => void} handler
     * @returns {() => void}
     */
    on(type, handler) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(handler);
      return () => listeners.get(type)?.delete(handler);
    },

    /**
     * @param {string} type
     * @param {unknown} payload
     */
    emit(type, payload) {
      const set = listeners.get(type);
      if (!set?.size) return;
      for (const fn of [...set]) fn(payload);
    },
  };
}
`,
      },
      {
        path: 'withMiddleware.js',
        language: 'javascript',
        code: `/**
 * @param {{ emit: (type: string, payload: unknown) => void }} hub
 * @param {Array<(type: string, payload: unknown, next: (p?: unknown) => void) => void>} middlewares
 */
export function withMiddleware(hub, middlewares) {
  return {
    ...hub,
    emit(type, payload) {
      const run = (i, p) => {
        if (i < middlewares.length) {
          middlewares[i](type, p, (nextPayload = p) => run(i + 1, nextPayload));
        } else {
          hub.emit(type, p);
        }
      };
      run(0, payload);
    },
  };
}
`,
      },
      {
        path: 'main.js',
        language: 'javascript',
        code: `import { createEventHub } from './eventHub.js';
import { withMiddleware } from './withMiddleware.js';

const core = createEventHub();

const bus = withMiddleware(core, [
  (type, payload, next) => {
    console.log('[trace]', type, payload);
    next(payload);
  },
  (type, payload, next) => {
    if (payload == null) return;
    next(payload);
  },
]);

const off = bus.on('user:login', (user) => {
  console.log('logged in', user);
});

bus.emit('user:login', { id: '42', name: 'Ada' });
bus.emit('user:login', null);

off();
`,
      },
    ],
  },
]
