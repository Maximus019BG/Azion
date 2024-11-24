"use client";
import React, {useEffect, useState} from 'react'
import {apiUrl} from '@/app/api/config';
import axios, {AxiosResponse} from 'axios';
import Cookies from 'js-cookie';
import {Employee} from '@/app/types/types';
import DisplayEmployee from './employee';
import SideMenu from '../Side-menu';

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
        <div className='flex'>
            <div className='lg:w-1/4'>
                <SideMenu/>
            </div>
            <div className='w-full flex flex-col justify-center items-center gap-5'>
                <h1 className="text-4xl my-16 text-center">Organization&apos;s Members</h1>
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
    )
}

export default List;