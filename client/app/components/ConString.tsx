"use client";

import React, {useState} from "react";
import {Poppins} from 'next/font/google';
import {Check, Copy} from 'lucide-react';

interface ConStringProps {
    value: string;
}

const poppins = Poppins({subsets: ["latin"], weight: ["400", "600", "800"]});

const ConString: React.FC<ConStringProps> = ({value}) => {
    const [copied, setCopied] = useState(false);

    const toDashboard = () => {
        window.location.href = `/dashboard`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="w-full max-w-xl mx-auto p-6 md:p-8 bg-base-300 rounded-xl border-2 border-accent shadow-lg flex flex-col items-center justify-center gap-6 text-center">
            {/* Celebration Icon */}
            <div className="text-4xl">🎉</div>

            {/* Header */}
            <div className="space-y-2">
                <h1 className={`text-2xl md:text-3xl font-extrabold text-lightAccent ${poppins.className}`}>
                    Congrats!
                </h1>
                <p className="text-gray-400">
                    You have successfully created an organization!
                </p>
            </div>

            {/* Connection Code */}
            <div className="w-full space-y-2">
                <h2 className="text-sm font-medium text-gray-400">Your connection code is:</h2>
                <div className="flex items-center justify-center gap-2">
                    <div className="bg-base-100 px-4 py-3 rounded-lg font-mono text-lg font-bold">
                        {value}
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className="h-10 w-10 flex items-center justify-center rounded-md bg-base-100 hover:bg-base-200 transition-colors"
                    >
                        {copied ?
                            <Check className="h-5 w-5 text-green-500"/> :
                            <Copy className="h-5 w-5 text-gray-400"/>
                        }
                    </button>
                </div>
                <p className="text-sm text-gray-500">
                    With this connection code your employees can join your organization
                </p>
            </div>

            {/* Dashboard Button */}
            <button
                onClick={toDashboard}
                className="px-6 py-2 bg-accent hover:bg-blue-700 text-white font-semibold rounded-full transition-colors"
            >
                Go to dashboard
            </button>
        </div>
    );
};

export default ConString;
