"use client";

import React, {useEffect, useState} from "react";
import axios from "axios";
import {DateSelectArg, EventApi, EventClickArg} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/app/components/dialog";
import {apiUrl} from "@/app/api/config";
import Cookies from "js-cookie";
import {UserData} from "@/app/func/funcs";
import {EventData} from "@/app/types/types";


const Calendar: React.FC = () => {
    const [currentEvents, setCurrentEvents] = useState<EventData[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [newEventTitle, setNewEventTitle] = useState<string>("");
    const [newMeetingRoomLink, setNewMeetingRoomLink] = useState<string>("");
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
    const [userRoleLevel, setUserRoleLevel] = useState<number>(0);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${apiUrl}/schedule/show/meetings`, {
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": Cookies.get("azionAccessToken"),
                    },
                });
                console.log("Fetched events:", response.data); // Log fetched events
                setCurrentEvents(response.data);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        // Fetch available roles from the server
        const fetchRoles = async () => {
            const token = Cookies.get("azionAccessToken");
            if (!token) {
                console.error("Authorization token is missing");
                return;
            }

            try {
                const response = await axios.get(`${apiUrl}/schedule/list/roles`, {
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": token,
                    },
                });
                setAvailableRoles(response.data);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };

        // Fetch user role level from the server
        const fetchUserRoleLevel = async () => {
            UserData().then((data) => {
                setUserRoleLevel(data.roleLevel);
            });
        };

        fetchEvents();
        fetchRoles();
        fetchUserRoleLevel();
    }, []);

    useEffect(() => {
        const tooltip = document.getElementById("tooltip");

        const showTooltip = (e: MouseEvent) => {
            if (tooltip && userRoleLevel >= 1 && userRoleLevel <= 3) {
                tooltip.style.left = `${e.pageX + 10}px`;
                tooltip.style.top = `${e.pageY + 10}px`;
                tooltip.style.opacity = "1";
            }
        };

        const hideTooltip = () => {
            if (tooltip) {
                tooltip.style.opacity = "0";
            }
        };

        document.querySelectorAll<HTMLElement>(".fc-daygrid-day").forEach(cell => {
            if (userRoleLevel >= 1 && userRoleLevel <= 3) {
                cell.classList.add("cursor-pointer");
                cell.addEventListener("mouseenter", showTooltip);
                cell.addEventListener("mouseleave", hideTooltip);
            } else {
                cell.classList.remove("cursor-pointer");
                cell.removeEventListener("mouseenter", showTooltip);
                cell.removeEventListener("mouseleave", hideTooltip);
            }
        });

        return () => {
            document.querySelectorAll<HTMLElement>(".fc-daygrid-day").forEach(cell => {
                cell.removeEventListener("mouseenter", showTooltip);
                cell.removeEventListener("mouseleave", hideTooltip);
            });
        };
    }, [userRoleLevel]);

    const handleDateClick = (selected: DateSelectArg) => {
        if (userRoleLevel >= 1 && userRoleLevel <= 3) {
            setSelectedDate(selected);
            setIsDialogOpen(true);
        }
    };

    const handleEventClick = (selected: EventClickArg) => {
        // Prompt user for confirmation before deleting an event
        if (
            window.confirm(
                `Are you sure you want to delete the event "${selected.event.title}"?`
            )
        ) {
            selected.event.remove();
            // Send delete request to the server
            axios.delete(`${apiUrl}/schedule/delete/${selected.event.id}`)
                .catch(error => console.error("Error deleting event:", error));
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setNewEventTitle("");
        setNewMeetingRoomLink("");
        setSelectedRoles([]);
    };

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newEventTitle && selectedDate) {
            const calendarApi = selectedDate.view.calendar; // Get the calendar API instance.
            calendarApi.unselect(); // Unselect the date range.

            const newEvent: EventData = {
                id: `${selectedDate.start.toISOString()}-${newEventTitle}`,
                title: newEventTitle,
                start: selectedDate.start.toISOString(),
                end: selectedDate.end?.toISOString() || selectedDate.start.toISOString(),
                allDay: selectedDate.allDay,
                link: newMeetingRoomLink,
                roles: selectedRoles
            };

            try {
                await axios.post(`${apiUrl}/schedule/create/meeting`, newEvent, {
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": Cookies.get("azionAccessToken"),
                    },
                });
                calendarApi.addEvent(newEvent);
                handleCloseDialog();
            } catch (error) {
                console.error("Error adding event:", error);
            }
        }
    };

    return (
        <div>
            <div className="flex w-full px-10 justify-start items-start gap-8">
                <div className="w-3/12">
                    <div className="py-10 text-2xl font-extrabold px-7">
                        Calendar Events
                    </div>
                    <ul className="space-y-4">
                        {currentEvents.length <= 0 && (
                            <div className="italic text-center text-gray-400">
                                No Events Present
                            </div>
                        )}

                        {currentEvents.length > 0 &&
                            currentEvents.map((event: EventData) => (
                                <li key={event.id}>
                                    {event.title}
                                </li>
                            ))}
                    </ul>
                </div>

                <div className="w-9/12 mt-8">
                    <FullCalendar
                        height={"85vh"}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                        }} // Set header toolbar options.
                        initialView="dayGridMonth" // Initial view mode of the calendar.
                        editable={userRoleLevel >= 1 && userRoleLevel <= 3} // Allow events to be edited only for admins.
                        selectable={userRoleLevel >= 1 && userRoleLevel <= 3} // Allow dates to be selectable only for admins.
                        selectMirror={true} // Mirror selections visually.
                        dayMaxEvents={true} // Limit the number of events displayed per day.
                        select={handleDateClick} // Handle date selection to create new events.
                        eventClick={handleEventClick} // Handle clicking on events (e.g., to delete them).

                        initialEvents={currentEvents} // Initial events loaded from the server.
                        dayCellClassNames="hover:bg-[#1a1a1a] transition duration-300" // Add custom class to day cells
                    />
                </div>
            </div>

            {/* Dialog for adding new events */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="flex flex-col justify-center items-center">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Add New Event Details</DialogTitle>
                    </DialogHeader>
                    <form className="flex flex-col justify-center items-start gap-3" onSubmit={handleAddEvent}>
                        <input
                            type="text"
                            placeholder="Event Title"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)} // Update new event title as the user types.
                            required
                            className="border border-gray-200 p-3 rounded-md text-lg cursor-pointer"
                        />
                        <input
                            type="text"
                            placeholder="Meeting Room Link"
                            value={newMeetingRoomLink}
                            onChange={(e) => setNewMeetingRoomLink(e.target.value)} // Update meeting room link as the user types.
                            required
                            className="border border-gray-200 p-3 rounded-md text-lg cursor-pointer"
                        />
                        <select
                            multiple
                            value={selectedRoles}
                            onChange={(e) => setSelectedRoles(Array.from(e.target.selectedOptions, option => option.value))} // Update selected roles
                            required
                            className="w-full border border-gray-200 p-3 rounded-md text-lg cursor-pointer"
                        >
                            {availableRoles.map(role => (
                                <option key={role} value={role} className="text-white">
                                    {role}
                                </option>
                            ))}
                        </select>
                        <button
                            className="w-full bg-green-500 text-white p-3 mt-5 rounded-md"
                            type="submit"
                        >
                            Add
                        </button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Tooltip */}
            <div id="tooltip">
                Create meeting
            </div>
        </div>
    );
};

export default Calendar;