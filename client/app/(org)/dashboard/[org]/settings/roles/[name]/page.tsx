"use client"
import React, {useEffect} from 'react';
import EditRoleSection from "@/app/components/EditRoleSection";
import SideMenu from "@/app/components/Side-menu";
import {sessionCheck, UserHasRight} from "@/app/func/funcs";

interface PageProps {
    params: {
        name: string;
    }
}

const EditRole: React.FC<PageProps> = ({params}) => {
    const {name} = params;

    useEffect(() => {
        if(name === "owner"){
            window.location.href = window.location.pathname.slice(0,window.location.pathname.length-6);
        }
        UserHasRight("roles:write");
        sessionCheck();
    });

    return (
        <div className="h-dvh w-full flex flex-col lg:flex-row">
            <div className={`w-fit lg:w-1/4 h-full`}>
                <SideMenu/>
            </div>
            <div className={`w-full flex flex-col justify-center items-center`}>
                <h1 className={`text-white text-2xl`}><span className="font-bold uppercase">{name}</span> rights </h1>
                <EditRoleSection RoleName={name} />
            </div>
        </div>
    );
};

export default EditRole;