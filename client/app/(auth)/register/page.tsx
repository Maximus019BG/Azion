"use client";
import React, {useEffect, useState} from "react";
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "../../api/config";
import {Poppins} from "next/font/google";
import Cookies from "js-cookie";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleLeft} from "@fortawesome/free-solid-svg-icons";
import {authSessionCheck} from "@/app/func/funcs";

interface InputField<T> {
    label: string;
    value: T;
    onChange: (value: T) => void;
    type?: "text" | "email" | "date" | "password" | "checkbox";
    combinedWith?: string;
}

const headerText = Poppins({subsets: ["latin"], weight: "900"});

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
            Cookies.set("azionAccessToken", accessToken, {
                secure: true,
                sameSite: "Strict",
            });
            Cookies.set("azionRefreshToken", refreshToken, {
                secure: true,
                sameSite: "Strict",
            });
            window.location.href = "/mfa";
        })
        .catch(function (error: any) {
            console.log(error.response ? error.response : error);
        });
};

const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

const isValidDate = (day: string, month: string, year: string): boolean => {
    const dayInt = parseInt(day);
    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    const currentDate = new Date();
    const selectedDate = new Date(yearInt, monthInt - 1, dayInt);

    if (selectedDate > currentDate) {
        return false;
    }

    if (monthInt === 2) {
        if (isLeapYear(yearInt)) {
            return dayInt <= 29;
        } else {
            return dayInt <= 28;
        }
    }

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return dayInt <= daysInMonth[monthInt - 1];
};

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState({day: "1", month: "1", year: "2000"});
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [isOrgOwner, setIsOrgOwner] = useState(false);
    const [role, setRole] = useState("");
    const [step, setStep] = useState(0);
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [days, setDays] = useState<string[]>([]);
    const [months, setMonths] = useState<string[]>([]);
    const [years, setYears] = useState<string[]>([]);

    useEffect(() => {
        if (Cookies.get("azionAccessToken") && Cookies.get("azionRefreshToken")) {
            authSessionCheck();
        }
    }, []);

    // DATE
    useEffect(() => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() - 1;
        const currentMonth = (currentDate.getMonth() + 1)
            .toString()
            .padStart(2, "0");
        const currentDay = currentDate.getDate().toString().padStart(2, "0");

        // Generate years
        const newYears = Array.from({length: 100}, (_, i) =>
            (currentYear - i).toString()
        );
        setYears(newYears);

        // Generate months
        const newMonths = Array.from({length: 12}, (_, i) =>
            (i + 1).toString().padStart(2, "0")
        ).filter(
            (month) =>
                selectedYear < currentYear.toString() ||
                (selectedYear === currentYear.toString() &&
                    parseInt(month) <= parseInt(currentMonth))
        );
        setMonths(newMonths);

        // Generate days
        const newDays = Array.from({length: 31}, (_, i) =>
            (i + 1).toString().padStart(2, "0")
        ).filter(
            (day) =>
                isValidDate(day, selectedMonth, selectedYear) &&
                (selectedYear < currentYear.toString() ||
                    (selectedYear === currentYear.toString() &&
                        parseInt(selectedMonth) < parseInt(currentMonth)) ||
                    (selectedYear === currentYear.toString() &&
                        selectedMonth === currentMonth &&
                        parseInt(day) <= parseInt(currentDay)))
        );
        setDays(newDays);
    }, [selectedYear, selectedMonth]);

// SUBMIT
    const handleSubmit = () => {
        const userData = {
            name,
            email,
            age: `${age.year}-${age.month.padStart(2, "0")}-${age.day.padStart(
                2,
                "0"
            )}`,
            password,
            role: isOrgOwner ? "owner" : "none",
            mfaEnabled: false,
        };
        if (password === password2) {
            console.log(userData.role);
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

    const handleBackStep = () => {
        if (step === 5) {
            // Skip back to step 3 (Password fields together)
            setStep(3);
        } else if (step > 0) {
            setStep(step - 1);
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
        {
            label: "Enter your age:",
            value: age,
            onChange: (value: any) => setAge(value),
            type: "date",
        },
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
        if (step === 3 || step === 4) {
            // Group Password and Confirm Password fields
            return inputFields.filter(
                (field) =>
                    field.label === "Password:" || field.label === "Confirm Password:"
            );
        }

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
        <div className="w-full h-dvh flex flex-col lg:flex-row justify-center items-center">
            <div className="max-w-4xl h-full flex flex-col justify-center items-center gap-24">

                {/* Back Button */}
                <Link className="absolute top-4 left-4" href="/">
                    <FontAwesomeIcon
                        className="text-3xl md:text-4xl text-lightAccent"
                        icon={faCircleLeft}
                    />
                </Link>

                {/* Header */}
                <h1 className={`text-lightAccent text-4xl sm:text-5xl md:text-6xl lg:text-7xl ${headerText.className}`}>
                    Register
                </h1>

                {/* Steps & Form */}
                <div className="w-full flex flex-col gap-8 justify-center items-center md:items-center">
                    {/* Vertical or Horizontal Steps */}
                    <ul className="w-full steps steps-vertical md:steps-horizontal text-white">
                        {stepLabels.map((label, index) => (
                            <li
                                key={index}
                                className={`step ${index <= step ? "step-accent" : ""}`}
                            >
                                {label}
                            </li>
                        ))}
                    </ul>

                    {/* Form Fields */}
                    <div className="flex-1 w-full flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            {getCurrentFields().map((field, index) => (
                                <div key={index} className="w-full flex justify-center items-center">
                                    {field.type === "checkbox" ? (
                                        <label className="flex items-center text-white">
                                            <input
                                                type="checkbox"
                                                checked={field.value as boolean}
                                                onChange={(e) =>
                                                    setIsOrgOwner(e.target.checked)
                                                }
                                                className="mr-2 h-5 w-5 rounded"
                                            />
                                            {field.label}
                                        </label>
                                    ) : field.type === "date" ? (
                                        <div className="w-full flex gap-4">
                                            {/* Day */}
                                            <div className="w-full flex flex-col justify-center items-start">
                                                <h1 className="text-white">Day:</h1>
                                                <select
                                                    value={age.day}
                                                    onChange={(e) =>
                                                        setAge({...age, day: e.target.value})
                                                    }
                                                    className="w-full bg-base-200 text-white p-2 rounded-lg"
                                                >
                                                    {Array.from({length: 31}, (_, i) => i + 1).map(
                                                        (day) => (
                                                            <option key={day} value={day}>
                                                                {day}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                            {/* Month */}
                                            <div className="w-full flex flex-col justify-center items-start">
                                                <h1 className="text-white">Month:</h1>
                                                <select
                                                    value={age.month}
                                                    onChange={(e) =>
                                                        setAge({...age, month: e.target.value})
                                                    }
                                                    className="w-full bg-base-200 text-white p-2 rounded-lg"
                                                >
                                                    {Array.from({length: 12}, (_, i) => i + 1).map(
                                                        (month) => (
                                                            <option key={month} value={month}>
                                                                {month}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                            {/* Year */}
                                            <div className="w-full flex flex-col justify-center items-start">
                                                <h1 className="text-white">Year:</h1>
                                                <select
                                                    value={age.year}
                                                    onChange={(e) =>
                                                        setAge({...age, year: e.target.value})
                                                    }
                                                    className="w-full bg-base-200 text-white p-2 rounded-lg"
                                                >
                                                    {Array.from(
                                                        {length: 100},
                                                        (_, i) => new Date().getFullYear() - i
                                                    ).map((year) => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <input
                                            type={field.type || "text"}
                                            value={field.value as string}
                                            onChange={(e) =>
                                                field.onChange(e.target.value as any)
                                            }
                                            placeholder={field.label}
                                            className="w-full bg-base-200 text-white p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lightAccent"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center w-full">
                            {step > 0 && (
                                <button
                                    onClick={handleBackStep}
                                    className="bg-lightAccent text-white px-4 py-2 rounded-lg hover:bg-accent"
                                >
                                    Back
                                </button>
                            )}
                            <div className="flex-grow"></div>
                            {step < inputFields.length - 1 && (
                                <button
                                    onClick={handleNextStep}
                                    className="bg-lightAccent text-white px-4 py-2 rounded-lg hover:bg-accent"
                                >
                                    Next
                                </button>
                            )}
                            {step === inputFields.length - 1 && (
                                <button
                                    onClick={handleSubmit}
                                    className="bg-accent text-white px-10 py-2 text-lg rounded-lg hover:bg-blue-500"
                                >
                                    Submit
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-white text-center">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-lightAccent text-xl font-black underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
