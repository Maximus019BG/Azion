"use client";
import List from '@/app/components/_employees/list';
import React, {useEffect} from 'react'
import {UserData} from "@/app/func/funcs";

const Employees = () => {
    useEffect(()=>{

        UserData().then((response)=>{
           if(response.roleLevel < 0 || response.roleLevel > 2 ){
               window.location.href = "/organizations";
           }
        })
    })

    return (
        <div className='bg-background w-full h-screen'>
            <List/>
        </div>
    )
}

export default Employees;
