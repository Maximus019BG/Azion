import React from 'react';
import {ArrowLeft} from "lucide-react";
import Link from "next/link";
interface Btn {
    hasOrg:boolean,
}

const ReturnButton: React.FC<Btn> = ({hasOrg}) => {
    return (
        <div>
            <Link href={`${hasOrg ? "/dashboard" : "/organizations"}`} className="btn hover:bg-lightAccent hover:border-lightAccent  btn-outline btn-sm">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                {hasOrg ? (<h1>Back to dashboard</h1>) : (<h1>Back</h1>)}
            </Link>
        </div>
    );
};

export default ReturnButton;