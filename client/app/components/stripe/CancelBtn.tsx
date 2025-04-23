"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {apiUrl} from "@/app/api/config"

export default function CancelPage() {
    const [status, setStatus] = useState('processing');

    useEffect(() => {
        const cancelSubscription = async () => {
            try {
                const res = await axios.post(`${apiUrl}/api/subscription/cancel`, {
                    userId: '123456',
                });

                if (res.status === 200) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error('Cancellation failed:', error);
                setStatus('error');
            }
        };

        cancelSubscription();
    }, []);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center text-white bg-gray-900 px-4">
            {status === 'processing' && (
                <p className="text-lg font-semibold">Cancelling your subscription...</p>
            )}
            {status === 'success' && (
                <p className="text-green-500 text-lg font-semibold">Your subscription has been cancelled.</p>
            )}
            {status === 'error' && (
                <p className="text-red-500 text-lg font-semibold">Something went wrong. Please contact support.</p>
            )}
        </div>
    );
}
