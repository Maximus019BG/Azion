"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";
import { Poppins } from "next/font/google";
import OTP from "../components/OTP";

interface Token {
  refreshToken: string;
  accessToken: string;
}

const headerText = Poppins({ subsets: ["latin"], weight: "900" });

const AxiosFunction = (data: any, isOwner: boolean) => {
  axios
    .post(`${apiUrl}/auth/register`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(function (response: AxiosResponse) {
      const accessToken = response.data.accessToken;
      const refreshToken = response.data.refreshToken;
      if (!isOwner) {
        window.location.href = "/organizations";
      } else if (isOwner) {
        window.location.href = "/register-organization";
      }

      localStorage.setItem("azionAccessToken", accessToken);
      localStorage.setItem("azionRefreshToken", refreshToken);
    })
    .catch(function (error: any) {
      console.log(error.response ? error.response : error);
    });
};

const SessionCheck = () => {
  const refreshToken: string | null = localStorage.getItem("azionRefreshToken");
  const accessToken: string | null = localStorage.getItem("azionAccessToken");

  const data: Token = {
    refreshToken: refreshToken ? refreshToken : "",
    accessToken: accessToken ? accessToken : "",
  };
  axios
    .post(`${apiUrl}/token/session/check`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(function (response: AxiosResponse) {
      const message = response.data.message;

      if (message === "newAccessToken generated") {
        const accessToken = response.data.accessToken;

        localStorage.setItem("azionAccessToken", accessToken);
        window.location.href = "/organizations";
      } else if (message === "success") {
        window.location.href = "/organizations";
      } else if (message === "sessionCheck failed") {
        localStorage.removeItem("azionAccessToken");
        localStorage.removeItem("azionRefreshToken");
      } else {
        localStorage.removeItem("azionAccessToken");
        localStorage.removeItem("azionRefreshToken");
      }
    })
    .catch(function (error: any) {
      if (error.response) {
        const message = error.response.data.message;

        if (message === "sessionCheck failed") {
          localStorage.removeItem("azionAccessToken");
          localStorage.removeItem("azionRefreshToken");
        } else {
          localStorage.removeItem("azionAccessToken");
          localStorage.removeItem("azionRefreshToken");
        }
      } else {
        console.log("An error occurred, but no server response was received.");
      }
    });
};

const Sign_up = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isOrgOwner, setIsOrgOwner] = useState(false);
  const [role, setRole] = useState("");
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    SessionCheck();
  }, []);

  const handleSubmit = () => {
    if (isOrgOwner) {
      setRole("owner");
    } else if (!isOrgOwner) {
      setRole("none");
    }
    const userData = {
      name,
      email,
      age,
      password,
      role,
      mfaEnabled: true,
    };
    if (password === password2) {
      AxiosFunction(userData, isOrgOwner);
    }
  };

  const handleContiniue = () => {
    setOpenModal(true);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsOrgOwner(e.target.checked);
  };

  const showModal = () => {
    const modal = document.getElementById(
      "my_modal_5"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    } else {
      console.error("Modal element not found");
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-1/2 h-full">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          preload="auto"
        >
          <source src="/azion.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="w-1/2 h-full flex flex-col justify-center items-center">
        <div className="h-full min-w-full bg-[#ebe9e5] flex flex-col justify-around items-center p-5 md:p-10">
          <h1
            className={`mt-6 text-lightAccent text-5xl md:text-6xl lg:text-7xl ${headerText.className}`}
          >
            Login
          </h1>
          <div className="w-full flex flex-col justify-center items-center gap-12">
            <div className="w-full flex flex-col justify-center items-center gap-3">
              <input
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Enter your username:"
                className="bg-[#ebe9e5] pl-6 border-b-4 border-lightAccent placeholder:text-background opacity-100 w-full md:w-10/12 p-2 rounded-sm hover:bg-[#d1cfcc]"
              />
            </div>
            <div className="w-full flex  flex-col justify-center items-center gap-3">
              <input
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password:"
                type="password"
                className="bg-[#ebe9e5] pl-6 border-b-4 border-lightAccent placeholder:text-background opacity-100 w-full md:w-10/12 p-2 rounded-sm hover:bg-[#d1cfcc]"
              />
            </div>
          </div>
          <button
            onClick={showModal}
            className="bg-accent w-fit text-[#cbccc4] font-black px-56 py-3 rounded-3xl text-xl hover:scale-105 transition-all ease-in"
          >
            Continiue
          </button>

          <dialog
            id="my_modal_5"
            className="modal modal-bottom sm:modal-middle"
          >
            <div className="modal-box flex flex-col justify-center items-center h-full ">
              <h3 className="font-bold text-2xl text-center">
                Enter your One-Time-Passowrd (OTP)
              </h3>

              <p className="">
                You can find your OTP on your authenticator app on your phone
              </p>
              <div className="w-full flex  flex-col justify-center items-center gap-3"></div>
              <div className="modal-action flex flex-col justify-center items-center gap-12">
                <div>
                  <OTP length={6} onComplete={handleSubmit}/>
                  </div>
                <form method="dialog">
                  {/* if there is a button in form, it will close the modal */}
                  <button className="btn">Submit</button>
                </form>
              </div>
            </div>
          </dialog>
        </div>
      </div>
    </div>
  );
};

export default Sign_up;
