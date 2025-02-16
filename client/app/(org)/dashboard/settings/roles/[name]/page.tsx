"use client"
import React, {useEffect} from 'react';
import EditRoleSection from "@/app/components/EditRoleSection";
import SideMenu from "@/app/components/Side-menu";
import {sessionCheck, UserHasRight, roleExists} from "@/app/func/funcs";

interface PageProps {
    params: {
        name: string;
    }
}

const EditRole: React.FC<PageProps> = ({params}) => {
    const {name} = params;
    useEffect(() => {
        const init = async () => {
            //Basic checks
            if (!await roleExists(name)) {
                window.location.href = window.location.pathname.slice(0, window.location.pathname.length - name.length);
            }

            UserHasRight("roles:write");
            sessionCheck();
        }
        init();
    });

    return (
        <div className="h-dvh w-full flex flex-col lg:flex-row ">
            <div className={`w-fit lg:w-1/4 h-full`}>
                <SideMenu/>
            </div>
            <div className={`w-full h-full flex flex-col justify-center items-center`}>
                <div className="p-4 w-full flex flex-col items-start">
                    <h1 className="text-white text-2xl"><span className="text-white text-2xl font-bold uppercase">{name}</span> permissions</h1>
                    <p className="mt-2 font-light text-sm w-5/6">
                        You can modify the permissions assigned to the <span className="font-semibold">{name}</span> role.
                        This allows you to grant or restrict access to specific features, ensuring that users with this role have the appropriate level of control.
                        You can enable or disable permissions such as viewing, editing, deleting, or managing settings based on your organization&apos;s needs.
                    </p>

                </div>
                <div className="w-full">
                    <EditRoleSection RoleName={name}/>
                </div>
            </div>
        </div>
    );
};

export default EditRole;