"use client";
import React, {useEffect, useState} from "react";
import axios, {AxiosResponse} from "axios";
import {apiUrl} from "../../api/config";
import {Poppins} from "next/font/google";
import Cookies from "js-cookie";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
import {authSessionCheck} from "@/app/func/funcs";
import GoogleLoginButton from "@/app/components/_auth/googleSSO";
import ReturnButton from "@/app/components/ReturnButton";

interface InputField<T> {
    label: string;
    value: T;
    onChange: (value: T) => void;
    type?: "text" | "email" | "date" | "password" | "checkbox";
    combinedWith?: string;
}

const headerText = Poppins({subsets: ["latin"], weight: "900"});

const handleRegister = (data: any, isOwner: boolean) => {
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
            if (isOwner) {
                window.location.href = "/register/organization";
            } else {
                window.location.href = "/organizations"
            }
        })
        .catch(function (error: any) {
            if (error.response.status === 409) {
                alert("Email already in use");
            }
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
    const [nameError, setNameError] = useState<string>("");
    const [emailError, setEmailError] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");
    const [password2Error, setPassword2Error] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showPassword2, setShowPassword2] = useState<boolean>(false);
    const [isWorker, setIsWorker] = useState<boolean>(false);

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

    //SUBMIT
    const handleSubmit = () => {
        let valid = true;
        if (!name) {
            setNameError("Name is required");
            valid = false;
        } else {
            setNameError("");
        }

        if (!email) {
            setEmailError("Email is required");
            valid = false;
        } else {
            setEmailError("");
        }

        if (!password) {
            setPasswordError("Password is required");
            valid = false;
        } else {
            setPasswordError("");
        }

        if (password !== password2) {
            setPassword2Error("Passwords do not match");
            valid = false;
        } else {
            setPassword2Error("");
        }

        if (valid) {
            const userData = {
                name,
                email,
                age: `${age.year}-${age.month.padStart(2, "0")}-${age.day.padStart(2, "0")}`,
                isOrgOwner,
                password,
                isWorker,
            };
            handleRegister(userData, isOrgOwner);
        }
    };

    const handleNextStep = () => {
        let valid = true;
        if (step === 0) {
            if (!name) {
                setNameError("Name is required");
                valid = false;
            } else {
                setNameError("");
            }

            if (!email) {
                setEmailError("Email is required");
                valid = false;
            } else {
                setEmailError("");
            }
        } else if (step === 1) {
            if (!password) {
                setPasswordError("Password is required");
                valid = false;
            } else {
                setPasswordError("");
            }

            if (password !== password2) {
                setPassword2Error("Passwords do not match");
                valid = false;
            } else {
                setPassword2Error("");
            }
        }

        if (valid) {
            if (step < stepLabels.length - 1) {
                setStep(step + 1); // Move to the next step
            } else {
                handleSubmit(); // Call submit function on the last step
            }
        }
    };

    const handleBackStep = () => {
        if (step > 0) {
            setStep(step - 1); // Move to the previous step
        }
    };

    const stepLabels = [
        "User Details",
        "Password",
        "Role",
        "Submit",
    ];

    const inputFields: InputField<any>[] = [
        {
            label: "Enter your username",
            value: name,
            onChange: setName,
            type: "text",
        },
        {
            label: "Enter your email",
            value: email,
            onChange: setEmail,
            type: "email",
        },
        {
            label: "Enter your age",
            value: age,
            onChange: (value: any) => setAge(value),
            type: "date",
        },
        {
            label: "Password",
            value: password,
            onChange: setPassword,
            type: "password",
            combinedWith: "Confirm Password",
        },
        {
            label: "Confirm Password",
            value: password2,
            onChange: setPassword2,
            type: "password",
            combinedWith: "Password",
        },
        {
            label: "I'm an organization owner",
            value: isOrgOwner,
            onChange: setIsOrgOwner,
            type: "checkbox",
        },
        {
            label: "I'm a worker",
            value: isWorker,
            onChange: setIsWorker,
            type: "checkbox",
        },
    ];

    const getCurrentFields = () => {
        switch (step) {
            case 0:
                return inputFields.slice(0, 3); // User Details
            case 1:
                return inputFields.slice(3, 5); // Password
            case 2:
                return inputFields.slice(5, 6); // Role
            default:
                return [];
        }
    };

    return (
        <div className="w-full h-dvh flex flex-col lg:flex-row justify-center items-center">
            <div className="max-w-4xl h-full flex flex-col justify-center items-center gap-24">

                {/* Back Button */}
                <div className="absolute top-4 left-4">
                    <ReturnButton to={"/"}/>
                </div>

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
                                <div key={index} className="w-full flex flex-col justify-center items-center">
                                    {field.type === "checkbox" ? (
                                        <div className="flex flex-col gap-2">
                                            {inputFields
                                                .filter((field) => field.type === "checkbox")
                                                .map((field, index) => (
                                                    <label key={index} className="flex items-center text-white">
                                                        <input
                                                            type="checkbox"
                                                            checked={field.value as boolean}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            className="mr-2 h-5 w-5 rounded"
                                                        />
                                                        {field.label}
                                                    </label>
                                                ))}
                                        </div>
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
                                        <div className="w-full flex flex-col">
                                            <div className="relative w-full">
                                                <input
                                                    type={field.type === "password" && (field.label === "Password" ? showPassword : showPassword2) ? "text" : field.type}
                                                    value={field.value as string}
                                                    onChange={(e) =>
                                                        field.onChange(e.target.value as any)
                                                    }
                                                    placeholder={field.label}
                                                    className="w-full bg-base-200 text-white p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lightAccent"
                                                />
                                                {field.type === "password" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => field.label === "Password" ? setShowPassword(!showPassword) : setShowPassword2(!showPassword2)}
                                                        className="absolute right-3 top-3 text-gray-500"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={field.label === "Password" ? (showPassword ? faEyeSlash : faEye) : (showPassword2 ? faEyeSlash : faEye)}/>
                                                    </button>
                                                )}
                                            </div>
                                            {field.label === "Enter your email" && emailError && (
                                                <p className="text-red-500 text-sm mt-1">{emailError}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

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
                            {step < stepLabels.length - 2 && (
                                <button
                                    onClick={handleNextStep}
                                    className="bg-lightAccent text-white px-4 py-2 rounded-lg hover:bg-accent"
                                >
                                    Next
                                </button>
                            )}
                            {step === stepLabels.length - 2 && (
                                <button
                                    onClick={handleSubmit}
                                    className="bg-accent text-white px-6 py-2 text-lg rounded-lg hover:bg-blue-500"
                                >
                                    Submit
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center items-center gap-4">
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
                    <div className="h-fit">
                        <GoogleLoginButton text="Sign up with Google"/>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Register;
