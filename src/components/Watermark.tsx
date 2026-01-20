import React from 'react';

export const Watermark: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-4 opacity-[0.15] pointer-events-none select-none">
      <div className="transform -rotate-12 text-red-600 text-center">
        <h2 className="text-4xl font-black tracking-[0.2em] leading-none">
          樣本
        </h2>
        <p className="text-sm font-bold tracking-widest mt-1">
          SAMPLE
        </p>
      </div>
    </div>
  );
};
