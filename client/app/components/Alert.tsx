"use client";
import React, {useEffect, useState} from "react";

const Alert = ({
                   message,
                   type,
                   duration = 2975,
                   onClose,
               }: {
    message: string;
    type: string;
    duration?: number; // Duration in milliseconds
    onClose: () => void;
}) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const interval = 50; // Interval for updating the progress bar
        const decrement = 100 / (duration / interval);

        const timer = setInterval(() => {
            setProgress((prev) => {
                const next = prev - decrement;
                if (next <= 0) {
                    clearInterval(timer);
                    onClose(); // Automatically close the alert
                }
                return next > 0 ? next : 0;
            });
        }, interval);

        return () => clearInterval(timer); // Cleanup timer on unmount
    }, [duration, onClose]);

    return (
        <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md p-4 rounded-lg shadow-lg z-50 bg-gray-900 text-white `}
        >
            <div className="flex items-center justify-between">
                <span>{message}</span>
                <button onClick={onClose} className="ml-4 text-lg font-bold">
                    &times;
                </button>
            </div>
            <div
                className={`h-1 ${type === "success" ? " bg-success":"bg-red-600"} rounded-full mt-2`}
                style={{
                    width: `${progress}%`,
                    transition: "width 50ms linear", // Smooth progress bar animation
                }}
            ></div>
        </div>
    );
};

export default Alert;
