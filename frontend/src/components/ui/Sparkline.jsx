import React from 'react';

export default function Sparkline({ 
  data = [], 
  width = 240, 
  height = 42, 
  color = '#18468B', 
  strokeWidth = 1.8 
}) {
  // Fallback data if empty or zero
  const points = data && data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  
  const maxVal = Math.max(...points, 1);
  const minVal = Math.min(...points, 0);
  const range = maxVal - minVal || 1;
  
  const paddingY = 4;
  const usableHeight = height - paddingY * 2;
  const usableWidth = width;
  
  const pointCoords = points.map((val, idx) => {
    const x = (idx / (points.length - 1 || 1)) * usableWidth;
    const normY = (val - minVal) / range;
    const y = height - paddingY - (normY * usableHeight);
    return { x, y };
  });

  // Construct SVG path string with light smoothing
  const pathD = pointCoords.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    const prev = arr[i - 1];
    const cx = ((prev.x + pt.x) / 2).toFixed(1);
    return `${acc} C ${cx},${prev.y.toFixed(1)} ${cx},${pt.y.toFixed(1)} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }, '');

  return (
    <div className="w-full overflow-hidden my-1">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-10 overflow-visible"
        preserveAspectRatio="none"
      >
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
