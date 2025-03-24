import React from 'react';

interface GridBackgroundProps {
  className?: string;
}

export function GridBackground({ className = '' }: GridBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden z-0 ${className}`}>
      <div className="absolute inset-0">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(83, 30, 180, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(83, 30, 180, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background"></div>
      </div>
    </div>
  );
} 