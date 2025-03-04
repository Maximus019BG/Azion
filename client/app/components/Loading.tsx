import React from "react";
import {Poppins} from "next/font/google";
import Image from "next/image";

const headerText = Poppins({subsets: ["latin"], weight: "900"});

const Loading = () => {
    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center p-4">
            <Image
                src="/logo.png"
                alt="Azion loading image"
                width={150}
                height={150}
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48"
            />
            <h1 className={`${headerText.className} text-foreground m-8 sm:m-12 md:m-16 text-2xl sm:text-3xl md:text-4xl lg:text-5xl`}>
                Azion is loading{" "}
                <span className="ml-4 sm:ml-6 loading loading-spinner loading-md sm:loading-lg"></span>
            </h1>
        </div>
    );
};

export default Loading;