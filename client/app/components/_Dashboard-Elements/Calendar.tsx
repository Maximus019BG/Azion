"use client";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {DateSelectArg, EventClickArg} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/app/components/dialog";
import {apiUrl} from "@/app/api/config";
import Cookies from "js-cookie";
import {UserData} from "@/app/func/funcs";
import {EventData} from "@/app/types/types";
import {Trash2Icon} from "lucide-react";

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
                const events = response.data.map((event: EventData) => ({
                    ...event,
                    start: new Date(event.start).toISOString(),
                    end: new Date(event.end).toISOString(),
                }));
                console.log("Fetched events:", events);
                setCurrentEvents(events);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

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

    // Move handleDelete function here, outside handleAddEvent
    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            axios.delete(`${apiUrl}/schedule/delete/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": Cookies.get("azionAccessToken"),
                }
            })
                .then(() => {
                    setCurrentEvents(prev => prev.filter(event => event.id !== id));
                })
                .catch(error => console.error("Error deleting event:", error));
        }
    };

    const handleDateClick = (selected: DateSelectArg) => {
        if (userRoleLevel >= 1 && userRoleLevel <= 3) {
            setSelectedDate(selected);
            setIsDialogOpen(true);
        }
    };

    const handleEventClick = (selected: EventClickArg) => {
        if (window.confirm(`Are you sure you want to delete the event "${selected.event.title}"?`)) {
            selected.event.remove();
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
            const calendarApi = selectedDate.view.calendar;
            calendarApi.unselect();

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
                <div className="w-3/12 flex flex-col justify-start items-start gap-10">
                    <div className="text-2xl font-extrabold">
                        Calendar Events
                    </div>
                    <ul className="space-y-4 w-full h-full flex flex-col justify-center items-start">
                        {currentEvents.length <= 0 && (
                            <div className="italic text-center text-gray-400">
                                No Events Present
                            </div>
                        )}
                        {currentEvents.length > 0 &&
                            currentEvents.map((event: EventData) => (
                                <li key={event.id} className="bg-accent w-full rounded-btn p-2 break-words relative">
                                    {event.title}

                                    {/* Waste Bin Icon in the bottom-right corner */}
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="absolute bottom-1 right-1 bg-transparent rounded-lg p-1 shadow-md hover:bg-red-500 hover:text-white"
                                    >
                                        <Trash2Icon className="h-4 w-4"/>
                                    </button>
                                </li>
                            ))}
                    </ul>
                </div>

                <div className="w-full mt-8">
                    <FullCalendar
                        height={"85vh"}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                        }}
                        initialView="dayGridMonth"
                        editable={userRoleLevel >= 1 && userRoleLevel <= 3}
                        selectable={userRoleLevel >= 1 && userRoleLevel <= 3}
                        selectMirror={true}
                        dayMaxEvents={true}
                        select={handleDateClick}
                        eventClick={handleEventClick}
                        events={currentEvents}
                        dayCellClassNames="hover:bg-[#1a1a1a] transition duration-300"
                    />
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="flex flex-col justify-center items-center">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Add New Event</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-5" onSubmit={handleAddEvent}>
                        <input
                            type="text"
                            placeholder="Event Title"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            className="input-field"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Meeting Link"
                            value={newMeetingRoomLink}
                            onChange={(e) => setNewMeetingRoomLink(e.target.value)}
                            className="input-field"
                            required
                        />
                        <div className="flex gap-3">
                            {availableRoles.map((role) => (
                                <label key={role} className="text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={selectedRoles.includes(role)}
                                        onChange={() => {
                                            setSelectedRoles(prev =>
                                                prev.includes(role)
                                                    ? prev.filter(r => r !== role)
                                                    : [...prev, role]
                                            );
                                        }}
                                    />
                                    {role}
                                </label>
                            ))}
                        </div>
                        <button type="submit" className="button bg-primary text-white">Add Event</button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Calendar;
