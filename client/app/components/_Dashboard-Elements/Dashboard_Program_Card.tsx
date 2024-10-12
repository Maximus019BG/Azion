import React from 'react';
import Dashboard_Meeting_Card_Row from "@/app/components/_Dashboard-Elements/Dashboard_Meeting_Card_Row";

// import Dashboard_Meeting_Card_Col from "@/app/components/_Dashboard-Elements/Dashboard_Meeting_Card_Col";

interface CalendarProps {
    tabIndex?: number;
}

const DashboardProgramCard: React.FC<CalendarProps> = ({tabIndex}) => {
    return (
        <div className="w-full h-full bg-[#090909] rounded-md flex flex-col relative">
            <div className="w-full h-full flex justify-center items-start">
                <Dashboard_Meeting_Card_Row/>
            </div>
            {/*<div className="w-fit h-full flex justify-start items-start">*/}
            {/*    <Dashboard_Meeting_Card_Col/>*/}
            {/*</div>*/}
            <div className="absolute w-fit h-full flex flex-col justify-around items-center rounded-xl p-4">
                <p>9:00</p>
                <p>10:00</p>
                <p>11:00</p>
                <p>12:00</p>
                <p>14:00</p>
                <p>17:00</p>
                <p>21:00</p>
            </div>
        </div>
    );
};

export default DashboardProgramCard;