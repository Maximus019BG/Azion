"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";
import { Poppins } from "next/font/google";
import Cookies from "js-cookie";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleLeft } from "@fortawesome/free-solid-svg-icons";

interface Token {
  refreshToken: string;
  accessToken: string;
}

interface InputField<T> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  type?: "text" | "email" | "date" | "password" | "checkbox";
  combinedWith?: string;
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

      Cookies.set("azionAccessToken", accessToken, {
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("azionRefreshToken", refreshToken, {
        secure: true,
        sameSite: "Strict",
      });
    })
    .catch(function (error: any) {
      console.log(error.response ? error.response : error);
    });
};

const SessionCheck = () => {
  const refreshToken: string | undefined = Cookies.get("azionRefreshToken");
  const accessToken: string | undefined = Cookies.get("azionAccessToken");

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

        Cookies.set("azionAccessToken", accessToken, {
          secure: true,
          sameSite: "Strict",
        });
        window.location.href = "/organizations";
      } else if (message === "success") {
        window.location.href = "/organizations";
      } else if (message === "sessionCheck failed") {
        Cookies.remove("azionAccessToken");
        Cookies.remove("azionRefreshToken");
      } else {
        Cookies.remove("azionAccessToken");
        Cookies.remove("azionRefreshToken");
      }
    })
    .catch(function (error: any) {
      if (error.response) {
        const message = error.response.data.message;

        if (message === "sessionCheck failed") {
          Cookies.remove("azionAccessToken");
          Cookies.remove("azionRefreshToken");
        } else {
          Cookies.remove("azionAccessToken");
          Cookies.remove("azionRefreshToken");
        }
      } else {
        console.log("An error occurred, but no server response was received.");
      }
    });
};

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isOrgOwner, setIsOrgOwner] = useState(false);
  const [role, setRole] = useState("");
  const [step, setStep] = useState(0);

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
    } else {
      alert("Passwords do not match.");
    }
  };

  const handleNextStep = () => {
    if (step === 3) {
      // Skip step 4
      setStep(step + 2);
    } else if (step < inputFields.length - 1) {
      setStep(step + 1);
    }
  };

  const inputFields: InputField<any>[] = [
    {
      label: "Enter your username:",
      value: name,
      onChange: setName,
      type: "text",
    },
    {
      label: "Enter your email:",
      value: email,
      onChange: setEmail,
      type: "email",
    },
    { label: "Enter your age:", value: age, onChange: setAge, type: "date" },
    {
      label: "Password:",
      value: password,
      onChange: setPassword,
      type: "password",
      combinedWith: "Confirm Password:",
    },
    {
      label: "Confirm Password:",
      value: password2,
      onChange: setPassword2,
      type: "password",
      combinedWith: "Password:",
    },
    {
      label: "I'm an organization owner",
      value: isOrgOwner,
      onChange: setIsOrgOwner,
      type: "checkbox",
    },
  ];

  const getCurrentFields = () => {
    if (step === 3) {
      // Group fields
      return inputFields.filter(
        (field) =>
          field.label === "Password:" || field.label === "Confirm Password:"
      );
    }

    // оther steps
    return [inputFields[step]];
  };

  const stepLabels = [
    "Register",
    "Enter Details",
    "Password",
    "Organization?",
    "Submit",
  ];

  return (
    <div className="lg:w-screen lg:h-screen flex flex-col lg:flex-row justify-center items-center">
      <div className="w-1/2 h-full order-2">
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
        <div className="h-full min-w-full bg-[#ebe9e5] flex flex-col justify-center items-center gap-24 p-5 md:p-10">
          <Link className="absolute left-6 top-6" href="/">
            <FontAwesomeIcon
              className="text-4xl text-lightAccent"
              icon={faCircleLeft}
            />
          </Link>
          <h1
            className={`mt-6 text-lightAccent text-5xl md:text-6xl lg:text-7xl ${headerText.className}`}
          >
            Register
          </h1>
          <div className="w-full flex flex-col  justify-center gap-10 items-center">
            {/* Vertical Steps */}
            <ul className="steps steps-vertical text-background lg:steps-horizontal ">
              {stepLabels.map((label, index) => (
                <li
                  key={index}
                  className={`step ${index <= step ? "step-primary" : ""}`}
                >
                  {label}
                </li>
              ))}
            </ul>
            {/* Form Fields */}
            <div className="w-[30vw] flex flex-col justify-center items-center gap-3">
              {getCurrentFields().map((field, index) => (
                <div
                  key={index}
                  className="w-full flex flex-col justify-center items-center gap-3"
                >
                  {field.type === "checkbox" ? (
                    <label className="text-background">
                      <input
                        type="checkbox"
                        checked={field.value as boolean}
                        onChange={(e) =>
                          field.onChange(e.target.checked as any)
                        }
                        className="mr-2"
                      />
                      {field.label}
                    </label>
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={field.value as string}
                      onChange={(e) => field.onChange(e.target.value as any)}
                      style={{ outline: "none" }}
                      placeholder={field.label}
                      className="bg-[#ceccc8] text-black pl-6 h-12 placeholder:text-background opacity-100 w-full md:w-10/12 p-2 rounded-3xl hover:bg-[#c0beba]"
                    />
                  )}
                </div>
              ))}
            </div>
            <h1 className="text-black">
              If you don&apos;t have an existing account go to{" "}
              <Link
                href="/log-in"
                className=" text-lightAccent hover:text-[#51bbb6] font-extrabold text-xl underline"
              >
                Login
              </Link>
            </h1>
          </div>
          <div className="w-full flex justify-center items-center gap-3">
            {step < inputFields.length - 1 && (
              <button
                title="click to move to the next one"
                onClick={handleNextStep}
                className="bg-lightAccent text-slate-50 font-extrabold p-2 px-20 text-xl rounded-full hover:bg-accent transition-all duration-300"
              >
                Next
              </button>
            )}
            {step === inputFields.length - 1 && (
              <button
                title="click to submit"
                onClick={handleSubmit}
                className="bg-lightAccent text-slate-50 font-extrabold p-2 px-20 text-xl rounded-full hover:bg-accent transition-all duration-300"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
