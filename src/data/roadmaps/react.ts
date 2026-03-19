import type { RoadmapData } from './types'

export const reactRoadmap: RoadmapData = {
  "title": "React Student Roadmap: From Zero to Hero",
  "nodes": [
    {
      "id": "1",
      "position": { "x": 0, "y": 300 },
      "data": {
        "label": "1. JavaScript Prerequisites",
        "description": "Before React, you MUST know ES6: Arrow functions, Destructuring, Template Literals, and Array Methods (.map, .filter).",
        "resources": [
          { "title": "JS for React - Scrimba", "url": "https://scrimba.com/learn/learnreact" },
          { "title": "MDN - JavaScript Basics", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript" }
        ]
      }
    },

    /* --- JSX BRANCH --- */
    {
      "id": "2",
      "position": { "x": 300, "y": 100 },
      "data": {
        "label": "2. JSX (The UI Syntax)",
        "description": "JavaScript XML. It looks like HTML but lives in JS. You must understand that it renders to React elements.",
        "resources": [{ "title": "Writing Markup with JSX", "url": "https://react.dev/learn/writing-markup-with-jsx" }]
      }
    },
    {
      "id": "2a",
      "position": { "x": 550, "y": 0 },
      "data": {
        "label": "Expressions in JSX",
        "description": "Using curly braces { } to evaluate JS logic, math, or variables directly inside your HTML-like code.",
        "resources": [{ "title": "JS in JSX", "url": "https://react.dev/learn/javascript-in-jsx-with-curly-braces" }]
      }
    },
    {
      "id": "2b",
      "position": { "x": 550, "y": 100 },
      "data": {
        "label": "JSX Attributes & Props",
        "description": "CamelCase naming (className instead of class) and how attributes are passed to elements.",
        "resources": [{ "title": "HTML vs JSX", "url": "https://react.dev/learn/writing-markup-with-jsx#rules-of-jsx" }]
      }
    },
    {
      "id": "2c",
      "position": { "x": 550, "y": 200 },
      "data": {
        "label": "React Fragments",
        "description": "Using <> and </> to wrap multiple elements without creating unnecessary <div> nodes in the DOM.",
        "resources": [{ "title": "React Fragments", "url": "https://react.dev/reference/react/Fragment" }]
      }
    },

    /* --- COMPONENTS BRANCH --- */
    {
      "id": "3",
      "position": { "x": 300, "y": 500 },
      "data": {
        "label": "3. Components Deep Dive",
        "description": "Components are the heart of React. They are independent, reusable pieces of UI.",
        "resources": [{ "title": "Thinking in React", "url": "https://react.dev/learn/thinking-in-react" }]
      }
    },
    {
      "id": "3a",
      "position": { "x": 550, "y": 400 },
      "data": {
        "label": "Props: Communication",
        "description": "How parents talk to children. Understand that Props are READ-ONLY (immutable).",
        "resources": [{ "title": "Passing Props", "url": "https://react.dev/learn/passing-props-to-a-component" }]
      }
    },
    {
      "id": "3b",
      "position": { "x": 550, "y": 500 },
      "data": {
        "label": "State vs Props",
        "description": "The golden rule: Props are like function arguments, State is like a variable declared inside the function body.",
        "resources": [{ "title": "State: A Memory", "url": "https://react.dev/learn/state-a-components-memory" }]
      }
    },
    {
      "id": "3c",
      "position": { "x": 550, "y": 600 },
      "data": {
        "label": "Conditional Rendering",
        "description": "Using if/else, Ternary (?:), or Logic (&&) to decide what the user sees based on data.",
        "resources": [{ "title": "Conditional Rendering", "url": "https://react.dev/learn/conditional-rendering" }]
      }
    },
    {
      "id": "3d",
      "position": { "x": 550, "y": 700 },
      "data": {
        "label": "Lists & Keys",
        "description": "Using .map() to loop over data. Understand why 'key' is vital for React's performance.",
        "resources": [{ "title": "Rendering Lists", "url": "https://react.dev/learn/rendering-lists" }]
      }
    },

    /* --- HOOKS BRANCH --- */
    {
      "id": "4",
      "position": { "x": 300, "y": 950 },
      "data": {
        "label": "4. Mastering Hooks",
        "description": "Hooks allow you to use React features (like state) without writing old-fashioned classes.",
        "resources": [{ "title": "Rules of Hooks", "url": "https://react.dev/warnings/invalid-hook-call-warning" }]
      }
    },
    {
      "id": "4a",
      "position": { "x": 550, "y": 850 },
      "data": {
        "label": "useState",
        "description": "Must-learn #1: Managing local variables that update the UI when they change.",
        "resources": [{ "title": "useState Reference", "url": "https://react.dev/reference/react/useState" }]
      }
    },
    {
      "id": "4b",
      "position": { "x": 550, "y": 950 },
      "data": {
        "label": "useEffect",
        "description": "Must-learn #2: Handling 'Side Effects' like data fetching or timers. Master the dependency array!",
        "resources": [{ "title": "useEffect Reference", "url": "https://react.dev/reference/react/useEffect" }]
      }
    },
    {
      "id": "4c",
      "position": { "x": 550, "y": 1050 },
      "data": {
        "label": "useContext",
        "description": "Avoid 'Prop Drilling'. Share data (like User Login status) across all components easily.",
        "resources": [{ "title": "useContext Reference", "url": "https://react.dev/reference/react/useContext" }]
      }
    },
    {
      "id": "4d",
      "position": { "x": 550, "y": 1150 },
      "data": {
        "label": "useRef",
        "description": "Accessing DOM nodes directly or keeping values that don't trigger re-renders.",
        "resources": [{ "title": "useRef Reference", "url": "https://react.dev/reference/react/useRef" }]
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "animated": true },
    { "id": "e1-3", "source": "1", "target": "3", "animated": true },
    { "id": "e1-4", "source": "1", "target": "4", "animated": true },
    /* JSX Children */
    { "id": "e2-2a", "source": "2", "target": "2a" },
    { "id": "e2-2b", "source": "2", "target": "2b" },
    { "id": "e2-2c", "source": "2", "target": "2c" },
    /* Component Children */
    { "id": "e3-3a", "source": "3", "target": "3a" },
    { "id": "e3-3b", "source": "3", "target": "3b" },
    { "id": "e3-3c", "source": "3", "target": "3c" },
    { "id": "e3-3d", "source": "3", "target": "3d" },
    /* Hooks Children */
    { "id": "e4-4a", "source": "4", "target": "4a" },
    { "id": "e4-4b", "source": "4", "target": "4b" },
    { "id": "e4-4c", "source": "4", "target": "4c" },
    { "id": "e4-4d", "source": "4", "target": "4d" }
  ]
}