# Questgraph

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/questgraph)

**Questgraph** is a React SPA (Single Page Application) built with **Vite** and deployed on **Cloudflare Workers**.

The project provides an interface for working with graphs/quests using modern visualization libraries and real-time data.

## 🚀 Tech Stack

- **Framework:** React 19 + Vite 5
- **UI Libraries:**
  - Material-UI (MUI) v7
  - MUI X Tree View
  - React Flow (@xyflow/react) for graph visualization
  - react-spring for animations
- **State & Data:**
  - TanStack Query (React Query) for server state management
  - TanStack Router for routing
  - Supabase (real-time + database)
  - Dexie.js (IndexedDB)
  - Yjs + y-indexeddb for CRDT and collaborative editing
- **Styling:**
  - Tailwind CSS v4
  - Emotion (CSS-in-JS)
- **Forms:** React Hook Form
- **Testing:**
  - Jest + Testing Library (unit tests)
  - Cypress (E2E tests)
- **Deployment:** Cloudflare Workers (via Wrangler)

## 📦 Installation

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

## 🛠 Available Commands

| Command | Description |
| :------ | :---------- |
| `npm run dev` | Start local development server (Vite) |
| `npm run build` | Build production version |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Deploy to Cloudflare Workers |
| `npm run test` | Run unit tests (Jest) |
| `npm run cypress:open` | Open Cypress for E2E testing |
| `npm run cypress:run` | Run E2E tests in headless mode |
| `npm run type-check` | TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run gen-types` | Generate TypeScript types from Supabase |

## 🌐 Getting Started

After installing dependencies, start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The main application code is in the `src/` directory:

- `src/pages/` — application pages
- `src/components/` — reusable components
- `src/hooks/` — custom React hooks
- `src/lib/` — utility libraries and configurations
- `src/routes/` — routing configuration

## 🚀 Production Deployment

### Local Build

```bash
npm run build    # Build to dist/ directory
npm run preview  # Preview the build
```

### Deploy to Cloudflare

```bash
npm run deploy
```

This command uses `wrangler pages deploy` to publish your application to Cloudflare Workers.

> **Note:** Make sure you have Cloudflare access configured via `wrangler login` and have created a project in Cloudflare Pages.

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

Jest configuration is in `jest.config.cjs`. Tests are located alongside tested files or in `__tests__/`.

### E2E Tests

```bash
# Interactive mode
npm run cypress:open

# Headless mode
npm run cypress:run
```

Cypress configuration is in `cypress.config.ts`.

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

- Supabase URL and keys
- Other project secrets

### Generate Supabase Types

To automatically generate TypeScript types from your Supabase schema:

```bash
npm run gen-types
```

This will create/update `src/supabase.ts` with current types.

## 📁 Project Structure

```
questgraph/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── layouts/        # Layout components
│   ├── lib/            # Utilities and configurations
│   ├── pages/          # Application pages
│   ├── routes/         # Routing
│   └── utils/          # Helper functions
├── cypress/            # E2E tests
├── public/             # Static assets
├── __mocks__/          # Mocks for tests
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.ts  # Tailwind configuration
├── wrangler.json       # Cloudflare Workers configuration
└── package.json
```

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/material-ui/)
- [React Flow Documentation](https://reactflow.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

## 🤝 Contributing

Contributions are welcome! Please create issues and pull requests to improve the project.

## 📄 License

This project is licensed under the MIT License.
