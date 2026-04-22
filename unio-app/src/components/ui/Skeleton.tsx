import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 14, borderRadius = 6, style }: SkeletonProps) {
  return (
    <div
      className="skeleton-shimmer"
      style={{ width, height, borderRadius, flexShrink: 0, ...style }}
    />
  );
}

/** Circle variant — for avatars */
export function SkeletonCircle({ size = 40, style }: { size?: number; style?: React.CSSProperties }) {
  return <Skeleton width={size} height={size} borderRadius={size} style={style} />;
}

/** Full-width text line — multiple lines */
export function SkeletonText({ lines = 1, gap = 8 }: { lines?: number; gap?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={13} width={i === lines - 1 && lines > 1 ? '65%' : '100%'} />
      ))}
    </div>
  );
}
