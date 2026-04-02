import type { CodingExercise } from './types'

/** React + TypeScript: five beginner and five mid-level scenarios (10 total). */
export const REACT_CODING_EXERCISES: CodingExercise[] = [
  {
    id: 'rx-counter',
    difficulty: 'beginner',
    title: 'Counter with bounds',
    scenario: `Build a client component \`Counter\` using \`useState\`. Show the current count, an **Increment** button (+1), a **Decrement** button (−1), and **Reset** (back to 0).

The count must never go below **0** (decrement should be a no-op at 0). Use semantic HTML (\`<button type="button">\`, etc.) and accessible labels if helpful.

Export \`Counter\` as a named export suitable for dropping into a Next.js App Router page (include \`'use client'\` at the top).`,
    constraints: [
      'TypeScript + React function component only.',
      'No external state libraries.',
    ],
    hints: [
      'const [count, setCount] = useState(0) is enough.',
      'Increment: setCount((c) => c + 1); decrement: setCount((c) => Math.max(0, c - 1)).',
      'Reset: setCount(0).',
    ],
    answerFiles: [
      {
        path: 'Counter.tsx',
        language: 'tsx',
        code: `'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <output className="text-2xl font-semibold tabular-nums" aria-live="polite">
        {count}
      </output>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          Increment
        </button>
        <button
          type="button"
          onClick={() => setCount((c) => Math.max(0, c - 1))}
        >
          Decrement
        </button>
        <button type="button" onClick={() => setCount(0)}>
          Reset
        </button>
      </div>
    </div>
  );
}
`,
      },
    ],
  },
  {
    id: 'rx-controlled-email',
    difficulty: 'beginner',
    title: 'Controlled email field',
    scenario: `Create \`EmailField\` with:
• A controlled \`<input type="email">\` bound to React state.
• On **blur**, validate: value must match a simple pattern (contains \`@\` and a dot after \`@\`, or use a short regex).
• Show an inline error message below the input when invalid after blur; clear the error while the user is typing again (onChange) until the next blur.

Use \`useState\` for value and error string. Do not use a form library.`,
    constraints: [
      'Keep the input controlled at all times.',
      'Do not show an error before the first blur unless you prefer—reference solution waits until blur.',
    ],
    hints: [
      'const [value, setValue] = useState(""); const [error, setError] = useState<string | null>(null);',
      'onBlur: test value; setError or setError(null).',
      'onChange: setValue(e.target.value); setError(null) to reset feedback while editing.',
    ],
    answerFiles: [
      {
        path: 'EmailField.tsx',
        language: 'tsx',
        code: `'use client';

import { useState } from 'react';

const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

function validateEmail(v: string): boolean {
  return EMAIL_RE.test(v.trim());
}

export function EmailField() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        value={value}
        autoComplete="email"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'email-error' : undefined}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
        onBlur={() => {
          if (!value.trim()) {
            setError('Email is required');
            return;
          }
          setError(validateEmail(value) ? null : 'Enter a valid email address');
        }}
      />
      {error ? (
        <p id="email-error" className="text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
`,
      },
    ],
  },
  {
    id: 'rx-collapsible',
    difficulty: 'beginner',
    title: 'Collapsible panel',
    scenario: `Build \`Collapsible\` with props \`title: React.ReactNode\` and \`children: React.ReactNode\`. A button toggles whether \`children\` are visible. The button should show a clear label like "Expand" / "Collapse" (or rotate a chevron with \`aria-expanded\`).

Use \`useState<boolean>\` for open/closed. Associate the button with the region using \`aria-controls\` and \`id\` on the collapsible region.`,
    constraints: [
      'Must be usable with a keyboard (native button).',
      'Hide content with conditional render or CSS—reference uses conditional render.',
    ],
    hints: [
      'const [open, setOpen] = useState(false);',
      'button aria-expanded={open} aria-controls={panelId}',
      'Only render children when open, or always render but hidden—either is fine if accessible.',
    ],
    answerFiles: [
      {
        path: 'Collapsible.tsx',
        language: 'tsx',
        code: `'use client';

import { useId, useState, type ReactNode } from 'react';

interface CollapsibleProps {
  title: ReactNode;
  children: ReactNode;
}

export function Collapsible({ title, children }: CollapsibleProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section className="rounded-lg border border-zinc-700">
      <div className="flex items-center justify-between gap-2 p-3">
        <h2 className="text-sm font-medium">{title}</h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {open ? (
        <div id={panelId} className="border-t border-zinc-700 p-3">
          {children}
        </div>
      ) : null}
    </section>
  );
}
`,
      },
    ],
  },
  {
    id: 'rx-delete-list',
    difficulty: 'beginner',
    title: 'Delete items from a list',
    scenario: `Given an initial list of todo strings (you can seed with \`useState(["Buy milk", "Walk dog"])\`), render each item with a **Delete** button. Clicking Delete removes only that item.

Use stable **keys** (\`key={...}\`)—prefer the item string if unique, or index plus prefix if you document the assumption. Do not mutate the array in place; use immutable updates (\`filter\`, spread, etc.).`,
    constraints: [
      'Functional updates are encouraged when deriving from previous state.',
    ],
    hints: [
      'setItems((prev) => prev.filter((_, i) => i !== index)) or filter by id if you add ids.',
      'map items to <li> with button type="button" for delete.',
      'Avoid using array index as key if items can reorder—here static list is OK.',
    ],
    answerFiles: [
      {
        path: 'DeletableList.tsx',
        language: 'tsx',
        code: `'use client';

import { useState } from 'react';

const SEED = ['Buy milk', 'Walk dog'];

export function DeletableList() {
  const [items, setItems] = useState<string[]>(SEED);

  return (
    <ul className="space-y-2">
      {items.map((text, index) => (
        <li
          key={\`\${index}-\${text}\`}
          className="flex items-center justify-between gap-2 rounded border border-zinc-700 px-3 py-2"
        >
          <span>{text}</span>
          <button
            type="button"
            onClick={() =>
              setItems((prev) => prev.filter((_, i) => i !== index))
            }
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
`,
      },
    ],
  },
  {
    id: 'rx-effect-user',
    difficulty: 'beginner',
    title: 'Fetch user on mount',
    scenario: `Create \`UserCard\` that loads a user from \`https://jsonplaceholder.typicode.com/users/1\` when the component mounts.

Requirements:
• While loading, show "Loading…".
• On success, show the user’s \`name\` and \`email\`.
• On failure, show a short error message.

Use \`useEffect\` + \`fetch\` (or \`axios\` if your app already uses it—reference uses \`fetch\`). Type the JSON shape minimally (\`interface User { name: string; email: string }\` is enough for display). Store loading/error/data in \`useState\`.`,
    constraints: [
      'Handle the async function inside useEffect; avoid async useEffect directly—use an inner async IIFE or named function.',
      'Cancel or ignore stale updates if the component unmounts before fetch completes (reference uses an \`ignore\` flag).',
    ],
    hints: [
      'useEffect(() => { let ignore = false; (async () => { try { const r = await fetch(...); ... } catch { if (!ignore) setError(...) } })(); return () => { ignore = true; }; }, []);',
      'if (!ignore) setState(...) after await.',
      'Check response.ok before json().',
    ],
    answerFiles: [
      {
        path: 'UserCard.tsx',
        language: 'tsx',
        code: `'use client';

import { useEffect, useState } from 'react';

interface User {
  name: string;
  email: string;
}

export function UserCard() {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          'https://jsonplaceholder.typicode.com/users/1',
        );
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        const json: User = await res.json();
        if (!ignore) setData(json);
      } catch (e) {
        if (!ignore) {
          setError(e instanceof Error ? e.message : 'Failed to load user');
          setData(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!data) return null;

  return (
    <article className="rounded-lg border border-zinc-700 p-4">
      <h2 className="text-lg font-semibold">{data.name}</h2>
      <p className="text-sm text-zinc-400">{data.email}</p>
    </article>
  );
}
`,
      },
    ],
  },
  {
    id: 'rx-use-local-storage',
    difficulty: 'mid',
    title: 'useLocalStorage hook',
    scenario: `Implement \`function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void]\` that mirrors \`useState\` but persists to \`localStorage\`.

• On first mount, read from \`localStorage\`; if missing or JSON parse fails, use \`initial\`.
• When the setter runs, update state and write JSON.stringify to \`localStorage\`.
• Guard for \`typeof window === "undefined"\` so a first render in SSR does not throw (return \`initial\` until mounted if needed).

The reference uses a **mounted** flag + \`useEffect\` to hydrate from storage after mount to avoid SSR mismatch; you can alternatively read only in \`useEffect\`.`,
    constraints: [
      'No \`use-local-storage\` npm package.',
      'Keep serialization JSON-based for the exercise.',
    ],
    hints: [
      'useState(initial) for first paint; useEffect(() => { const raw = localStorage.getItem(key); ... }, [key]);',
      'Setter: setState(updater); localStorage.setItem(key, JSON.stringify(next));',
      'try/catch JSON.parse.',
    ],
    answerFiles: [
      {
        path: 'useLocalStorage.ts',
        language: 'typescript',
        code: `import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setState(JSON.parse(raw) as T);
    } catch {
      /* keep initial */
    }
    setReady(true);
  }, [key]);

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* quota / private mode */
        }
        return next;
      });
    },
    [key],
  );

  return [ready ? state : initial, set];
}
`,
      },
    ],
  },
  {
    id: 'rx-debounced-search',
    difficulty: 'mid',
    title: 'Debounced search value',
    scenario: `Implement \`useDebouncedValue<T>(value: T, delayMs: number): T\` that returns a **lagging** copy of \`value\` updated only after \`delayMs\` milliseconds have passed without \`value\` changing.

Use \`useEffect\` + \`setTimeout\` and cleanup with \`clearTimeout\` on change or unmount. This pattern is useful for firing API calls only after the user pauses typing.

Also sketch a tiny \`SearchBox\` component: controlled input + display of both immediate and debounced values for debugging (optional in your own file). The graded answer can be **only the hook** in one file.`,
    constraints: [
      'Delay restarts on every value change.',
      'Clean up timers to avoid leaks and stale updates.',
    ],
    hints: [
      'const [debounced, setDebounced] = useState(value); useEffect(() => { const t = setTimeout(() => setDebounced(value), delayMs); return () => clearTimeout(t); }, [value, delayMs]);',
      'Alternatively return debounced state initialized to value.',
    ],
    answerFiles: [
      {
        path: 'useDebouncedValue.ts',
        language: 'typescript',
        code: `import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
`,
      },
    ],
  },
  {
    id: 'rx-theme-context',
    difficulty: 'mid',
    title: 'Theme context',
    scenario: `Create a minimal dark/light theme switch using React Context.

• \`ThemeProvider\` wraps children and holds \`"light" | "dark"\` in state.
• \`useTheme()\` returns \`{ theme, toggle }\` where \`toggle\` flips between modes.
• Throw a clear error if \`useTheme\` is used outside the provider (e.g. check context === undefined).

Export \`ThemeProvider\`, \`useTheme\`, and optionally a small \`ThemeToggle\` button component in the same file for convenience.`,
    constraints: [
      'Use React.createContext with undefined default and a branded provider value.',
      'TypeScript: type the context value explicitly.',
    ],
    hints: [
      'const ThemeContext = createContext<ThemeCtx | undefined>(undefined);',
      'Provider value={{ theme, toggle }} with useCallback for toggle.',
      'useTheme: const ctx = useContext(ThemeContext); if (!ctx) throw new Error(...); return ctx;',
    ],
    answerFiles: [
      {
        path: 'ThemeContext.tsx',
        language: 'tsx',
        code: `'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button type="button" onClick={toggle}>
      Current: {theme}
    </button>
  );
}
`,
      },
    ],
  },
  {
    id: 'rx-todo-reducer',
    difficulty: 'mid',
    title: 'Todo list with useReducer',
    scenario: `Model a small todo app with \`useReducer\` (not multiple \`useState\` calls for the list).

Actions:
• \`{ type: "add"; text: string }\` — append a todo with a generated id (e.g. \`crypto.randomUUID()\` or incremental counter).
• \`{ type: "toggle"; id: string }\` — flip \`done\`.
• \`{ type: "remove"; id: string }\`.

State shape: \`{ todos: { id: string; text: string; done: boolean }[] }\`.

Render the list with checkboxes bound to \`done\`, and buttons to remove. Include a form or row to add a new todo.`,
    constraints: [
      'Reducer must be a pure function.',
      'Do not mutate previous state—return new objects/arrays.',
    ],
    hints: [
      'function reducer(state: State, action: Action): State { switch (action.type) { ... } }',
      'add: { ...state, todos: [...state.todos, { id, text, done: false }] }',
      'toggle: map todos and flip matching id.',
    ],
    answerFiles: [
      {
        path: 'TodoApp.tsx',
        language: 'tsx',
        code: `'use client';

import { useReducer } from 'react';

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

interface State {
  todos: Todo[];
}

type Action =
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const text = action.text.trim();
      if (!text) return state;
      const id = crypto.randomUUID();
      return {
        todos: [...state.todos, { id, text, done: false }],
      };
    }
    case 'toggle':
      return {
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, done: !t.done } : t,
        ),
      };
    case 'remove':
      return {
        todos: state.todos.filter((t) => t.id !== action.id),
      };
    default:
      return state;
  }
}

export function TodoApp() {
  const [state, dispatch] = useReducer(reducer, { todos: [] });

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const text = String(fd.get('text') ?? '');
          dispatch({ type: 'add', text });
          e.currentTarget.reset();
        }}
        className="flex gap-2"
      >
        <input name="text" placeholder="New todo" className="flex-1" />
        <button type="submit">Add</button>
      </form>
      <ul className="space-y-2">
        {state.todos.map((t) => (
          <li key={t.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => dispatch({ type: 'toggle', id: t.id })}
            />
            <span
              className={t.done ? 'text-zinc-500 line-through' : undefined}
            >
              {t.text}
            </span>
            <button
              type="button"
              onClick={() => dispatch({ type: 'remove', id: t.id })}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
      },
    ],
  },
  {
    id: 'rx-memo-list',
    difficulty: 'mid',
    title: 'Stable callbacks for a memoized row',
    scenario: `You render a long list of \`ItemRow\` components. Each row is wrapped in \`React.memo\`. The parent holds \`items: { id: string; label: string }[]\` and a \`selectedId: string | null\`.

Pass \`onSelect(id: string)\` from the parent. **Without** \`useCallback\`, the parent recreates \`onSelect\` every render and memo on rows is useless.

Implement the parent \`ItemList\` so that:
• \`onSelect\` is stable across renders when behavior does not change (\`useCallback\` with correct deps—likely \`setSelectedId\` from \`useState\` is stable, so deps can be empty or include only what’s needed).
• \`ItemRow\` is typed as \`memo(function ItemRow(props: { id: string; label: string; selected: boolean; onSelect: (id: string) => void }))\`.

Brief comment in code explaining why \`useCallback\` matters is a plus.`,
    constraints: [
      'Use React.memo and useCallback explicitly.',
      'Do not use external memoization libraries.',
    ],
    hints: [
      'const onSelect = useCallback((id: string) => { setSelectedId(id); }, []);',
      'ItemRow receives onSelect and calls onSelect(props.id) on click.',
      'memo compares props shallowly—stable onSelect reference keeps rows from re-rendering when parent re-renders for other reasons.',
    ],
    answerFiles: [
      {
        path: 'ItemList.tsx',
        language: 'tsx',
        code: `'use client';

import { memo, useCallback, useState } from 'react';

interface Item {
  id: string;
  label: string;
}

/** Memoized: avoids re-render unless props change; onSelect must be stable from parent. */
const ItemRow = memo(function ItemRow({
  id,
  label,
  selected,
  onSelect,
}: {
  id: string;
  label: string;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={selected ? 'font-bold' : undefined}
      onClick={() => onSelect(id)}
    >
      {label}
    </button>
  );
});

const SAMPLE: Item[] = [
  { id: '1', label: 'Alpha' },
  { id: '2', label: 'Beta' },
  { id: '3', label: 'Gamma' },
];

export function ItemList() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const onSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <ul className="flex flex-col gap-1">
      {SAMPLE.map((item) => (
        <li key={item.id}>
          <ItemRow
            id={item.id}
            label={item.label}
            selected={selectedId === item.id}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}
`,
      },
    ],
  },
]
