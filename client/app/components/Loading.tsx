import React from "react";
import {Poppins} from "next/font/google";

const headerText = Poppins({subsets: ["latin"], weight: "900"});

const Loading = () => {
    return (
        <div className="w-full min-h-screen  flex justify-center items-center">
            <div className="flex flex-col items-center">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-400/20"></div>
                    <div
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
                </div>
                <p className="text-blue-300 mt-4 font-medium">Azion is Loading...</p>
            </div>
        </div>
    );
};

export default Loading;