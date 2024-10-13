import React from 'react';

const DashboardMeetingCardRow = () => {
    return (
        <div className="w-[75vw] h-[100vh] bg-base-300 flex justify-evenly items-center rounded-xl">
            <div className="w-full h-full flex flex-col justify-start items-center border-r-2 border-gray-300">
                <h1 className="bg-base-100 w-full p-2 flex justify-center items-center">Monday</h1>
                <div
                    className="bg-base-300 w-full h-full grid grid-rows-auto gap-2 p-3">
                    <div className="bg-[#101010] w-full h-full rounded-md"></div>
                    <div className="bg-[#101010] w-full h-full rounded-md"></div>
                    <div className="bg-[#101010] w-full h-full rounded-md"></div>
                    <div className="bg-[#101010] w-full h-full rounded-md"></div>
                </div>
            </div>
            <div className="w-full h-full flex justify-center items-start border-r-2 border-gray-300">
                <h1 className="bg-base-100 w-full p-2 flex justify-center items-center">Tuesday</h1>
            </div>
            <div className="w-full h-full flex justify-center items-start border-r-2 border-gray-300">
                <h1 className="bg-base-100 w-full p-2 flex justify-center items-center">Wednesday</h1>
            </div>
            <div className="w-full h-full flex justify-center items-start border-r-2 border-gray-300">
                <h1 className="bg-base-100 w-full p-2 flex justify-center items-center">Thursday</h1>
            </div>
            <div className="w-full h-full flex justify-center items-start border-r-2 border-gray-300">
                <h1 className="bg-base-100 w-full p-2 flex justify-center items-center">Friday</h1>
            </div>
        </div>
    );
};

export default DashboardMeetingCardRow;