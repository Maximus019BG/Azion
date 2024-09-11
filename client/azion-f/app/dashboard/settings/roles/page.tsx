"use client";
import React from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { apiUrl } from '@/app/api/config';
import {UserData} from "@/app/func/funcs";
import RoleList from "@/app/components/role-list";
import SideMenu from "@/app/components/Side-menu";


const RoleEdit = () => {
    const [role, setRole] = React.useState("");
    const [loading, setLoading] = React.useState(true);

    UserData().then((response) => {
        console.log(response.role);
        setRole(response.role);
        setLoading(false);
    });

    if(!loading) {
        if (role !== "admin" && role !== null && role !== "owner" && role !== undefined) {
            console.log(role);

        }
    }

    return (
<div className="flex">
    <div className="w-1/4">
        <SideMenu/>
    </div>
    <div className="w-3/4 mt-8 mr-8">
        <div className="">
            <RoleList/>
        </div>
    </div>
</div>
    );
}
export default RoleEdit;