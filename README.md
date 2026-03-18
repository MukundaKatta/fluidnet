# FluidNet

> Interactive explorer for liquid neural networks and next-generation sequence architectures.

## Features

- **Liquid Network Visualizer** -- Real-time canvas animation of neurons with adaptive time constants and ODE-governed dynamics
- **Architecture Browser** -- Compare LTC, CfC, NCP, S4, Mamba, and RWKV architectures with key feature breakdowns
- **Benchmark Dashboard** -- Side-by-side accuracy, latency, memory, and adaptability metrics across tasks (autonomous driving, time series, robotics)
- **Research Papers Hub** -- Curated collection of seminal papers with citation counts, abstracts, and tag filtering
- **Interactive Controls** -- Play/pause simulation, filter benchmarks by task, and select architectures for deep dives

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Framework | Next.js 14 (App Router)             |
| Language  | TypeScript                          |
| UI        | Tailwind CSS, Lucide React          |
| Charts    | Recharts                            |
| State     | Zustand                             |
| Backend   | Supabase (Auth + Database)          |
| Canvas    | HTML5 Canvas API                    |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
fluidnet/
├── src/
│   └── app/
│       └── page.tsx          # Main page with visualizer, architectures, benchmarks, papers
├── public/                   # Static assets
├── tailwind.config.ts        # Tailwind configuration
├── next.config.js            # Next.js configuration
└── package.json
```

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start dev server         |
| `npm run build` | Production build         |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

## License

MIT
