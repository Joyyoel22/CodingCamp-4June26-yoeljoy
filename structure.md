# Project Structure

## Layout

```
CodingCamp-4June26-yoeljoy/
├── index.html          # Single HTML entry point
├── css/
│   └── style.css       # Only CSS file — all styles here
├── js/
│   └── app.js          # Only JS file — all logic here
├── .kiro/
│   └── steering/       # AI assistant guidance
└── README.md
```

## Strict Folder Rules

- **Only 1 CSS file** — `css/style.css`. No additional stylesheets.
- **Only 1 JS file** — `js/app.js`. No additional scripts.
- No `node_modules/`, no `package.json`, no build output folders.

## JS Module Organization (inside app.js)

Group code into clearly commented sections in this order:

1. **Constants & State** — localStorage keys, default values, runtime state
2. **Utilities** — shared helper functions (e.g., `saveToStorage`, `loadFromStorage`)
3. **Greeting** — time/date display, custom name, time-of-day message
4. **Timer** — Pomodoro countdown logic, configurable duration, start/stop/reset
5. **To-Do List** — CRUD operations, duplicate check, sort, localStorage sync
6. **Quick Links** — add/remove links, open in new tab, localStorage sync
7. **Theme** — light/dark toggle, persist preference
8. **Init** — `DOMContentLoaded` bootstrap, wire up all event listeners

## CSS Organization (inside style.css)

1. CSS custom properties (`:root` light theme variables)
2. Dark mode overrides (`[data-theme="dark"]`)
3. Reset / base styles
4. Layout & grid
5. Component styles (greeting, timer, todo, links) in the same order as HTML
6. Utility classes
7. Media queries
