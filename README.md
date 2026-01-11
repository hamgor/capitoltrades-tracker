# Congress Trade Pulse

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hamgor/capitoltrades-tracker)

Congress Trade Pulse is a modern full-stack application built on Cloudflare Workers, featuring a React frontend with shadcn/ui components, Tailwind CSS styling, and a Hono backend with Durable Objects for persistent state management. Track congressional trading activity with real-time data, counters, and demo endpoints showcasing Cloudflare's edge capabilities.

## ✨ Key Features

- **Full-Stack on Cloudflare**: React + Vite frontend served via Workers Sites, Hono API backend with CORS.
- **Durable Objects**: Global state management for counters and demo items with SQLite persistence.
- **Modern UI**: shadcn/ui components, Tailwind CSS with custom animations, dark mode support.
- **API Endpoints**: Health checks, client error reporting, demo CRUD operations, and counter management.
- **Developer Experience**: Hot reload, TypeScript end-to-end, TanStack Query, React Router.
- **Production Ready**: Error boundaries, logging, observability enabled.
- **Responsive Design**: Mobile-first, theme-aware, with sidebar layout option.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide icons, Framer Motion, Sonner toasts, TanStack Query, React Router.
- **Backend**: Hono, Cloudflare Workers, Durable Objects (SQLite), Workers Types.
- **Utilities**: clsx, tailwind-merge, Zod, Immer, Zustand, date-fns, Recharts.
- **Dev Tools**: Bun, Wrangler, ESLint, TypeScript 5.
- **Deployment**: Cloudflare Workers & Pages.

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed (`curl -fsSL https://bun.sh/install | bash`)
- [Cloudflare CLI (Wrangler)](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`bunx wrangler@latest init`)

### Installation

```bash
bun install
```

### Development

Start the development server with hot reload for both frontend and worker:

```bash
bun dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3000/api/health (test endpoints like `/api/counter`, `/api/demo`)

### Build for Production

```bash
bun build
```

Output in `dist/` for static assets and worker bundle.

## 📚 Usage

### Frontend

Replace `src/pages/HomePage.tsx` with your app pages. Use `AppLayout` for sidebar layouts.

Example API integration (using TanStack Query):

```tsx
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['demo'],
  queryFn: () => fetch('/api/demo').then(res => res.json()),
});
```

### Backend

Add custom routes in `worker/userRoutes.ts` (e.g., `/api/demo`, `/api/counter`). Access Durable Object storage globally.

Test endpoints:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/counter
curl -X POST http://localhost:3000/api/counter/increment
```

### Environment Variables

Configure in `wrangler.jsonc`:

```jsonc
[vars]
API_KEY = "your-key"
```

## ☁️ Deployment

Deploy to Cloudflare Workers with one command:

```bash
bun deploy
```

Or manually:

1. Login: `wrangler login`
2. Deploy: `wrangler deploy`
3. Types: `wrangler types`

Your app will be live at `https://<your-worker>.<your-subdomain>.workers.dev`.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hamgor/capitoltrades-tracker)

**Custom Domain**: Update `wrangler.jsonc` with `routes` and deploy.

## 🔧 Development Workflow

- **Type Generation**: `bun cf-typegen`
- **Lint**: `bun lint`
- **Preview**: `bun preview`
- **Hot Reload**: Edit `src/` or `worker/userRoutes.ts` – auto-reloads.
- **Custom Durable Objects**: Extend `worker/durableObject.ts`.

**Do not modify** `worker/index.ts` or `worker/core-utils.ts` – use `userRoutes.ts` instead.

## 🤝 Contributing

1. Fork the repo.
2. Create a feature branch (`bun dev`).
3. Commit changes (`bun lint`).
4. Open PR.

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

## 🙌 Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Hono](https://hono.dev/)

Built with ❤️ for Cloudflare Developers.