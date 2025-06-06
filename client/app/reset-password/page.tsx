"use client";
import {useSearchParams} from "next/navigation";
import React, {Suspense, useState} from "react";
import axios from "axios";
import {apiUrl} from "@/app/api/config";
import {Poppins} from "next/font/google";

const HeaderText = Poppins({subsets: ["latin"], weight: "600"});

const Reset = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        try {
            const response = await axios.put(`${apiUrl}/auth/reset-password`, {
                token,
                password,
            });
            window.location.href = "/login";
        } catch (error) {
            setMessage("Error resetting password");
        }
    };

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center">
            <div className="w-1/3 h-3/4 rounded-badge bg-slate-900 flex flex-col justify-center items-center gap-16">
                <title>Reset Password</title>
                <h1 className={`text-white text-5xl ${HeaderText.className}`}>Reset Password</h1>
                <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center gap-8">
                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-72 h-10 bg-slate-800 text-white placeholder:text-white pl-4 rounded-md"
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-72 h-10 bg-slate-800 text-white placeholder:text-white pl-4 rounded-md"
                    />
                    <button type="submit" className={`text-white w-40 md:w-64 lg:w-72 h-10 md:h-12 lg:h-14 bg-accent rounded-2xl text-base md:text-lg lg:text-xl hover:bg-blue-700 ${HeaderText.className}`}>Reset Password</button>
                </form>
                <p>{message}</p>
            </div>
        </div>
    );
};

const ResetPassword = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Reset/>
        </Suspense>
    );
};

export default ResetPassword;