"use client";
import React, {FC} from "react";
import {Poppins} from "next/font/google";

const HeaderText = Poppins({subsets: ["latin"], weight: "600"});

interface PageProps {
    params: {
        meetingId: string | null;
        org: string;
    };
}

const MeetingView: FC<PageProps> = ({params: {meetingId, org}}) => {

    return (
        <div>

        </div>
    );
};

export default MeetingView;