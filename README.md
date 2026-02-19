# Project Planner

An interactive Gantt-style roadmap planner built with React, TypeScript, and Tailwind CSS.

**[Live Demo](https://abnth.github.io/project-planner/)**

## Features

- **Swim lanes** -- organize tasks across multiple workstreams (Design, Engineering, QA, Marketing)
- **Drag & drop** -- move and resize tasks directly on the timeline
- **Dependencies** -- finish-to-start arrows with cascading shift logic
- **Working days** -- durations skip weekends automatically; weekend columns are visually shaded
- **Multiple roadmaps** -- switch between plan variants (Product Launch, Accelerated, Consolidated)
- **Milestones** -- mark key dates on the timeline
- **Zoom levels** -- Day / Week / Month views
- **JSON editor** -- inspect and edit roadmap data as JSON
- **Export / Import** -- save roadmaps to JSON files and load them back
- **Auto-save** -- changes persist in localStorage

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via the included GitHub Actions workflow.

## License

MIT
