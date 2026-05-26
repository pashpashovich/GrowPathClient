import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

const DEFAULT_HEIGHT = 260;
const PADDING = { top: 16, right: 12, bottom: 36, left: 44 };

const BoxPlotChart = ({ data, height = DEFAULT_HEIGHT, unit = '%' }) => {
  const plot = useMemo(() => {
    if (!data?.length) return null;

    const allValues = data.flatMap((d) => [
      d.min,
      d.q1,
      d.median,
      d.q3,
      d.max,
      ...(d.outliers || []),
    ]);
    const globalMin = Math.min(...allValues);
    const globalMax = Math.max(...allValues);
    const range = globalMax - globalMin || 1;

    const innerWidth = 320;
    const innerHeight = height - PADDING.top - PADDING.bottom;
    const slotWidth = innerWidth / data.length;

    const scaleY = (value) =>
      PADDING.top + innerHeight - ((value - globalMin) / range) * innerHeight;

    const boxes = data.map((item, index) => {
      const cx = PADDING.left + slotWidth * index + slotWidth / 2;
      const boxWidth = Math.min(36, slotWidth * 0.55);
      const yMin = scaleY(item.min);
      const yMax = scaleY(item.max);
      const yQ1 = scaleY(item.q1);
      const yQ3 = scaleY(item.q3);
      const yMedian = scaleY(item.median);

      return {
        ...item,
        cx,
        boxWidth,
        yMin,
        yMax,
        yQ1,
        yQ3,
        yMedian,
        labelX: cx,
        labelY: height - 8,
      };
    });

    const yTicks = [globalMin, globalMin + range * 0.25, globalMin + range * 0.5, globalMin + range * 0.75, globalMax];

    return {
      width: PADDING.left + innerWidth + PADDING.right,
      height,
      globalMin,
      globalMax,
      yTicks,
      boxes,
      scaleY,
    };
  }, [data, height]);

  if (!plot) return null;

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${plot.width} ${plot.height}`}
        width="100%"
        height={plot.height}
        role="img"
        aria-label="Диаграмма размаха"
      >
        {plot.yTicks.map((tick) => {
          const y = plot.scaleY(tick);
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={plot.width - PADDING.right}
                y1={y}
                y2={y}
                stroke="#e1e2e4"
                strokeDasharray="4 4"
              />
              <text x={4} y={y + 4} fontSize={10} fill="#737685">
                {Math.round(tick)}
                {unit}
              </text>
            </g>
          );
        })}

        {plot.boxes.map((box) => (
          <g key={box.groupKey || box.label}>
            <line
              x1={box.cx}
              x2={box.cx}
              y1={box.yMin}
              y2={box.yQ1}
              stroke="#434654"
              strokeWidth={1.5}
            />
            <line
              x1={box.cx}
              x2={box.cx}
              y1={box.yQ3}
              y2={box.yMax}
              stroke="#434654"
              strokeWidth={1.5}
            />
            <rect
              x={box.cx - box.boxWidth / 2}
              y={box.yQ3}
              width={box.boxWidth}
              height={Math.max(box.yQ1 - box.yQ3, 2)}
              fill="#b2c5ff"
              stroke="#0052cc"
              strokeWidth={1.5}
              rx={2}
            />
            <line
              x1={box.cx - box.boxWidth / 2}
              x2={box.cx + box.boxWidth / 2}
              y1={box.yMedian}
              y2={box.yMedian}
              stroke="#003d9b"
              strokeWidth={2}
            />
            {(box.outliers || []).map((outlier, i) => (
              <circle
                key={`${box.label}-out-${i}`}
                cx={box.cx}
                cy={plot.scaleY(outlier)}
                r={3}
                fill="#BA1A1A"
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
            <text
              x={box.labelX}
              y={box.labelY}
              textAnchor="middle"
              fontSize={9}
              fill="#434654"
            >
              {box.label.length > 14 ? `${box.label.slice(0, 12)}…` : box.label}
            </text>
          </g>
        ))}
      </svg>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        Усы: min–max, ящик: Q1–Q3, линия: медиана, точки: выбросы
      </Typography>
    </Box>
  );
};

export default BoxPlotChart;
