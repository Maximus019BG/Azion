import {apiUrl} from "../api/config";
import {useEffect, useState} from "react";
import Link from "next/link";
import axios, {AxiosResponse} from "axios";
import Cookies from "js-cookie";
import {getOrgName} from "@/app/func/org";

interface Token {
    refreshToken: string;
    accessToken: string;
}

const Navbar = () => {
    const [isLogged, setIsLogged] = useState(false);
    const [org, setOrg] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const sessionCheck = (data: Token) => {
        const url = `${apiUrl}/token/session/check`;
        axios
            .post(url, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((response: AxiosResponse) => {
                const {message, accessToken} = response.data;
                if (message === "newAccessToken generated") {
                    Cookies.set("azionAccessToken", accessToken);
                    setIsLogged(true);
                } else if (message !== "success") {
                    setIsLogged(true);
                } else {
                    setIsLogged(true);
                }
            })
            .catch(() => {
                setIsLogged(false);
            });
    };

    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");

        if (refreshToken && accessToken) {
            const data = {refreshToken, accessToken};
            sessionCheck(data);
        } else {
            setIsLogged(false);
        }
    }, []);

    useEffect(() => {
        const fetchOrgName = async () => {
            const result: string = await getOrgName();
            if (result !== org) {
                setOrg(result);
            }
        };
        fetchOrgName();
    }, [org]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <div className="navbar bg-transparent px-6 sm:px-16 relative">
            <div className="flex items-center justify-between w-full">
                <a className="w-fit h-full btn btn-ghost neon-text text-4xl sm:text-6xl">Azion</a>
                <button
                    className="sm:hidden text-white focus:outline-none"
                    onClick={toggleMenu}
                >
                    {isMenuOpen ? (
                        <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    )}
                </button>
                <div className="hidden sm:flex gap-12">
                    {isLogged ? (
                        <>
                            <Link href={`/dashboard/${org}`}>
                                <button className="btn border-none neon-text text-lg bg-transparent">
                                    Dashboard
                                </button>
                            </Link>
                            <Link href="/organizations">
                                <button className="btn border-none neon-text text-lg bg-transparent">
                                    Organizations
                                </button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/register">
                                <button className="btn border-none neon-text text-lg bg-transparent">
                                    Register
                                </button>
                            </Link>
                            <Link href="/login">
                                <button className="btn border-none neon-text text-lg bg-transparent">
                                    Login
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <div
                className={`sm:hidden absolute top-full left-0 w-full bg-black text-white overflow-hidden z-20 rounded-xl transition-all duration-300 ease-in-out ${
                    isMenuOpen ? "max-h-60" : "max-h-0"
                }`}
            >
                <div className="w-full flex flex-col justify-center items-center gap-4 py-4 px-6 z-20">
                    {isLogged ? (
                        <>
                            <Link href={`/dashboard/${org}`}>
                                <button className="btn border-none neon-text text-lg bg-transparent w-full text-left">
                                    Dashboard
                                </button>
                            </Link>
                            <Link href="/organizations">
                                <button className="btn border-none neon-text text-lg bg-transparent w-full text-left">
                                    Organizations
                                </button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/register">
                                <button className="btn border-none neon-text text-lg bg-transparent w-full text-left">
                                    Register
                                </button>
                            </Link>
                            <Link href="/login">
                                <button className="btn border-none neon-text text-lg bg-transparent w-full text-left">
                                    Login
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
