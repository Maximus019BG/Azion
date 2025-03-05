"use client";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {DateSelectArg, EventClickArg} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/app/components/dialog";
import {apiUrl} from "@/app/api/config";
import Cookies from "js-cookie";
import {canEditCalendar} from "@/app/func/funcs";
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
    const [admin, setAdmin] = useState(false);


    useEffect(() => {
        canEditCalendar().then((r) => {
            if (r) {
                setAdmin(true);
                console.log("Admin")
            }
        })
    });

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

        fetchEvents();
        fetchRoles();
    }, []);

    useEffect(() => {
        const tooltip = document.getElementById("tooltip");

        const showTooltip = (e: MouseEvent) => {
            if (admin && tooltip !== null) {
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
            if (admin) {
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
    });

    const [eventToDelete, setEventToDelete] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

    const handleDelete = (id: string) => {
        setEventToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (eventToDelete) {
            axios.delete(`${apiUrl}/schedule/delete/${eventToDelete}`, {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": Cookies.get("azionAccessToken"),
                }
            })
                .then(() => {
                    setCurrentEvents(prev => prev.filter(event => event.id !== eventToDelete));
                    setEventToDelete(null);
                    setIsDeleteDialogOpen(false);
                })
                .catch(error => console.error("Error deleting event:", error));
        }
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setEventToDelete(null);
    };

    const handleDateClick = (selected: DateSelectArg) => {
        if (admin) {
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
                setCurrentEvents(prevEvents => [...prevEvents, newEvent]);
                handleCloseDialog();
            } catch (error) {
                console.error("Error adding event:", error);
            }
        }
    };

    return (
        <div className="flex flex-col lg:flex-row w-full px-4 lg:px-10 justify-start items-start gap-4 lg:gap-8">
            <div className="w-full lg:w-3/12 flex flex-col justify-start items-start gap-4 lg:gap-10">
                <div className="text-3xl lg:text-4xl font-extrabold">
                    Calendar Events
                </div>
                <ul className="space-y-2 lg:space-y-4 w-full h-full flex flex-col justify-center items-start">
                    {currentEvents.length <= 0 && (
                        <div className="italic text-center text-gray-400">
                            No Events Present
                        </div>
                    )}
                    {currentEvents.length > 0 &&
                        currentEvents.map((event: EventData) => (
                            <li key={event.id} className="bg-accent w-full rounded-btn p-2 break-words relative">
                                {event.title}
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="absolute bottom-1 right-1 bg-red-500 rounded-lg p-1 shadow-md hover:bg-red-400 hover:text-white"
                                >
                                    <Trash2Icon className="h-4 w-4"/>
                                </button>
                            </li>
                        ))}
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogContent className="bg-base-300 rounded-lg shadow-lg h-64 max-w-lg mx-auto">
                            <DialogHeader>
                                <DialogTitle className="text-xl lg:text-2xl text-white font-semibold text-center">
                                    Confirm Delete
                                </DialogTitle>
                            </DialogHeader>
                            <div className="text-center">
                                <p>Are you sure you want to delete this event?</p>
                            </div>
                            <DialogFooter className="w-98 h-fit flex justify-center items-center">
                                <button onClick={confirmDelete}
                                        className="bg-red-500 text-white w-full py-1 rounded-btn hover:bg-red-400">Delete
                                </button>
                                <button onClick={handleCloseDeleteDialog}
                                        className="bg-accent text-white w-full py-1 rounded-btn hover:bg-blue-400">Cancel
                                </button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </ul>
            </div>

            <div className="w-full mt-4 lg:mt-8">
                <FullCalendar
                    height={"85vh"}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                    }}
                    initialView="dayGridMonth"
                    editable={admin}
                    selectable={admin}
                    selectMirror={true}
                    dayMaxEvents={true}
                    select={handleDateClick}
                    eventClick={handleEventClick}
                    events={currentEvents}
                    dayCellClassNames="hover:bg-[#1a1a1a] transition duration-300 h-10 sm:h-14 md:h-16 w-fit"
                    contentHeight="auto"
                    aspectRatio={1.35}
                />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-base-300 rounded-lg shadow-lg p-6 max-w-lg mx-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl lg:text-2xl text-white font-semibold text-center">
                            Add New Event
                        </DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4 lg:space-y-6" onSubmit={handleAddEvent}>
                        <div>
                            <input
                                type="text"
                                placeholder="Event Title"
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                                className="w-full p-2 lg:p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Room"
                                value={newMeetingRoomLink}
                                onChange={(e) => setNewMeetingRoomLink(e.target.value)}
                                className="w-full p-2 lg:p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="flex gap-2 lg:gap-3 flex-wrap">
                            {availableRoles.map((role) => (
                                <label
                                    key={role}
                                    className={`flex justify-center items-center text-sm text-white text-center px-2 lg:px-3 py-1 rounded-md cursor-pointer transition-all duration-200 ${
                                        selectedRoles.includes(role) ? "bg-base-100 border-2 border-accent" : "bg-transparent"
                                    }`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedRoles((prev) =>
                                            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
                                        );
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedRoles.includes(role)}
                                        onChange={() => {
                                        }}
                                        className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                                        style={{display: "none"}}
                                    />
                                    <span>{role}</span>
                                </label>
                            ))}
                        </div>

                        <div className="text-center">
                            <button
                                type="submit"
                                className="w-full py-2 lg:py-3 rounded-md bg-accent text-white font-semibold hover:bg-primary-dark transition duration-300"
                            >
                                Add Event
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Calendar;