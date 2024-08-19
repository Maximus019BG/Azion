"use client";
import React, {useEffect, useState} from 'react';
import background from "../../public/background2.jpeg"
import { Poppins } from 'next/font/google';
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "../api/config";
import Cookies from "js-cookie";

const headerText = Poppins({ subsets: ["latin"], weight: "900" });

const SessionCheck = () => {
    const refreshToken = Cookies.get('azionRefreshToken');
    const accessToken = Cookies.get('azionAccessToken');

    const data = { refreshToken, accessToken };

    const url = `${apiUrl}/token/session/check`
    axios
        .post(url, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((response: AxiosResponse) => {
            const { message, accessToken } = response.data;

            if (message === 'newAccessToken generated') {
                Cookies.set('azionAccessToken', accessToken, { secure: true, sameSite: 'Strict' });
            }
        })
        .catch((error) => {
            console.error(error.response ? error.response : error);
            Cookies.remove('azionAccessToken');
            Cookies.remove('azionRefreshToken');
            window.location.href = '/log-in';
        });
};

const Register_Organisation = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if(name === "" || email === "" || address === "" || type === "" || phone === "" || description === ""){
        alert(`Please fill in all fields.The following fields are missing: 
        ${name === "" ? "Name" : ""}   ${email === "" ? "Email" : ""}   ${address === "" ? "Address" : ""}
        ${type === "" ? "Type" : ""}   ${phone === "" ? "Phone" : ""}   ${description === "" ? "Description" : ""}`);
        return;
    }
    const data = {
        orgName: name,
        orgEmail: email,
        orgAddress: address,
        orgType: type,
        orgPhone: phone,
        orgDescription: description
    }
    axios.post(`${apiUrl}/org/create`, data, {
        headers: {
            "Content-Type": "application/json",
        },
    }).then(function (response) {
            console.log(response.data);
        }).catch(function (error) {
            alert("An error occurred, please try again. Error: " + error.response.data.message);
        });
  }

    useEffect(() => {
        const refreshToken = Cookies.get('azionRefreshToken');
        const accessToken = Cookies.get('azionAccessToken');
        if (refreshToken && accessToken) {
            SessionCheck();
        }
        else if(!accessToken && !refreshToken) {
            window.location.href = '/log-in';
        }
    }, []);

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(30, 29, 29, 0.8), rgba(26, 25, 25, 0.7), rgba(22, 21, 21, 0.6), rgba(18, 17, 17, 0.5)), url(${background.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="w-screen h-screen flex flex-col justify-center items-center"
    >
      <div className="h-fit w-fit gradient-form rounded-3xl flex flex-col justify-around items-center p-5 md:p-10">
        <h1
          className={`mt-6 text-neonAccent text-5xl md:text-6xl lg:text-7xl ${headerText.className}`}
        >
          Register Org
        </h1>
        <div className="w-full flex flex-col justify-center items-center gap-12">
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Organization Name:"
                className="bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Organization Email:"
                className="bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>

          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Organization Address:"
                type="address"
                className="bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
                onChange={(e) => setType(e.target.value)}
                placeholder="Type of Organization:"
                type="type"
                className="bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Organization Phone:"
                type="phone"
                className="bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <input
                 onChange={(e) => setDescription(e.target.value)}
                placeholder="Organization Description:"
                type="description"
                className="bg-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#191b24]"
            />
          </div>
        </div>
        <button
            onClick={handleSubmit}
            className="bg-background w-fit text-neonAccent hover:border-2 hover:border-neonAccent font-black px-56 py-3 rounded-3xl text-xl hover:scale-105 transition-all ease-in"
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default Register_Organisation;