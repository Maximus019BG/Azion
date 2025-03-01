import React from 'react';

interface ProgressComponentProps {
    progress: number;
}

const ProgressComponent: React.FC<ProgressComponentProps> = ({progress}) => {
    const getProgressColor = () => 'bg-blue-500';

    return (
        <div className="w-full">
            <div className="relative w-full h-4 bg-base-300 rounded">
                <div
                    className={`absolute top-0 left-0 h-4 rounded ${getProgressColor()}`}
                    style={{width: `${progress}%`}}
                ></div>
            </div>
            <p className="font-semibold mt-2">Progress: {progress}%</p>
        </div>
    );
};

export default ProgressComponent;