"use client";
import React, {FC, useEffect, useState} from 'react';
import axios, {AxiosResponse} from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '@/app/api/config';
import {PartOfOrg, UserData} from "@/app/func/funcs";
import RoleList from "@/app/components/role-list";
import SideMenu from "@/app/components/Side-menu";
import {getOrgName} from "@/app/func/org";


interface PageProps {
    params: {
        org: string;
    };
}

const SessionCheck = () => {
    const refreshToken = Cookies.get("azionRefreshToken");
    const accessToken = Cookies.get("azionAccessToken");

    const data = { refreshToken, accessToken };

    const url = `${apiUrl}/token/session/check`;
    axios
        .post(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((response: AxiosResponse) => {
            const { message, accessToken } = response.data;
            if (message === "newAccessToken generated") {
                Cookies.set("azionAccessToken", accessToken, {
                    secure: true,
                    sameSite: "Strict",
                });
            }
        })
        .catch((error) => {
            console.error(error.response ? error.response : error);
            Cookies.remove("azionAccessToken");
            Cookies.remove("azionRefreshToken");
            window.location.href = "/login";
        });
};


const RoleEdit:FC<PageProps> = ({params}) => {
    const [roleLevel, setRoleLevel] = useState(0);
    const [loading, setLoading] = useState(true);
    const [orgNameCheck, setOrgNameCheck] = useState("");
    const orgName: string = params.org;



    useEffect(() => {
        const refreshToken = Cookies.get("azionRefreshToken");
        const accessToken = Cookies.get("azionAccessToken");

        if (refreshToken && accessToken) {
            PartOfOrg(true).then();
            SessionCheck();
            setTimeout(() => {
                UserData().then((response) => {
                    setRoleLevel(response.roleLevel);
                    setLoading(false);
                });
            }, 1000);
        } else if (!accessToken && !refreshToken) {
            window.location.href = "/login";
        }
    }, []);

    useEffect(() => {
        const fetchOrgName = async () => {
            const result: string = await getOrgName();
            setOrgNameCheck(result);
        };

        fetchOrgName();
    }, [orgName]);

    useEffect(() => {
        if (orgNameCheck && orgNameCheck !== orgName) {
            window.location.href = `/dashboard/${orgNameCheck}/settings/roles`;
        }
    }, [orgNameCheck, orgName]);

    if(!loading) {
        if (roleLevel < 1 && roleLevel > 3) {
            window.location.href = `/dashboard/${orgName}`;
        }
    }

    return (
<div className="flex">
    <div className="w-1/4">
        <SideMenu/>
    </div>
    <div className="w-3/4 flex justify-center items-center mt-8 mr-10">
        <div className="">
            <RoleList/>
        </div>
    </div>
</div>
    );
}
export default RoleEdit;