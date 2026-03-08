"use client";

import { getScoreColor } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  label: string;
  size?: number;
}

export default function ScoreRing({ score, label, size = 80 }: ScoreRingProps) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="6"
          />
          {/* Score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-ring"
            style={{
              filter: `drop-shadow(0 0 4px ${color}60)`,
              transition: "stroke-dashoffset 1.2s ease-out",
            }}
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-display font-bold"
            style={{
              fontSize: size * 0.26,
              color,
              lineHeight: 1,
            }}
          >
            {score}
          </span>
        </div>
      </div>

      <span className="text-xs font-medium text-text-secondary text-center leading-tight">
        {label}
      </span>
    </div>
  );
}
