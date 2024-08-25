"use client";
import React, {useEffect, useState} from 'react';
import { Poppins } from 'next/font/google';
import axios  from "axios";
import {apiUrl} from "../api/config";
import Cookies from 'js-cookie';

const headerText = Poppins({ subsets: ["latin"], weight: "800" });
const Join_Organization = () => {
    const [connString, setConnString] = useState("");

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
        <div className=' bg-background w-full h-full flex flex-col justify-center items-center rounded-badge'>
            <center>
                <h1
                    className={`mt-6 text-neonAccent text-lg md:text-3xl lg:text-5xl ${headerText.className}`}
                >
                    Join Org
                </h1>
            </center>
            <div className="w-full flex flex-col justify-center items-center gap-5 mt-5">
                <input
                    type="text"
                    placeholder="Connection String"
                    className="w-96 h-12 rounded-3xl p-3 text-black"
                    value={connString}
                    onChange={(e) => setConnString(e.target.value)}
                />
                <button
                    className="w-96 h-12 rounded-3xl bg-neonAccent text-black"
                    onClick={handleSubmit}
                >
                    Join
                </button>
            </div>
           <button onClick={CreateOne}>Create one</button>
        </div>
    );
};
export default Join_Organization;