'use client';

import { useExampleStore } from '@/stores/example-store';

export function CounterExample() {
  const { count, increment, decrement, reset } = useExampleStore();

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold">Zustand Counter Example</h2>
      <p className="text-4xl font-mono">{count}</p>
      <div className="flex gap-2">
        <button
          onClick={decrement}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Decrement
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={increment}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Increment
        </button>
      </div>
    </div>
  );
}
