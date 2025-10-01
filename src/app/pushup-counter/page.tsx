import Link from 'next/link';
import { PushupCounter } from '@/components/pushup-counter';

export default function PushupCounterPage() {
  return (
    <div className="relative">
      <Link
        href="/"
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
      >
        ← Back to Home
      </Link>
      <PushupCounter />
    </div>
  );
}
