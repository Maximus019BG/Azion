"use client";
import List from '@/app/components/_employees/list';
import React, {useEffect} from 'react';
import {UserData} from "@/app/func/funcs";

const Employees = () => {
    useEffect(() => {
        UserData().then((response) => {
            if (response.roleLevel < 0 || response.roleLevel > 2) {
                window.location.href = "/organizations";
            }
        });
    }, []);

    return (
        <div className='bg-background w-full min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8'>
            <List/>
        </div>
    );
}

export default Employees;