'use client';

import { PushupType } from '@/types/pushup';
import { PUSHUP_CONFIGS } from '@/config/pushup-types';

export function PushupTypeSelector() {
  const types: PushupType[] = ['wall', 'knee', 'standard'];

  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {types.map((type) => {
          const config = PUSHUP_CONFIGS[type];
          return (
            <a
              key={type}
              href={`/description?type=pushup&subtype=${type}`}
              className="bg-gray-800 hover:bg-gray-700 rounded-xl p-8 transition-all transform hover:scale-105 hover:shadow-xl border-2 border-gray-700 hover:border-blue-500 block"
            >
              <div className="text-6xl mb-4">{config.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{config.nameKo}</h2>
              <p className="text-sm text-gray-400 mb-4">{config.name}</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                {config.description}
              </p>
              
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>구부림: {config.thresholds.elbowDown}°</div>
                  <div>펴기: {config.thresholds.elbowUp}°</div>
                  <div className="text-yellow-400 font-semibold mt-2">
                    {type === 'wall' && '난이도: ⭐'}
                    {type === 'knee' && '난이도: ⭐⭐'}
                    {type === 'standard' && '난이도: ⭐⭐⭐'}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <div className="mt-12 text-sm text-gray-500 max-w-2xl text-center">
        <p>💡 처음 시작하시는 분은 <strong className="text-white">벽 대고 푸시업</strong>부터 시작하세요!</p>
      </div>
    </div>
  );
}
