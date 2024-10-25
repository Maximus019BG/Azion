import React from 'react';
import CircularProgress from "@/components/diagram";

const CircularDiagram = () => {
    return (
        <div className="bg-base-300 w-96 h-64 rounded-md flex flex-col justify-evenly items-center">
            <h1 className="w-full flex justify-center items-center text-xl text-gray-300 font-bold">Statistics</h1>
            <CircularProgress percentage={35}/>
        </div>
    );
};

export default CircularDiagram;