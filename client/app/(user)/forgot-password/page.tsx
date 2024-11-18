"use client";
import React, {Suspense, useState} from "react";
import axios, {AxiosResponse} from "axios";
import Link from "next/link";
import {apiUrl} from "@/app/api/config";
import {Poppins} from "next/font/google";

// Font import
const HeaderText = Poppins({subsets: ["latin"], weight: "600"});

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response: AxiosResponse = await axios.put(
                `${apiUrl}/auth/forgot-password`,
                {email},
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            setMessage("Password reset link sent to your email.");
            setError(false);
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                setMessage("Unauthorized: Please check your credentials.");
            } else {
                setMessage("Error sending password reset email.");
            }
            setError(true);
        }
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-screen flex justify-center items-center">
                <div
                    className="w-11/12 sm:w-96 bg-base-200 shadow-lg rounded-lg p-6 sm:p-8 flex flex-col justify-evenly items-center">
                    <h1
                        className={`${HeaderText.className} text-2xl sm:text-3xl font-extrabold text-white mb-4 text-center`}
                    >
                        Forgot Password
                    </h1>
                    <p className="text-gray-400 mb-6 text-center text-sm sm:text-base">
                        Enter your email address below to receive a password reset link.
                    </p>
                    <form
                        onSubmit={handleSubmit}
                        className="w-full flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-300 font-medium text-sm sm:text-base">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 text-sm sm:text-base border border-gray-600 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-400"
                                placeholder="example@domain.com"
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 focus:ring-4 focus:ring-blue-300 ${HeaderText.className}`}
                        >
                            Send Reset Link
                        </button>
                    </form>
                    {message && (
                        <p
                            className={`mt-4 text-center text-sm ${
                                error ? "text-red-500" : "text-green-500"
                            }`}
                        >
                            {message}
                        </p>
                    )}
                    <Link
                        href="/login"
                        className={`mt-6 text-blue-500 hover:underline text-sm sm:text-base ${HeaderText.className}`}
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </Suspense>
    );
};

export default ForgotPassword;
