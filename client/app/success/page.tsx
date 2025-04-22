"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import {apiUrl} from "@/app/api/config";
import Cookie from "js-cookie"

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState('Checking payment...');

    useEffect(() => {
        if (sessionId) {
            axios.post(`${apiUrl}/verify-checkout`, { sessionId },{
                headers:{
                    "Content-Type":"application/json",
                    "authorization": Cookie.get("azionAccessToken")
                }
            })
                .then((res) => {
                    if (res.data.success) {
                        setStatus('✅ Payment confirmed! Thank you for your purchase.');
                    } else {
                        setStatus('⚠️ Could not verify payment.');
                    }
                })
                .catch(() => {
                    setStatus('❌ Error verifying payment.');
                });
        }
    }, [sessionId]);

    return (
        <div className="text-center p-10">
            <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
            <p>{status}</p>
        </div>
    );
}
