"use client";
import React, {useEffect, useState} from "react";
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "../../api/config";
import {Poppins} from "next/font/google";
import OTP from "../../components/OTP";
import Cookies from "js-cookie";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleLeft} from "@fortawesome/free-solid-svg-icons";
import {authSessionCheck} from "@/app/func/funcs";

interface Token {
    refreshToken: string;
    accessToken: string;
}

const headerText = Poppins({subsets: ["latin"], weight: "900"});

const AxiosFunction = (data: any) => {
    axios
        .post(`${apiUrl}/auth/login`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(function (response: AxiosResponse) {
            const accessToken = response.data.accessToken;
            const refreshToken = response.data.refreshToken;
            window.location.href = '/organizations';
            Cookies.set('azionAccessToken', accessToken, {
                secure: true,
                sameSite: "None",
            });
            Cookies.set('azionRefreshToken', refreshToken, {
                secure: true,
                sameSite: "Strict",
            });

        })
        .catch(function (error: any) {
            alert(error.response);
        });
};

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (Cookies.get("azionAccessToken") && Cookies.get("azionRefreshToken")) {
            authSessionCheck();
        }
    }, []);

    const handleSubmit = (otp: string) => {
        const userData = {
            email,
            password,
            OTP: otp
        };
        AxiosFunction(userData);
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
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="w-1/2 h-full">
                <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    preload="auto"
                >
                    <source src="/azion.mp4" type="video/mp4"/>
                    Your browser does not support the video tag.
                </video>
            </div>
            <div className="w-1/2 h-full flex flex-col justify-center items-center">
                <div className="h-full min-w-full bg-white flex flex-col justify-evenly items-center p-3 md:p-10">
                    <Link className="absolute right-6 top-6" href="/">
                        <FontAwesomeIcon className=" text-4xl text-lightAccent" icon={faCircleLeft}/>
                    </Link>
                    <h1
                        className={`mt-6 text-lightAccent text-5xl md:text-6xl lg:text-8xl ${headerText.className}`}
                    >
                        Login
                    </h1>
                    <div className="w-full flex flex-col justify-center items-center gap-12">
                        <div className="w-full flex flex-col justify-center items-center gap-3">
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                type="text"
                                style={{outline: "none"}}
                                placeholder="Enter your email:"
                                className="bg-[#ceccc8] text-black pl-6 h-12 placeholder:text-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#c0beba]"
                            />
                        </div>
                        <div className="w-full flex flex-col justify-center items-center gap-3">
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                style={{outline: "none"}}
                                placeholder="Password:"
                                className="bg-[#ceccc8] text-black pl-6 h-12 placeholder:text-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#c0beba]"
                            />
                        </div>
                    </div>
                    <div className=" flex flex-col justify-center items-center gap-5">
                        <button
                            onClick={showModal}
                            className="bg-accent w-fit text-white font-black px-56 py-3 rounded-3xl text-xl hover:scale-105 transition-all ease-in"
                        >
                            Continue
                        </button>

                        <h1 className="text-black">
                            If you don&apos;t have an existing account go to{"  "}
                            <Link
                                href="/register"
                                className=" text-lightAccent hover:text-sky-400 font-black text-xl underline"
                            >
                                Register
                            </Link>
                        </h1>
                        <h1 className="text-black">
                            You can login using only {"  "}
                            <Link
                                href="/login/fast"
                                className=" text-lightAccent hover:text-sky-400 font-black text-xl underline"
                            >
                                Your Face
                            </Link>
                        </h1>
                        <h1 className="text-black">
                            Forgot your {"  "}
                            <Link
                                href="/forgot-password"
                                className=" text-lightAccent hover:text-sky-400 font-black text-xl underline"
                            >
                                Password?
                            </Link>
                        </h1>
                    </div>

                    <dialog
                        id="modal_5"
                        className="modal modal-bottom sm:modal-middle"
                    >
                        <div className="modal-box flex flex-col justify-center items-center h-full ">
                            <div className=" flex flex-col justify-center items-center gap-6 mb-5">
                                <p className=" absolute left-0 top-0 p-5 font-black">
                                    Esc to go back
                                </p>
                                <h1 className=" text-2xl text-center font-black">
                                    Enter your One-Time-Passowrd (OTP)
                                </h1>
                                <p className=" text-center font-medium">
                                    You can find your OTP on your authenticator app on your phone
                                </p>
                            </div>

                            <div className="w-full flex  flex-col justify-center items-center gap-3"></div>
                            <div className="modal-action flex flex-col justify-center items-center gap-12">
                                <div>
                                    <OTP length={6} onComplete={handleSubmit}/>
                                </div>
                                <form method="dialog">
                                    <button
                                        className="btn px-24 text-white bg-accent hover:bg-[#105380] rounded-2xl hover:scale-110 text-lg">
                                        Submit
                                    </button>
                                </form>
                            </div>
                        </div>
                    </dialog>
                </div>
            </div>
        </div>
    );
};

export default Login;
