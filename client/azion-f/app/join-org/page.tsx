"use client";
import React, {useEffect, useState} from 'react';
import { Poppins } from 'next/font/google';
import axios  from "axios";
import {apiUrl} from "../api/config";
import Cookies from 'js-cookie';

const headerText = Poppins({ subsets: ["latin"], weight: "900" });
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
                console.log(response.data);
            }).catch(function (error) {
                alert("An error occurred, please try again. Error: " + error.response.data.message);
            });
        }


    return (
        <div>
            <h1
                className={`mt-6 text-neonAccent text-5xl md:text-6xl lg:text-7xl ${headerText.className}`}
            >
                Join Org
            </h1>
            <div className="w-full flex flex-col justify-center items-center gap-12">
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
        </div>
    );
};
export default Join_Organization;