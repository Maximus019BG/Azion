// components/CircularProgress.tsx

import React from 'react';

interface CircularProgressProps {
  percentage: number; // Percentage value (0 to 100)
  size?: number; // Optional size for the circle
  strokeWidth?: number; // Optional stroke width
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 100, // Default size
  strokeWidth = 8, // Default stroke width
}) => {
  const radius = 15; // Radius of the circle
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="relative flex justify-center items-center"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        className="absolute -rotate-90"
        viewBox="0 0 36 36"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Background Circle */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          className="stroke-current text-gray-200"
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          className="stroke-current text-lightAccent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Percentage Text */}
      <div className="absolute flex justify-center items-center w-full h-full">
        <span className="text-2xl font-bold text-lightAccent">{percentage}%</span>
      </div>
    </div>
  );
};

export default CircularProgress;
