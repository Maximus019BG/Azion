"use client";
import React, {useEffect, useState} from 'react';
import { Poppins } from 'next/font/google';
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "../api/config";
import Cookies from 'js-cookie';
import {PartOfOrg} from "@/app/func/funcs";

const headerText = Poppins({ subsets: ["latin"], weight: "800" });

const Join_Organization = () => {
    const [connString, setConnString] = useState("");
    const [partOfOrg, setPartOfOrg] = useState(false);

    const handleSubmit = () => {
            if(connString === ""){
                alert(`Please fill in the connection string field.`);
                return;
            }
            const accessToken = Cookies.get('azionAccessToken');
            const data = {
                connString: connString,
                accessToken: accessToken
            }
            axios.post(`${apiUrl}/org/join`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            }).then(function (response) {
                window.location.href = '/dashboard';
            }).catch(function (error) {
                alert("An error occurred, please try again. Error: " + error.response.data.message);
            });
        }

        const CreateOne = () => {
            window.location.href = '/register-organization';
        }



    return (
        <div className=' bg-background w-full h-full flex flex-col justify-center gap-16 items-center rounded-badge'>
            <center>
                <h1
                    className={`mt-6 text-neonAccent text-lg md:text-3xl lg:text-5xl ${headerText.className}`}
                >
                    Join Org
                </h1>
            </center>
            <div className="w-full flex flex-col justify-center items-center gap-5 ">
                <input
                    type="text"
                    placeholder="Connection String"
                    className="w-96 h-12 rounded-3xl p-3 text-white"
                    value={connString}
                    onChange={(e) => setConnString(e.target.value)}
                />
                <button
                    className={` neon-text w-40 md:w-64 lg:w-72 h-10 md:h-12 lg:h-14 bg-[#072a40] rounded-2xl text-base md:text-lg lg:text-xl hover:bg-[#106092] ${headerText.className}`}
                    onClick={handleSubmit}
                >
                    Join
                </button>
                <button onClick={CreateOne} className={` neon-text w-40 md:w-64 lg:w-72 h-10 md:h-12 lg:h-14 bg-[#18b7be] rounded-2xl text-base md:text-lg lg:text-xl hover:bg-[#139299] ${headerText.className}`}>Create one</button>
            </div>
           
        </div>
    );
};
export default Join_Organization;