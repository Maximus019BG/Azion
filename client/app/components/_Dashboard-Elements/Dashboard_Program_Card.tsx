import React from 'react';
import {Meeting} from '@/app/types/types';
import DashboardMeetingCardRow from "@/app/components/_Dashboard-Elements/Dashboard_Meeting_Card_Row";

interface CalendarProps {
    tabIndex?: number;
    meetings: Meeting[];
}

const DashboardProgramCard: React.FC<CalendarProps> = ({tabIndex, meetings}) => {
    return (
        <div className="w-full h-full bg-[#090909] rounded-md flex flex-col relative">
            <div className="w-full h-full flex justify-end items-start">
                <DashboardMeetingCardRow meetings={meetings}/>
            </div>
            <div className="absolute w-fit h-full flex flex-col justify-around items-center rounded-xl p-3">
                {["9:00", "10:00", "11:00", "12:00", "14:00", "17:00", "21:00"].map(time => (
                    <p key={time}>{time}</p>
                ))}
            </div>
        </div>
    );
};

export default DashboardProgramCard;
