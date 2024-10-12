import React from 'react';
import Dashboard_Meeting_Card_Row from "@/app/components/_Dashboard-Elements/Dashboard_Meeting_Card_Row";
import Dashboard_Meeting_Card_Col from "@/app/components/_Dashboard-Elements/Dashboard_Meeting_Card_Col";


interface CalendarProps {
    tabIndex?: number;
}

const DashboardProgramCard: React.FC<CalendarProps> = ({tabIndex}) => {
    return (
        <div className="w-full h-full bg-base-300 rounded-md p-8">
            <div className="w-full flex justify-end items-end">
                <Dashboard_Meeting_Card_Row/>
            </div>
            <div className="h-full flex justify-start items-start">
                <Dashboard_Meeting_Card_Col/>
            </div>
        </div>
    );
};

export default DashboardProgramCard;