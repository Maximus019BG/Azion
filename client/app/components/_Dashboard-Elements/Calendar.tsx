"use client";

import React, {useEffect, useState} from "react";
import axios from "axios";
import {DateSelectArg, EventApi, EventClickArg, formatDate,} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {apiUrl} from "@/app/api/config";
import Cookies from "js-cookie";

interface EventData {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    meetingRoomLink: string;
    roles: string[];
}

const Calendar: React.FC = () => {
    const [currentEvents, setCurrentEvents] = useState<EventData[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [newEventTitle, setNewEventTitle] = useState<string>("");
    const [newMeetingRoomLink, setNewMeetingRoomLink] = useState<string>("");
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);

    useEffect(() => {
        // Fetch events from the server when the component mounts
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${apiUrl}/schedule/show/meetings`);
                const events: EventData[] = response.data.map((event: EventApi) => ({
                    id: event.id,
                    title: event.title,
                    start: event.start ? event.start.toISOString() : "",
                    end: event.end ? event.end.toISOString() : event.start ? event.start.toISOString() : "",
                    allDay: event.allDay,
                    meetingRoomLink: `https://meeting.com/${event.id}`,
                    roles: ["Admin", "User"] // Example roles
                }));
                setCurrentEvents(events);
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
                console.log(response.data);
                setAvailableRoles(response.data);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };

        fetchEvents();
        fetchRoles();
    }, []);

    const handleDateClick = (selected: DateSelectArg) => {
        setSelectedDate(selected);
        setIsDialogOpen(true);
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
                meetingRoomLink: newMeetingRoomLink,
                roles: selectedRoles
            };

            try {
                await axios.post(`${apiUrl}/schedule/create/meeting`, newEvent);
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
                                <li
                                    className="border border-gray-200 shadow px-4 py-2 rounded-md text-blue-800"
                                    key={event.id}
                                >
                                    {event.title}
                                    <br/>
                                    <label className="text-slate-950">
                                        {event.start && formatDate(new Date(event.start), {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}{" "}
                                        {/* Format event start date */}
                                    </label>
                                    <br/>
                                    <a href={event.meetingRoomLink} target="_blank" rel="noopener noreferrer">
                                        Join Meeting
                                    </a>
                                    <br/>
                                    Roles: {event.roles.join(", ")}
                                </li>
                            ))}
                    </ul>
                </div>

                <div className="w-9/12 mt-8">
                    <FullCalendar
                        height={"85vh"}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // Initialize calendar with required plugins.
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                        }} // Set header toolbar options.
                        initialView="dayGridMonth" // Initial view mode of the calendar.
                        editable={true} // Allow events to be edited.
                        selectable={true} // Allow dates to be selectable.
                        selectMirror={true} // Mirror selections visually.
                        dayMaxEvents={true} // Limit the number of events displayed per day.
                        select={handleDateClick} // Handle date selection to create new events.
                        eventClick={handleEventClick} // Handle clicking on events (e.g., to delete them).
                        eventsSet={(events) => setCurrentEvents(events.map(event => ({
                            id: event.id,
                            title: event.title,
                            start: event.start ? event.start.toISOString() : "",
                            end: event.end ? event.end.toISOString() : event.start ? event.start.toISOString() : "",
                            allDay: event.allDay,
                            meetingRoomLink: `https://meeting.com/${event.id}`,
                            roles: ["Admin", "User"] // Example roles
                        })))} // Update state with current events whenever they change.
                        initialEvents={currentEvents} // Initial events loaded from the server.
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
                            className="border border-gray-200 p-3 rounded-md text-lg"
                        />
                        <input
                            type="text"
                            placeholder="Meeting Room Link"
                            value={newMeetingRoomLink}
                            onChange={(e) => setNewMeetingRoomLink(e.target.value)} // Update meeting room link as the user types.
                            required
                            className="border border-gray-200 p-3 rounded-md text-lg"
                        />
                        <select
                            multiple
                            value={selectedRoles}
                            onChange={(e) => setSelectedRoles(Array.from(e.target.selectedOptions, option => option.value))} // Update selected roles
                            required
                            className="w-full border border-gray-200 p-3 rounded-md text-lg"
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
                        {" "}
                        {/* Button to submit new event */}
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Calendar;