"use client";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {apiUrl} from "@/app/api/config";
import {Poppins} from "next/font/google";
import Cookies from "js-cookie";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleLeft} from "@fortawesome/free-solid-svg-icons";
import {PartOfOrg, sessionCheck} from "@/app/func/funcs";
import ConString from "../../../components/ConString";

const headerText = Poppins({subsets: ["latin"], weight: "900"});

const Register_Organisation = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [type, setType] = useState("");
    const [phone, setPhone] = useState("");
    const [description, setDescription] = useState("");
    const [step, setStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [conString, setConString] = useState("");


    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");
        if (refreshToken && accessToken) {
            sessionCheck();
            PartOfOrg(false);
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login";
        }
    }, []);

    const handleSubmit = () => {
        const missingFields = [];
        if (!name) missingFields.push("Name");
        if (!email) missingFields.push("Email");
        if (!address) missingFields.push("Address");
        if (!type) missingFields.push("Type");
        if (!phone) missingFields.push("Phone");
        if (!description) missingFields.push("Description");

        if (missingFields.length > 0) {
            alert(`Please fill in all fields. The following fields are missing: ${missingFields.join(", ")}`);
            return;
        }

        const data = {
            orgName: name,
            orgEmail: email,
            orgAddress: address,
            orgType: type,
            orgPhone: phone,
            orgDescription: description,
            accessToken: Cookies.get("azionAccessToken"),
        };

        axios
            .post(`${apiUrl}/org/create`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                setConString(response.data);
                setIsSubmitted(true);
            })
            .catch((error) => {
                alert(
                    "An error occurred, please try again. Error: " +
                    error.response.data.message
                );
            });
    };

    const handleNextStep = () => {
        if (step < stepLabels.length - 1) {
            setStep(step + 1);
        }
    };

    const handlePreviousStep = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const inputFields = [
        {
            label: "Organization Name:",
            value: name,
            onChange: setName,
            type: "text",
        },
        {
            label: "Organization Email:",
            value: email,
            onChange: setEmail,
            type: "email",
        },
        {
            label: "Organization Address:",
            value: address,
            onChange: setAddress,
            type: "text",
        },
        {
            label: "Organization Phone:",
            value: phone,
            onChange: setPhone,
            type: "text",
        },
        {
            label: "Type of Organization:",
            value: type,
            onChange: setType,
            type: "text",
        },
        {
            label: "Organization Description:",
            value: description,
            onChange: setDescription,
            type: "text",
        },
    ];

    const getCurrentFields = () => {
        switch (step) {
            case 0:
                return inputFields.slice(0, 2); // Name and Email
            case 1:
                return inputFields.slice(2, 4); // Address and Phone
            case 2:
                return inputFields.slice(4, 6); // Type and Description
            default:
                return [];
        }
    };

    const stepLabels = [
        "Organization Info",
        "Organization Contact",
        "Type & Description",
        "Submit",
    ];

    return (
        <div className="w-full min-h-screen flex flex-col lg:flex-row justify-center items-center">
            <div className="h-full w-full flex flex-col justify-center items-center gap-24 px-4 lg:px-0">
                <Link className="absolute left-6 top-6" href="/">
                    <FontAwesomeIcon
                        className="text-4xl text-lightAccent"
                        icon={faCircleLeft}
                    />
                </Link>
                <h1
                    className={`text-lightAccent text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl ${headerText.className}`}
                >
                    Register Organization
                </h1>
                <div className="w-full flex flex-col justify-center gap-10 items-center">
                    <ul className="steps steps-vertical lg:steps-horizontal">
                        {stepLabels.map((label, index) => (
                            <li
                                key={index}
                                className={`step ${index <= step ? "step-accent" : ""} text-white`}
                            >
                                {label}
                            </li>
                        ))}
                    </ul>

                    {isSubmitted ? (
                        <div className="fixed inset-32 flex justify-center items-center z-50">
                            <ConString value={conString} name={name}/>
                        </div>
                    ) : (
                        <div className="w-full md:w-10/12 lg:w-[30vw] flex flex-col justify-center items-center gap-3">
                            {getCurrentFields().map((field, index) => (
                                <input
                                    key={index}
                                    type={field.type || "text"}
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    style={{outline: "none"}}
                                    placeholder={field.label}
                                    className="bg-base-300 text-white px-6 h-12 placeholder:text-background opacity-100 w-full p-2 rounded-3xl hover:bg-base-100"
                                />
                            ))}
                        </div>
                    )}

                    {!isSubmitted && (
                        <div className="w-full flex justify-center items-center gap-3">
                            {step > 0 && (
                                <button
                                    title="Click to go to the previous step"
                                    onClick={handlePreviousStep}
                                    className="bg-accent text-slate-50 font-extrabold p-2 px-10 md:px-20 text-xl rounded-full hover:bg-accent transition-all duration-300"
                                >
                                    Back
                                </button>
                            )}
                            {step < stepLabels.length - 1 && (
                                <button
                                    title="Click to move to the next step"
                                    onClick={handleNextStep}
                                    className="bg-accent text-slate-50 font-extrabold p-2 px-10 md:px-20 text-xl rounded-full hover:bg-accent transition-all duration-300"
                                >
                                    Next
                                </button>
                            )}
                            {step === stepLabels.length - 1 && (
                                <button
                                    title="Click to submit"
                                    onClick={handleSubmit}
                                    className="bg-accent text-slate-50 font-extrabold p-2 px-10 md:px-20 text-xl rounded-full hover:bg-accent transition-all duration-300"
                                >
                                    Submit
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register_Organisation;