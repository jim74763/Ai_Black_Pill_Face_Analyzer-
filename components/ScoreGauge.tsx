
import React from 'react';

interface ScoreGaugeProps {
  score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;

  const scoreColor = score < 4 ? 'text-red-400' : score < 7 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="relative flex items-center justify-center w-52 h-52">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        {/* Background Circle */}
        <circle
          className="text-base-300"
          strokeWidth="15"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="100"
          cy="100"
        />
        {/* Progress Circle */}
        <circle
          className="text-brand-primary"
          strokeWidth="15"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="100"
          cy="100"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: 'stroke-dashoffset 0.5s ease-out',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-5xl font-bold ${scoreColor}`}>
          {score.toFixed(1)}
        </span>
        <span className="text-lg text-gray-400">/ 10</span>
      </div>
    </div>
  );
};

export default ScoreGauge;
