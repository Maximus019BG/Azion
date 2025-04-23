"use client";
import React, {useEffect, useState} from 'react';
import {apiUrl} from '@/app/api/config';
import axios, {AxiosResponse} from 'axios';
import Cookies from 'js-cookie';
import {Employee} from '@/app/types/types';
import DisplayEmployee from './employee';

const List = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);

    const GetUsers = () => {
        axios
            .get(`${apiUrl}/org/list/employees`, {
                headers: {
                    "Content-Type": "application/json",
                    authorization: Cookies.get("azionAccessToken"),
                },
            })
            .then((response: AxiosResponse) => {
                setEmployees(response.data);
            })
            .catch((error) => {
                console.error(error.response ? error.response : error);
            });
    };

    useEffect(() => {
        GetUsers();
    }, []);

    return (
        <div className='h-full w-full flex flex-col justify-start items-start lg:flex-row'>
            <div className='w-full h-full flex flex-col items-start gap-5 p-4 sm:p-6 md:p-8'>
                <h1 className="text-2xl sm:text-3xl md:text-4xl my-8 font-bold text-left">Organization&apos;s
                    Members
                </h1>
                <div
                    className={"w-full h-full flex flex-col gap-5 items-center justify-start"}>
                    {employees.map((employee) => (
                        <DisplayEmployee
                            key={employee.id}
                            id={employee.id}
                            name={employee.name}
                            email={employee.email}
                            age={employee.age}
                            role={employee.role}
                            orgid={employee.orgid}
                            roleLevel={employee.roleLevel}
                            profilePicture={employee.profilePicture}
                            projects={employee.projects}/>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default List;