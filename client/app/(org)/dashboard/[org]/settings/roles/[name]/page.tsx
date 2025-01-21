import React from 'react';
import EditRoleSection from "@/app/components/EditRoleSection";
import SideMenu from "@/app/components/Side-menu";

interface PageProps {
    params: {
        name: string;
    }
}

const EditRole: React.FC<PageProps> = ({params}) => {
    const {name} = params;

    return (
        <div className="h-dvh w-full flex flex-col lg:flex-row">
            <div className={`w-fit lg:w-1/4 h-full`}>
                <SideMenu/>
            </div>
            <div className={`w-full flex flex-col justify-center items-center`}>
                <h1 className={`text-white text-2xl`}><span className="font-bold uppercase">{name}</span> rights </h1>
                <EditRoleSection/>
            </div>
        </div>
    );
};

export default EditRole;