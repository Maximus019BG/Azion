"use client";
import List from '@/app/components/_employees/list';
import React, {useEffect} from 'react';
import {sessionCheck, UserData, UserHasRight} from "@/app/func/funcs";
import SideMenu from "@/app/components/Side-menu";

const Employees = () => {
    useEffect(() => {
        UserHasRight(2);
        sessionCheck();
    });

    return (
        <div className='bg-background w-full min-h-screen flex items-center'>
            <div className='w-full lg:w-1/4'>
                <SideMenu/>
            </div>
            <List/>
        </div>
    );
}

export default Employees;