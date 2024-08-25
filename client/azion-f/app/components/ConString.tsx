"use client";
import React, {useEffect, useState} from 'react';
import { Poppins } from 'next/font/google';
import axios  from "axios";
import {apiUrl} from "../api/config";
import Cookies from 'js-cookie';

interface ConStringProps {
    value: string;
  }

const headerText = Poppins({ subsets: ["latin"], weight: "800" });

const ConString: React.FC<ConStringProps> = ({ value }) => {
const toDashboard = () => {
    window.location.href = '/dashboard';
}
    return (
        <div className='rounded-md bg-slate-950'>
            <center>
                <h1 className={`mt-6 text-white text-lg md:text-3xl lg:text-5xl ${headerText.className}`}>
                    Congrats!!! You have successfully created an organization!
                </h1>
            </center>
            <center>
                <h2 className={`mt-6 text-white text-lg md:text-3xl lg:text-5xl ${headerText.className}`}>
                    Your connection string is: {value}
                </h2>
                <p>With this connection string your employees can join</p>
            </center>
            <div className="w-full flex flex-col justify-center items-center gap-5 mt-5">
                <button onClick={toDashboard}>Go to dashboard</button>
            </div>
        </div>
    );
};
export default ConString;