import React, { useState } from 'react';

// Single-metric Bar Chart
export interface BarItem {
  label: string;
  value: number;
  color?: string;
  subtext?: string;
}

export const BarChart: React.FC<{
  data: BarItem[];
  title?: string;
  unit?: string;
  maxValue?: number;
  height?: number;
}> = ({ data, title, unit = '', maxValue, height = 220 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1) * 1.15;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 45;
  const width = 500;
  const chartHeight = height;

  const barWidth = Math.min(48, Math.max(18, (width - paddingLeft - paddingRight) / (data.length * 1.6)));
  const totalSlots = data.length;
  const slotWidth = (width - paddingLeft - paddingRight) / totalSlots;

  return (
    <div className="chart-card">
      {title && <h4 className="chart-title">{title}</h4>}
      <div className="chart-svg-container">
        <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full h-auto">
          {/* Y-axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartHeight - paddingBottom - ratio * (chartHeight - paddingTop - paddingBottom);
            const val = (ratio * max).toFixed(unit === '%' ? 0 : 1);
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray={ratio > 0 ? '3 3' : 'none'}
                />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10">
                  {val}
                  {unit}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, idx) => {
            const x = paddingLeft + idx * slotWidth + (slotWidth - barWidth) / 2;
            const barH = Math.max(2, (item.value / max) * (chartHeight - paddingTop - paddingBottom));
            const y = chartHeight - paddingBottom - barH;
            const isHovered = hoveredIdx === idx;
            const barColor = item.color || '#3b82f6';

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={4}
                  fill={barColor}
                  opacity={hoveredIdx !== null && !isHovered ? 0.45 : 0.9}
                  className="transition-all duration-200"
                />
                {/* Value on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fill={isHovered ? '#f8fafc' : '#94a3b8'}
                  fontSize="11"
                  fontWeight={isHovered ? '600' : '500'}
                >
                  {item.value}
                  {unit}
                </text>
                {/* X-axis label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - paddingBottom + 16}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {hoveredIdx !== null && data[hoveredIdx]?.subtext && (
        <div className="chart-tooltip-footer text-xs text-slate-400 mt-2 px-2 py-1 bg-slate-800/60 rounded">
          <span className="font-semibold text-slate-200">{data[hoveredIdx].label}:</span> {data[hoveredIdx].subtext}
        </div>
      )}
    </div>
  );
};

// Multi-series Line Chart
export interface LineSeries {
  id: string;
  name: string;
  color: string;
  data: { x: number; y: number }[];
}

export const MultiLineChart: React.FC<{
  series: LineSeries[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  unit?: string;
  height?: number;
}> = ({ series, title, xLabel, yLabel, unit = '', height = 240 }) => {
  const [activeSeries, setActiveSeries] = useState<string | null>(null);

  const width = 560;
  const chartHeight = height;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 45;

  const allX = series.flatMap((s) => s.data.map((d) => d.x));
  const allY = series.flatMap((s) => s.data.map((d) => d.y));

  const minX = Math.min(...allX, 0);
  const maxX = Math.max(...allX, 100);
  const minY = 0;
  const maxY = Math.max(...allY, 100) * 1.08;

  const getSvgX = (val: number) =>
    paddingLeft + ((val - minX) / (maxX - minX || 1)) * (width - paddingLeft - paddingRight);
  const getSvgY = (val: number) =>
    chartHeight - paddingBottom - ((val - minY) / (maxY - minY || 1)) * (chartHeight - paddingTop - paddingBottom);

  return (
    <div className="chart-card">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
        {title && <h4 className="chart-title">{title}</h4>}
        {/* Interactive Legend */}
        <div className="flex items-center gap-3 text-xs">
          {series.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSeries(activeSeries === s.id ? null : s.id)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition ${
                activeSeries && activeSeries !== s.id ? 'opacity-35' : 'opacity-100 font-medium'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-slate-300">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="chart-svg-container">
        <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full h-auto">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartHeight - paddingBottom - ratio * (chartHeight - paddingTop - paddingBottom);
            const val = (minY + ratio * (maxY - minY)).toFixed(unit === '%' ? 0 : 1);
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10">
                  {val}
                  {unit}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {series[0]?.data.map((pt, i) => (
            <text
              key={i}
              x={getSvgX(pt.x)}
              y={chartHeight - paddingBottom + 18}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
            >
              {pt.x}
            </text>
          ))}

          {/* Lines & Points */}
          {series.map((s) => {
            const isFaded = activeSeries && activeSeries !== s.id;
            const pointsStr = s.data.map((pt) => `${getSvgX(pt.x)},${getSvgY(pt.y)}`).join(' ');

            return (
              <g key={s.id} opacity={isFaded ? 0.2 : 1}>
                {/* Polyline */}
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={activeSeries === s.id ? 3.5 : 2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data points */}
                {s.data.map((pt, i) => (
                  <circle
                    key={i}
                    cx={getSvgX(pt.x)}
                    cy={getSvgY(pt.y)}
                    r={activeSeries === s.id ? 4.5 : 3.5}
                    fill={s.color}
                    stroke="#0f172a"
                    strokeWidth={1.5}
                  >
                    <title>{`${s.name}: ${pt.y}${unit} at x=${pt.x}`}</title>
                  </circle>
                ))}
              </g>
            );
          })}

          {/* Axis Labels */}
          {xLabel && (
            <text x={width / 2} y={chartHeight - 6} textAnchor="middle" fill="#64748b" fontSize="10">
              {xLabel}
            </text>
          )}
          {yLabel && (
            <text
              x={14}
              y={chartHeight / 2}
              textAnchor="middle"
              fill="#64748b"
              fontSize="10"
              transform={`rotate(-90 14 ${chartHeight / 2})`}
            >
              {yLabel}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
};
