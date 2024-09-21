"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import axios from 'axios';
import { apiUrl } from "../api/config";
import Cookies from 'js-cookie';

const headerText = Poppins({ subsets: ["latin"], weight: "800" });

const Join_Organization = ({ onClose }: { onClose: () => void }) => {
  const [connString, setConnString] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    if (connString === "") {
      alert("Please fill in the connection string field.");
      return;
    }

    const accessToken = Cookies.get('azionAccessToken');
    const data = {
      connString: connString,
      accessToken: accessToken
    };

    try {
      await axios.post(`${apiUrl}/org/join`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      window.location.href = '/organizations';
    } catch (error: any) {
      alert("An error occurred, please try again. Error: " + error.response?.data?.message);
    }
  };

  const createOne = () => {
    window.location.href = '/register/organization';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div ref={modalRef} className="w-full max-w-xl bg-gray-800 border-2 border-blue-600 shadow-2xl rounded-md p-8 flex flex-col items-center">
        <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 ${headerText.className}`}>
          Join Organization
        </h1>
        <input
          type="text"
          placeholder="Connection String"
          className="w-full bg-gray-700 text-white rounded-lg py-2 px-4 mb-4 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={connString}
          onChange={(e) => setConnString(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg mb-4 transition duration-200"
          onClick={handleSubmit}
        >
          Join
        </button>
        <button
          onClick={createOne}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          Create One
        </button>
      </div>
    </div>
  );
};

export default Join_Organization;
