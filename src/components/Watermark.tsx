import React from 'react';

export const Watermark: React.FC = () => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.08]">
      <div className="transform -rotate-45 text-red-600 text-center select-none">
        <h2 className="text-7xl font-black tracking-[0.3em] leading-none">
          樣本
        </h2>
        <p className="text-2xl font-bold tracking-widest mt-2">
          SAMPLE
        </p>
      </div>
    </div>
  );
};
