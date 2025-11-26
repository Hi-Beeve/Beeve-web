'use client';

import { PushupType } from '@/types/pushup';
import { PUSHUP_CONFIGS } from '@/config/pushup-types';

export function PushupTypeSelector() {
  const types: PushupType[] = ['wall', 'knee', 'standard'];

  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {types.map((type) => {
          const config = PUSHUP_CONFIGS[type];
          return (
            <a
              key={type}
              href={`/measurement/description?type=pushup&subtype=${type}`}
              className="bg-[#F5F5F5] rounded-[20px] p-8 "
            >
              <h2 className="text-2xl font-bold mb-2">{config.nameKo}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {config.description}
              </p>
              
              <div className="mt-6 pt-2">
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="text-yellow-400 font-semibold">
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
        <p>💡 처음 시작하시는 분은 <strong className="text-[#BDB2DD]">벽 대고 푸시업</strong>부터 시작하세요!</p>
      </div>
    </div>
  );
}
