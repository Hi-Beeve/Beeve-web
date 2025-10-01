import Link from "next/link";
import { CounterExample } from "@/components/counter-example";

export default function Home() {
  return (
    <div className="font-sans flex items-center justify-center min-h-screen p-8">
      <main className="flex flex-col gap-8 items-center max-w-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Beeve Web</h1>
          <p className="text-muted-foreground">
            Next.js + TypeScript + shadcn/ui + Zustand + MediaPipe
          </p>
        </div>
        
        <CounterExample />

        <div className="flex gap-4">
          <Link
            href="/mediapipe-test"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            MediaPipe Test →
          </Link>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Edit <code className="bg-muted px-2 py-1 rounded">src/app/page.tsx</code> to get started</p>
        </div>
      </main>
    </div>
  );
}
