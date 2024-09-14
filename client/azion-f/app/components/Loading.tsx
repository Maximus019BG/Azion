import React from "react";
import { Poppins } from "next/font/google";
import Image from "next/image";

const headerText = Poppins({ subsets: ["latin"], weight: "900" });

const Loading = () => {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <Image
        src="/logo.png"
        alt="Azion loading image"
        width={150}
        height={150}
      ></Image>
      <h1 className={`${headerText.className} text-foreground m-16 text-5xl`}>
        Azion is loading{" "}
        <span className="loading loading-spinner loading-lg"></span>
      </h1>
      <div className=" flex flex-col justify-center items-center gap-3">
        <p className=" font-bold text-base">Be the BEST Organization</p>
        <p className=" font-bold text-base">In Azion EVERYTHING is Secured</p>
        <p className=" font-bold text-base">
          Not only Organization workers can use Azion, EVERYBODY can
        </p>
      </div>
    </div>
  );
};

export default Loading;
