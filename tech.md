# Tech Stack

## Stack

- **HTML5** — semantic structure, single `index.html`
- **CSS3** — custom properties (variables) for theming, single `css/style.css`
- **Vanilla JavaScript (ES6+)** — no frameworks or libraries, single `js/app.js`
- **localStorage API** — all persistence (tasks, links, settings)

## No Build Tools

There is no build step, bundler, or package manager. Open `index.html` directly in a browser or serve via GitHub Pages.

## Deployment

- Version control: Git via GitHub Desktop
- Hosting: GitHub Pages (static site from `main` branch root)

## Common Commands

```bash
# Open locally — just open index.html in a browser

# Push to GitHub (GitHub Desktop or CLI)
git add .
git commit -m "your message"
git push origin main
```

## Code Style

- 2-space indentation
- `camelCase` for JS variables and functions
- `kebab-case` for CSS class names and IDs
- CSS custom properties for all colors/theme values (enables light/dark mode)
- No `var` — use `const` and `let`
- No inline styles — all styling via `css/style.css`
