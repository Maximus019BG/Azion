import React from 'react';
import EditRoleSection from "@/app/components/EditRoleSection";

interface PageProps {
    params: {
        name: string;
    }
}

const EditRole: React.FC<PageProps> = ({params}) => {
    const {name} = params;

    return (
        <div className="h-dvh w-full">
            <EditRoleSection/>
        </div>
    );
};

export default EditRole;