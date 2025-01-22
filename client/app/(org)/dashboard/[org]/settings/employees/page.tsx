"use client";
import List from '@/app/components/_employees/list';
import React, {useEffect} from 'react';
import {sessionCheck, UserData, UserHasRight} from "@/app/func/funcs";

const Employees = () => {
    useEffect(() => {
        UserHasRight(2);
        sessionCheck();
    });

    return (
        <div className='bg-background w-full min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8'>
            <List/>
        </div>
    );
}

export default Employees;