import React from 'react';

interface CircularProgressProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
                                                               percentage,
                                                               size = 150,
                                                               strokeWidth = 5,
                                                           }) => {
    const radius = 15;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div
            className="relative flex justify-center items-center"
            style={{width: `${size}px`, height: `${size}px`}}
        >
            <svg
                className="absolute -rotate-90"
                viewBox="0 0 36 36"
                xmlns="http://www.w3.org/2000/svg"
                style={{width: '100%', height: '100%'}}
            >
                {/* Background Circle */}
                <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    fill="none"
                    className="stroke-current text-gray-800"
                    strokeWidth={strokeWidth}
                />
                {/* Progress Circle */}
                <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    fill="none"
                    className="stroke-current"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                        stroke: 'url(#gradient)',
                        filter: 'drop-shadow(0 0 6px rgba(0, 0, 0, 0.5))',
                    }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#0ea5e9', stopOpacity: 1}}/>
                        <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 1}}/>
                    </linearGradient>
                </defs>
            </svg>

            {/* Percentage Text */}
            <div className="absolute flex justify-center items-center w-full h-full">
                <span className="text-lg font-extrabold text-white text-center drop-shadow-lg">
                    Top <br/> Workers
                </span>
            </div>
        </div>
    );
};

export default CircularProgress;