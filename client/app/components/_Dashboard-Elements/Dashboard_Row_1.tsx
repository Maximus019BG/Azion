import React from 'react';
import Dashboard_Meetings_Card from "@/app/components/_Dashboard-Elements/Dashboard_Meetings_Card";
import Dashboard_Task_Card from "@/app/components/_Dashboard-Elements/Dashboard_Task_Card";
import Dashboard_Circular_Diagram from "@/app/components/_Dashboard-Elements/Dashboard_Circular_Diagram";

const DashboardRow1 = () => {
    return (
        <div className="w-full h-full flex justify-center items-center gap-8 mt-10">
            <Dashboard_Meetings_Card/>
            <Dashboard_Task_Card/>
            <Dashboard_Circular_Diagram/>
        </div>
    );
};

export default DashboardRow1;