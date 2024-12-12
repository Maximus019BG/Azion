import React from 'react';
import {LampDemo} from "@/app/components/Lamp";
import {TimelineDemo} from "@/app/components/Period";

const WorkProcess = () => {
    return (
        <div className="bg-gradient-to-b from-[#02061700] via-[#02061778] to-[#020617]">
            <LampDemo/>
            <TimelineDemo/>
        </div>
    );
};

export default WorkProcess;