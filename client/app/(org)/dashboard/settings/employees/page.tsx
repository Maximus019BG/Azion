"use client";
import List from '@/app/components/_employees/list';
import React, {useEffect} from 'react';
import {sessionCheck, UserHasRight} from "@/app/func/funcs";

const Employees = () => {
    useEffect(() => {
        UserHasRight("employees:read");
        sessionCheck();
    });

    return (
        <div className=' w-full min-h-screen flex items-center bg-gradient-to-br from-[#050505] to-[#0c0c0c]'>
            <div className="justify-start w-full h-dvh flex flex-col items-center gap-5 p-4 sm:p-6 md:p-8">
                <List/>
            </div>
        </div>
    );
}

export default Employees;