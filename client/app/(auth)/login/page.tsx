"use client";
import React, {useEffect, useState} from "react";
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "../../api/config";
import {Poppins} from "next/font/google";
import OTP from "../../components/OTP";
import Cookies from "js-cookie";
import Link from "next/link";
import {authSessionCheck} from "@/app/func/funcs";
import GoogleLoginButton from "@/app/components/_auth/googleSSO";
import ReturnButton from "@/app/components/ReturnButton";

interface Token {
    refreshToken: string;
    accessToken: string;
}

const headerText = Poppins({subsets: ["latin"], weight: "900"});


const Login = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [OTPNeeded, setOTPNeeded] = useState<boolean>(false);
    const [emailError, setEmailError] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");

    const Login = async (data: any) => {
        axios
            .post(`${apiUrl}/auth/login`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then(async function (response: AxiosResponse) {
                if (response.data.message === "OTP required" || response.status === 204) {
                    await setOTPNeeded(true);
                    await showModal();
                } else {
                    const accessToken = response.data.accessToken;
                    const refreshToken = response.data.refreshToken;
                    window.location.href = "/organizations";
                    Cookies.set("azionAccessToken", accessToken, {
                        secure: true,
                        sameSite: "Strict",
                    });
                    Cookies.set("azionRefreshToken", refreshToken, {
                        secure: true,
                        sameSite: "Strict",
                    });
                }
            }).catch(function (error: any) {
            if (error.response) {
                alert(error.response.data);
            } else {
                alert("An error occurred, but no server response was received.");
            }

        });
    };

    useEffect(() => {
        if (Cookies.get("azionAccessToken") && Cookies.get("azionRefreshToken")) {
            authSessionCheck();
        }
    }, []);

    //Request before OTP
    const handleSubmitNoOTP = () => {
        let valid = true;
        if (!email) {
            setEmailError("Email is required");
            valid = false;
        } else {
            setEmailError("");
        }

        if (!password) {
            setPasswordError("Password is required");
            valid = false;
        } else {
            setPasswordError("");
        }

        if (valid) {
            const userData = {
                email,
                password,
            };
            Login(userData);
        }
    };

    //Request after OTP only in needed
    const handleSubmit = (otp: string) => {
        let valid = true;
        if (!email) {
            setEmailError("Email is required");
            valid = false;
        } else {
            setEmailError("");
        }

        if (!password) {
            setPasswordError("Password is required");
            valid = false;
        } else {
            setPasswordError("");
        }

        if (valid) {
            const userData = {
                email,
                password,
                OTP: otp,
            };
            Login(userData);
        }
    };

    const showModal = () => {
        const modal = document.getElementById(
            "modal_5"
        ) as HTMLDialogElement | null;
        if (modal) {
            modal.showModal();
        } else {
            console.error("Modal element not found");
        }
    };

    return (
        <div className="flex flex-col w-screen h-screen text-white justify-center items-center gap-10 p-4">
            <div className="absolute top-4 left-4">
                <ReturnButton to={"/"}/>
            </div>
            <h1 className={`text-lightAccent text-6xl font-extrabold text-center mb-6 ${headerText.className}`}>
                Login
            </h1>

            {/* Input Fields */}
            <div className="w-full flex flex-col gap-3 max-w-sm">
                <input
                    onChange={(e) => setEmail(e.target.value)}
                    type="text"
                    placeholder="Enter your email"
                    className="bg-gray-700 text-white pl-4 h-12 placeholder:text-gray-400 rounded-lg w-full hover:bg-gray-600 transition"
                />
                {emailError && <p className="text-red-500">{emailError}</p>}
                <input
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Password"
                    className="bg-gray-700 text-white pl-4 h-12 rounded-lg w-full placeholder:text-gray-400 hover:bg-gray-600 transition"
                />
                {passwordError && <p className="text-red-500">{passwordError}</p>}
            </div>

            <button
                onClick={OTPNeeded ? showModal : handleSubmitNoOTP}
                className="bg-lightAccent text-xl text-white font-black w-full max-w-sm py-3 rounded-lg hover:scale-105 transition transform"
            >
                Continue
            </button>

            {/* Buttons and Links */}
            <div className="w-full flex flex-col justify-center items-center gap-2">
                <p className="text-white font-bold text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-lightAccent hover:text-sky-400 font-bold underline">
                        Register
                    </Link>
                </p>
                <p className="text-white font-bold text-center">
                    Login using{" "}
                    <Link href="/login/fast" className="text-lightAccent hover:text-sky-400 font-bold underline">
                        Your Face
                    </Link>
                </p>
                <p className="text-white font-bold text-center">
                    Forgot your{" "}
                    <Link href="/forgot-password" className="text-lightAccent hover:text-sky-400 font-bold underline">
                        Password?
                    </Link>
                </p>
                <div className="h-fit mt-4">
                    <GoogleLoginButton text="Sign in with Google"/>
                </div>
            </div>

            {/* OTP Modal */}
            <dialog id="modal_5" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box flex flex-col items-center gap-6">
                    <h1 className="text-2xl font-bold">Enter your One-Time-Password (OTP)</h1>
                    <p className="text-center text-sm">
                        Check your authenticator app on your phone for the OTP
                    </p>
                    <OTP length={6} onComplete={handleSubmit}/>
                    <form method="dialog">
                        <button className="btn bg-accent text-white px-12 py-2 rounded-lg hover:scale-105 transition">
                            Submit
                        </button>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default Login;
