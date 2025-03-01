"use client"
import React, {createContext, ReactNode, useState} from 'react';
import {Meeting} from '@/app/types/types';

interface MeetingContextProps {
    meetings: Meeting[];
    addMeeting: (meeting: Meeting) => void;
}

export const MeetingContext = createContext<MeetingContextProps | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);

    const addMeeting = (meeting: Meeting) => {
        setMeetings((prevMeetings) => [...prevMeetings, meeting]);
    };

    return (
        <MeetingContext.Provider value={{meetings, addMeeting}}>
            {children}
        </MeetingContext.Provider>
    );
};