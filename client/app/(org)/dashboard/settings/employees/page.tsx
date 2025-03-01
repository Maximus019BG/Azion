"use client";
import List from '@/app/components/_employees/list';
import React, {useEffect} from 'react';
import {sessionCheck, UserData, UserHasRight} from "@/app/func/funcs";
import SideMenu from "@/app/components/Side-menu";

const Employees = () => {
    useEffect(() => {
        UserHasRight("employees:read");
        sessionCheck();
    });

    return (
        <div className='bg-background w-full min-h-screen flex items-center'>
            <div className='w-full lg:w-1/4'>
                <SideMenu/>
            </div>
            <div className="justify-start w-full h-dvh flex flex-col items-center gap-5 p-4 sm:p-6 md:p-8" >
                <List/>
            </div>
        </div>
    );
}

export default Employees;