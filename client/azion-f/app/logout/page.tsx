"use client";
import React, { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { apiUrl } from "../api/config";
import { Poppins } from "next/font/google";
import Cookies from "js-cookie";


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


const LogOutAxios = () => {
    axios
        .post(`${apiUrl}/auth/logout`, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(function (response: AxiosResponse) {
            Cookies.remove("azionAccessToken");
            Cookies.remove("azionRefreshToken");
            window.location.href = "/log-in";
        })
        .catch(function (error: any) {

            window.location.href = "/log-in";
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
            } else if (message === "success") {
            } else if (message === "sessionCheck failed") {
                Cookies.remove("azionAccessToken");
                Cookies.remove("azionRefreshToken");
                window.location.href = "/log-in";
            } else {
                Cookies.remove("azionAccessToken");
                Cookies.remove("azionRefreshToken");
                window.location.href = "/log-in";
            }
        })
        .catch(function (error: any) {
            if (error.response) {
                const message = error.response.data.message;

                if (message === "sessionCheck failed") {
                    Cookies.remove("azionAccessToken");
                    Cookies.remove("azionRefreshToken");
                    window.location.href = "/log-in";
                } else {
                    Cookies.remove("azionAccessToken");
                    Cookies.remove("azionRefreshToken");
                    window.location.href = "/log-in";
                }
            } else {
                console.log("An error occurred, but no server response was received.");
            }
        });
};

const LogOut = () => {
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
        <>
        <button onClick={LogOutAxios}>Log out</button>
        </>
    );
};

export default LogOut;
