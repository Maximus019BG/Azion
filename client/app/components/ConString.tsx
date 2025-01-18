"use client";
import React from "react";
import {Poppins} from "next/font/google";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCopy} from "@fortawesome/free-solid-svg-icons";

interface ConStringProps {
    value: string;
    name: string;
}

const headerText = Poppins({subsets: ["latin"], weight: "800"});

const ConString: React.FC<ConStringProps> = ({value, name}) => {
    const toDashboard = () => {
        window.location.href = `/dashboard/${name}`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
        alert("Connection code copied to clipboard!");
    };

    return (
        <div
            className="w-full h-2/3 md:w-11/12 flex flex-col justify-center items-center bg-base-300 rounded-xl border-2 border-accent max-w-full p-4 md:p-8 gap-5">
            <h1 className={`text-white max-w-2xl text-md md:text-xl lg:text-3xl text-center ${headerText.className}`}>
                <span
                    className="font-black text-lightAccent text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Congrats!!!</span>
                <br/>
                <br/> You have successfully created an organization!
            </h1>

            <div className="flex flex-col justify-center items-center max-w-2xl gap-4">
                <h2 className="mt-6 text-white text-md sm:text-lg md:text-xl lg:text-2xl text-center">
                    Your connection code is:
                    <span className="mt-4 font-extrabold"> {value} </span>
                    <button onClick={copyToClipboard} className="ml-2 text-lightAccent hover:text-accent">
                        <FontAwesomeIcon icon={faCopy}/>
                    </button>
                </h2>
                <p className="text-white text-xs sm:text-sm md:text-md lg:text-lg text-center">
                    With this connection code your employees can join
                </p>
            </div>

            <button
                onClick={toDashboard}
                className="bg-lightAccent text-slate-50 font-extrabold w-36 h-10 text-sm md:text-lg rounded-full hover:bg-accent transition-all duration-300 sm:w-40 sm:h-12 md:w-44 md:h-14 lg:w-48 lg:h-16"
            >
                Go to dashboard
            </button>
        </div>
    );
};

export default ConString;