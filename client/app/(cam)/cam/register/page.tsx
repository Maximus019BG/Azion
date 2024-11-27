"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { apiUrl } from '@/app/api/config';
import Cookies from 'js-cookie';

export default function RegisterCam() {
    const [camId, setCamId] = useState('');
    const [roleLevel, setRoleLevel] = useState(0);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const accessToken = Cookies.get('azionAccessToken');

        const payload = {
            camName: camId,
            roleLevel
        };

        try {
            const response = await axios.post(`${apiUrl}/cam/add`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': accessToken
                }
            });
            alert('Camera registered successfully');
        } catch (error: any) {
            console.error("Error registering camera: ", error);
            alert(error.response.data);
        }
    };

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center gap-16 bg-background relative">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Cam ID"
                    value={camId}
                    onChange={(e) => setCamId(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                    required
                />
                <input
                    type="number"
                    placeholder="Role Level"
                    value={roleLevel}
                    onChange={(e) => setRoleLevel(parseInt(e.target.value))}
                    className="p-2 border border-gray-300 rounded"
                    required
                />
                <button
                    type="submit"
                    className="text-white bg-accent w-fit font-black text-2xl px-56 py-3 rounded-3xl hover:scale-105 transition-all ease-in"
                >
                    Register Cam
                </button>
            </form>
        </div>
    );
}