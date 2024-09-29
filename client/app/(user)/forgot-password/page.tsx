"use client";
import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import Link from "next/link";
import { apiUrl } from "@/app/api/config";
import { Poppins } from "next/font/google";


const HeaderText = Poppins({ subsets: ["latin"], weight: "600" });

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    axios
      .put(
        `${apiUrl}/auth/forgot-password`,
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(function (response: AxiosResponse) {
        setMessage(response.data);
      })
      .catch(function (error: any) {
        if (error.response && error.response.status === 401) {
          setMessage("Unauthorized: Please check your credentials.");
        } else {
          setMessage("Error sending password reset email");
        }
      });
  };

  return (
    <div className=" w-screen h-screen flex flex-col justify-center items-center">
      <div className=" w-1/3 h-3/4 rounded-badge flex flex-col justify-center items-center gap-5 bg-slate-900">
        <h1 className={`${HeaderText.className} text-5xl text-white font-black mb-8`}>Forgot Password</h1>
        <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center gap-16">
          <div>
            <label className=" mr-2 text-xl font-bold text-white">Email: </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-800 rounded-md p-1 text-white"
            />
          </div>
          <button type="submit" className={`w-40 md:w-64 h-10 md:h-12  bg-lightAccent rounded-2xl text-base md:text-lg  hover:bg-sky-600 ${HeaderText.className}`}>Send Reset Link</button>
        </form>
        {message && <p>{message}</p>}
        <Link href="/login"  className={`w-40 md:w-64 h-10 md:h-12  bg-accent rounded-2xl text-base md:text-lg flex justify-center items-center hover:bg-blue-700 ${HeaderText.className}`}>Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
