"use client";
import React, {useEffect, useState} from "react";
import ListAllOrgs from "../../components/listAllOrgs";
import Cookies from "js-cookie";
import SideMenu from "../../components/Side-menu";
import Join_Organization from "../../components/JoinOrg";
import {orgSessionCheck, PartOfOrg} from "../../func/funcs";
import Loading from "../../components/Loading";


const Organizations = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showJoinOrg, setShowJoinOrg] = useState(false);
    const [partOfOrg, setPartOfOrg] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const CheckSessionAndOrg = async () => {
            const isSessionValid = await orgSessionCheck();
            if (isSessionValid) {
                await PartOfOrg(false);
                setLoading(false); // Set loading to false when data is fetched
            }
        };

        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");

        if (refreshToken && accessToken) {
            CheckSessionAndOrg().then();
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login";
        }
    }, []);

    return (
        <>
            {loading ? (
                <div className="w-screen h-screen flex justify-center items-center ">
                    <Loading/>
                </div>
            ) : (
                <div className="h-screen w-screen overflow-hidden flex">
                    <div className="w-1/4 bg-background">
                        <SideMenu/>
                    </div>
                    <div className="w-full flex flex-col justify-start items-center py-8 overflow-y-auto">
                        <div className="w-full flex flex-col items-center gap-6">
                            <label className="input w-3/6 input-bordered flex items-center gap-2">
                                <input
                                    type="text"
                                    className="grow"
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                    className="h-4 w-4 opacity-70"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </label>
                            <ListAllOrgs searchTerm={searchTerm}/>
                        </div>

                        {/* Toggle Button */}
                        <button
                            className="fixed bottom-10 right-10 bg-accent text-white p-3 rounded-btn hover:bg-blue-900"
                            onClick={() => setShowJoinOrg(!showJoinOrg)}
                        >
                            {showJoinOrg ? "Close Join Org" : "Join Organization"}
                        </button>

                        {/* Conditional Rendering of Join Organization */}
                        {showJoinOrg && (
                            <div className=" fixed inset-0 flex justify-center items-center z-50">
                                <Join_Organization onClose={() => setShowJoinOrg(false)}/>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Organizations;
