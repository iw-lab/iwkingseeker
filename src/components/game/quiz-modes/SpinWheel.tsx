'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  showResult: boolean;
  isCorrect: boolean;
  onAnswer: (answer: string) => void;
}

const SEGMENT_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
const SEGMENT_HOVER = ['#f87171', '#60a5fa', '#4ade80', '#facc15'];

export default function SpinWheel({
  options,
  correctAnswer,
  selectedAnswer,
  showResult,
  isCorrect,
  onAnswer,
}: Props) {
  const count = options.length;
  const slice = 360 / count;
  const [rotation, setRotation] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const paths = useMemo(() => {
    const cx = 200;
    const cy = 200;
    const r = 190;
    return options.map((_, i) => {
      const startAngle = (i * slice - 90 - slice / 2) * (Math.PI / 180);
      const endAngle = ((i + 1) * slice - 90 - slice / 2) * (Math.PI / 180);
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = slice > 180 ? 1 : 0;
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const midAngle = (i * slice) * (Math.PI / 180);
      const tx = cx + (r * 0.62) * Math.sin(midAngle);
      const ty = cy - (r * 0.62) * Math.cos(midAngle);
      return { d, tx, ty, textRotate: i * slice };
    });
  }, [options, slice]);

  const handleClick = (option: string, i: number) => {
    if (showResult) return;
    const targetAngle = -(i * slice);
    const fullSpins = 360 * 3;
    setRotation((prev) => prev - (prev % 360) + fullSpins + targetAngle);
    setTimeout(() => onAnswer(option), 900);
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 relative">
      {/* Pointer */}
      <div className="relative">
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-3 w-0 h-0 z-20"
          style={{
            borderLeft: '18px solid transparent',
            borderRight: '18px solid transparent',
            borderTop: '30px solid #fbbf24',
            filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.8))',
          }}
        />

        {/* Wheel */}
        <motion.svg
          width={400}
          height={400}
          viewBox="0 0 400 400"
          animate={{ rotate: rotation }}
          transition={{ duration: 0.9, ease: [0.17, 0.67, 0.3, 0.99] }}
          className="drop-shadow-[0_0_30px_rgba(168,85,247,0.35)]"
        >
          <circle cx={200} cy={200} r={195} fill="#1f1535" stroke="#fbbf24" strokeWidth={6} />
          {paths.map((p, i) => {
            const option = options[i]!;
            const isThisCorrect = option === correctAnswer;
            const isThisSelected = option === selectedAnswer;
            const isHover = hoverIdx === i && !showResult;
            const fill =
              showResult && isThisCorrect
                ? '#16a34a'
                : showResult && isThisSelected && !isCorrect
                ? '#dc2626'
                : isHover
                ? SEGMENT_HOVER[i % SEGMENT_HOVER.length]
                : SEGMENT_COLORS[i % SEGMENT_COLORS.length];

            return (
              <g
                key={i}
                onClick={() => handleClick(option, i)}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                className={cn(!showResult && 'cursor-pointer')}
              >
                <path d={p.d} fill={fill} stroke="#fde68a" strokeWidth={3} />
                <text
                  x={p.tx}
                  y={p.ty}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={count <= 4 ? 24 : 18}
                  fontWeight={900}
                  transform={`rotate(${p.textRotate} ${p.tx} ${p.ty})`}
                  style={{
                    paintOrder: 'stroke fill',
                    stroke: 'rgba(0,0,0,0.6)',
                    strokeWidth: 3,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  {option.length > 8 ? `${option.slice(0, 7)}…` : option}
                </text>
              </g>
            );
          })}
          <circle cx={200} cy={200} r={30} fill="#fbbf24" stroke="#1f1535" strokeWidth={4} />
          <circle cx={200} cy={200} r={12} fill="#1f1535" />
        </motion.svg>
      </div>
      <div className="text-center text-base text-yellow-300/90 font-semibold">
        🎯 원하는 답을 돌려라!
      </div>
    </div>
  );
}
