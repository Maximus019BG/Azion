"use client";
import React, { useState } from "react";
import axios, { AxiosResponse } from "axios";

const AxiosFunction = (data: any) => {
  axios
    .post("http://localhost:8080/api/auth/register", data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(function (response: AxiosResponse) {
      console.log(response);
    })
    .catch(function (error: any) {
      console.log(error.response ? error.response : error);
    });
};

const Sign_up = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] =  useState("");
  const [mfaEnabled, setMfaEnabled] = useState(false);

const handleSubmit = () => {
  const parsedDate = new Date(age);

  const userData = {
    name,
    email,
    age,
    password,
    role: "TestUser",
    mfaEnabled: true
  };

  AxiosFunction(userData);
};
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="h-[65vh] w-[90vw] md:w-[60vw] lg:w-[40vw] xl:w-[30vw] bg-slate-900 rounded-xl opacity-80 flex flex-col gap-5 justify-center items-center p-5 md:p-10">
        <h1 className="text-3xl text-slate-200">Sign Up</h1>
        <div className="w-full flex flex-col justify-center items-center gap-3">
          <p className="text-slate-200 w-full flex flex-col justify-center items-start ml-4 md:ml-8 lg:ml-12">
            Input your Username:
          </p>
          <input
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="border-2 border-black opacity-100 w-full md:w-10/12 p-1 rounded-md"
          />
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-3">
          <p className="text-slate-200 w-full flex flex-col justify-center items-start ml-4 md:ml-8 lg:ml-12">
            Input your Email:
          </p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="border-2 border-black opacity-100 w-full md:w-10/12 p-1 rounded-md"
          />
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-3">
          <p className="text-slate-200 w-full flex flex-col justify-center items-start ml-4 md:ml-8 lg:ml-12">
            Born at:
          </p>
          <input
            onChange={(e) => setAge(e.target.value)}
            type="date"
            className="border-2 border-black opacity-100 w-full md:w-10/12 p-1 rounded-md"
          />
        </div>
        <div className="w-full flex flex-col justify-center items-center gap-3">
          <p className="text-slate-200 w-full flex flex-col justify-center items-start ml-4 md:ml-8 lg:ml-12">
            Input your Password:
          </p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="border-2 border-black opacity-100 w-full md:w-10/12 p-1 rounded-md"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Sign_up;