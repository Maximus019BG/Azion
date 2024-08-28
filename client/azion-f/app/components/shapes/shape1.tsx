"use client";
import React from "react";

export default function Shape1() {
  return (
    <div className="flex min-h-screen bg-gray-50 flex-col items-center justify-center py-2 z-50">
      {/* /////// Add the three divs below this comment ///////// */}
      <div
        className="absolute top-0 right-10 w-72 h-full bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 "
      ></div>
      <div
        className="absolute bottom-10 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 "
      ></div>
      <div
        className="absolute bottom-10 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 "
      ></div>
    </div>
  );
}
