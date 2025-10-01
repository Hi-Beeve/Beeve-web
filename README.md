# Beeve Web

A modern web application built with Next.js, TypeScript, shadcn/ui, and Zustand.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Package Manager**: npm

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── stores/          # Zustand state stores
├── hooks/           # Custom React hooks
└── lib/             # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Adding shadcn/ui Components

```bash
# Add a component (e.g., button)
npx shadcn@latest add button
```

## State Management

This project uses Zustand for state management. Example store is located at `src/stores/example-store.ts`.

```typescript
import { useExampleStore } from '@/stores/example-store';

// In your component
const { count, increment } = useExampleStore();
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
