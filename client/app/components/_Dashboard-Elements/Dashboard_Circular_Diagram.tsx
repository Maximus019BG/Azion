import React from 'react';
import CircularProgress from "@/app/components/diagram";

const CircularDiagram = () => {
    return (
        <div className="bg-base-300 w-96 h-64 rounded-md flex justify-center items-center">
            <CircularProgress percentage={35}/>
        </div>
    );
};

export default CircularDiagram;