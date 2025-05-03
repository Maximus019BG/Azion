"use client"
import type React from "react"
import {useEffect, useRef, useState} from "react"
import axios from "axios"
import type {DateSelectArg, EventClickArg} from "@fullcalendar/core"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import listPlugin from "@fullcalendar/list"
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {apiUrl} from "@/app/api/config"
import Cookies from "js-cookie"
import {canEditCalendar} from "@/app/func/funcs"
import {
    CalendarClock,
    CalendarDays,
    CalendarIcon,
    CalendarRange,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    Grid3x3,
    LinkIcon,
    Plus,
    Trash2,
    Users,
    X
} from 'lucide-react'
import Link from "next/link"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"

// Define the EventData interface to include all required properties
interface EventData {
    id: string
    title: string
    description: string
    start: string
    end: string
    allDay: boolean
    link: string
    roles: string[]
    backgroundColor?: string
    borderColor?: string
    textColor?: string
}

interface DashboardCalendarProps {
    compact: boolean
    view?: "month" | "week" | "day"
}

const DashboardCalendar: React.FC<DashboardCalendarProps> = ({compact, view = "month"}) => {
    const [currentEvents, setCurrentEvents] = useState<EventData[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const [newEventTitle, setNewEventTitle] = useState<string>("")
    const [newEventDescription, setNewEventDescription] = useState<string>("")
    const [newMeetingRoomLink, setNewMeetingRoomLink] = useState<string>("")
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])
    const [availableRoles, setAvailableRoles] = useState<string[]>([])
    const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null)
    const [admin, setAdmin] = useState(false)
    const [eventToDelete, setEventToDelete] = useState<string | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
    const [isEventDetailsOpen, setIsEventDetailsOpen] = useState<boolean>(false)
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
    const [currentView, setCurrentView] = useState<string>(
        compact ? "dayGridMonth" : view === "month" ? "dayGridMonth" : view === "week" ? "timeGridWeek" : "timeGridDay",
    )
    const [currentDate, setCurrentDate] = useState<Date>(new Date())
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const calendarRef = useRef<any>(null)

    useEffect(() => {
        canEditCalendar().then((r) => {
            if (r) {
                setAdmin(true)
            }
        })
    }, [])

    useEffect(() => {
        if (!compact) {
            switch (view) {
                case "week":
                    setCurrentView("timeGridWeek")
                    break
                case "day":
                    setCurrentView("timeGridDay")
                    break
                default:
                    setCurrentView("dayGridMonth")
            }
        }
    }, [view, compact])

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await axios.get(`${apiUrl}/schedule/show/meetings`, {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: Cookies.get("azionAccessToken"),
                    },
                })
                const events = response.data.map((event: EventData) => ({
                    ...event,
                    start: new Date(event.start).toISOString(),
                    end: new Date(event.end).toISOString(),
                    backgroundColor: getRandomEventColor(event.title),
                    borderColor: getRandomEventColor(event.title),
                    textColor: "#ffffff",
                }))
                setCurrentEvents(events)
            } catch (error) {
                console.error("Error fetching events:", error)
                setError("Failed to load calendar events. Please try again later.")
            } finally {
                setIsLoading(false)
            }
        }

        const fetchRoles = async () => {
            const token = Cookies.get("azionAccessToken")
            if (!token) {
                console.error("Authorization token is missing")
                return
            }

            try {
                const response = await axios.get(`${apiUrl}/schedule/list/roles`, {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: token,
                    },
                })
                setAvailableRoles(response.data)
            } catch (error) {
                console.error("Error fetching roles:", error)
            }
        }

        fetchEvents()
        fetchRoles()
    }, [])

    // Generate consistent colors based on event title
    const getRandomEventColor = (title: string) => {
        const colors = [
            "#0ea5e9", // Primary blue
            "#0284c7", // Darker blue
            "#0c4a6e", // Deep blue
            "#2563eb", // Royal blue
            "#4f46e5", // Indigo
            "#7c3aed", // Violet
            "#8b5cf6", // Purple
        ]

        // Use the string to generate a consistent index
        let hash = 0
        for (let i = 0; i < title.length; i++) {
            hash = title.charCodeAt(i) + ((hash << 5) - hash)
        }

        const index = Math.abs(hash) % colors.length
        return colors[index]
    }

    const handleDelete = (id: string) => {
        setEventToDelete(id)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (eventToDelete) {
            axios
                .delete(`${apiUrl}/schedule/delete/${eventToDelete}`, {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: Cookies.get("azionAccessToken"),
                    },
                })
                .then(() => {
                    setCurrentEvents((prev) => prev.filter((event) => event.id !== eventToDelete))
                    setEventToDelete(null)
                    setIsDeleteDialogOpen(false)
                    setIsEventDetailsOpen(false)
                })
                .catch((error) => console.error("Error deleting event:", error))
        } else {
            console.error("Event ID is missing")
        }
    }

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false)
        setEventToDelete(null)
    }

    const handleDateClick = (selected: DateSelectArg) => {
        if (admin) {
            setSelectedDate(selected)
            setIsDialogOpen(true)
        }
    }

    const handleEventClick = (selected: EventClickArg) => {
        const event = currentEvents.find((e) => e.id === selected.event.id)
        if (event) {
            setSelectedEvent(event)
            setIsEventDetailsOpen(true)
        }
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setNewEventTitle("")
        setNewEventDescription("")
        setNewMeetingRoomLink("")
        setSelectedRoles([])
    }

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newEventTitle && selectedDate) {
            const calendarApi = selectedDate.view.calendar
            calendarApi.unselect()

            // Create event with required properties
            const newEvent = {
                id: `${selectedDate.start.toISOString()}-${newEventTitle}`,
                title: newEventTitle,
                description: newEventDescription,
                start: selectedDate.start.toISOString(),
                end: selectedDate.end?.toISOString() || selectedDate.start.toISOString(),
                allDay: selectedDate.allDay,
                link: newMeetingRoomLink,
                roles: selectedRoles,
            }

            try {
                const response = await axios.post(`${apiUrl}/schedule/create/meeting`, newEvent, {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: Cookies.get("azionAccessToken"),
                    },
                })

                // Add the event with all required properties for EventData
                const eventToAdd: EventData = {
                    ...newEvent,
                    id: response.data,
                    backgroundColor: getRandomEventColor(newEventTitle),
                    borderColor: getRandomEventColor(newEventTitle),
                    textColor: "#ffffff",
                }

                setCurrentEvents((prevEvents) => [...prevEvents, eventToAdd])
                handleCloseDialog()
            } catch (error) {
                console.error("Error adding event:", error)
            }
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        })
    }

    const handleViewChange = (newView: string) => {
        setCurrentView(newView)
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi()
            calendarApi.changeView(newView)
        }
    }

    const handlePrevious = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi()
            calendarApi.prev()
            setCurrentDate(calendarApi.getDate())
        }
    }

    const handleNext = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi()
            calendarApi.next()
            setCurrentDate(calendarApi.getDate())
        }
    }

    const handleToday = () => {
        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi()
            calendarApi.today()
            setCurrentDate(calendarApi.getDate())
        }
    }

    const formatDateRange = () => {
        const date = currentDate
        if (currentView === "dayGridMonth") {
            return new Date(date).toLocaleDateString("en-US", {month: "long", year: "numeric"})
        } else if (currentView === "timeGridWeek") {
            const start = new Date(date)
            start.setDate(start.getDate() - start.getDay())
            const end = new Date(start)
            end.setDate(end.getDate() + 6)

            const startMonth = start.toLocaleDateString("en-US", {month: "short"})
            const endMonth = end.toLocaleDateString("en-US", {month: "short"})

            if (startMonth === endMonth) {
                return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`
            } else {
                return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`
            }
        } else {
            return new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
            })
        }
    }

    if (isLoading && !compact) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="flex flex-col items-center">
                    <div
                        className="w-12 h-12 rounded-full border-4 border-t-[#0ea5e9] border-r-transparent border-b-[#0ea5e9] border-l-transparent animate-spin"></div>
                    <p className="mt-4 text-gray-400">Loading calendar...</p>
                </div>
            </div>
        )
    }

    if (error && !compact) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md">
                    <h3 className="text-red-400 text-lg font-medium mb-2">Error Loading Calendar</h3>
                    <p className="text-gray-300">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-[#111] border border-[#333] hover:border-red-400 rounded-md text-gray-300 hover:text-red-400 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {!compact && (
                <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePrevious}
                            className="border-[#222] hover:border-[#0ea5e9] text-gray-400 hover:text-[#0ea5e9]"
                        >
                            <ChevronLeft className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleNext}
                            className="border-[#222] hover:border-[#0ea5e9] text-gray-400 hover:text-[#0ea5e9]"
                        >
                            <ChevronRight className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleToday}
                            className="border-[#222] hover:border-[#0ea5e9] text-gray-400 hover:text-[#0ea5e9]"
                        >
                            Today
                        </Button>
                        <h3 className="text-sm sm:text-lg font-medium ml-2 truncate">{formatDateRange()}</h3>
                    </div>

                    <div
                        className="flex space-x-1 bg-[#111] p-1 rounded-md border border-[#222] self-start sm:self-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewChange("dayGridMonth")}
                            className={`${
                                currentView === "dayGridMonth" ? "bg-[#0c4a6e] text-white" : "text-gray-400 hover:text-[#0ea5e9]"
                            }`}
                        >
                            <CalendarDays className="h-4 w-4 sm:mr-1"/>
                            <span className="hidden sm:inline">Month</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewChange("timeGridWeek")}
                            className={`${
                                currentView === "timeGridWeek" ? "bg-[#0c4a6e] text-white" : "text-gray-400 hover:text-[#0ea5e9]"
                            }`}
                        >
                            <CalendarRange className="h-4 w-4 sm:mr-1"/>
                            <span className="hidden sm:inline">Week</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewChange("timeGridDay")}
                            className={`${
                                currentView === "timeGridDay" ? "bg-[#0c4a6e] text-white" : "text-gray-400 hover:text-[#0ea5e9]"
                            }`}
                        >
                            <CalendarClock className="h-4 w-4 sm:mr-1"/>
                            <span className="hidden sm:inline">Day</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewChange("listWeek")}
                            className={`${
                                currentView === "listWeek" ? "bg-[#0c4a6e] text-white" : "text-gray-400 hover:text-[#0ea5e9]"
                            }`}
                        >
                            <Grid3x3 className="h-4 w-4 sm:mr-1"/>
                            <span className="hidden sm:inline">List</span>
                        </Button>
                    </div>

                    {admin && (
                        <Button
                            onClick={() => {
                                if (calendarRef.current) {
                                    // Create a proper DateSelectArg object
                                    const now = new Date()
                                    const later = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour later

                                    // Get the calendar API
                                    const calendarApi = calendarRef.current.getApi()

                                    // Create a selection that matches the DateSelectArg interface
                                    calendarApi.select(now, later)

                                    // The select handler will be called with a proper DateSelectArg
                                    // which will set selectedDate correctly

                                    // Open the dialog after the selection is made
                                    setIsDialogOpen(true)
                                }
                            }}
                            className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white self-start sm:self-auto"
                        >
                            <Plus className="h-4 w-4 mr-2"/>
                            <span className="hidden xs:inline">Add Event</span>
                        </Button>
                    )}
                </div>
            )}

            <div className={`flex-grow ${!compact ? "calendar-custom-styles" : ""}`}>
                <FullCalendar
                    ref={calendarRef}
                    height="100%"
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    headerToolbar={
                        compact
                            ? {
                                left: "prev,next",
                                center: "title",
                                right: "today",
                            }
                            : false
                    }
                    initialView={currentView}
                    editable={admin}
                    selectable={admin}
                    selectMirror={true}
                    dayMaxEvents={true}
                    select={handleDateClick}
                    eventClick={handleEventClick}
                    events={currentEvents}
                    contentHeight="auto"
                    aspectRatio={1.35}
                    eventTimeFormat={{
                        hour: "2-digit",
                        minute: "2-digit",
                        meridiem: false,
                    }}
                    slotLabelFormat={{
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }}
                    eventClassNames="rounded-md overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    dayCellClassNames="hover:bg-[#111] transition-colors"
                    slotLabelClassNames="text-gray-400"
                    allDayClassNames="text-gray-400"
                    dayHeaderClassNames="text-gray-300"
                    nowIndicator={true}
                    weekNumbers={!compact && window.innerWidth > 768}
                    weekNumberFormat={{week: "numeric"}}
                    weekNumberClassNames="text-xs text-gray-500 bg-[#111] rounded px-1"
                    firstDay={1} // Start week on Monday
                    businessHours={{
                        daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                        startTime: "09:00",
                        endTime: "17:00",
                    }}
                    slotMinTime="07:00:00"
                    slotMaxTime="21:00:00"
                    scrollTimeReset={false}
                    eventDisplay="block"
                    views={{
                        dayGridMonth: {
                            dayMaxEventRows: window.innerWidth < 768 ? 2 : 3,
                        },
                        timeGrid: {
                            dayMaxEventRows: true,
                            nowIndicator: true,
                            slotEventOverlap: false,
                        },
                        listWeek: {
                            listDayFormat: {weekday: "long"},
                            listDaySideFormat: {month: "short", day: "numeric"},
                        },
                    }}
                />
            </div>

            {/* Add Event Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-[#0ea5e9] font-semibold flex items-center">
                            <Plus className="h-5 w-5 mr-2"/>
                            Add New Event
                        </DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleAddEvent}>
                        <div className="space-y-2">
                            <label htmlFor="event-title" className="text-sm text-gray-400 flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2 text-[#0ea5e9]"/>
                                Event Title
                            </label>
                            <Input
                                id="event-title"
                                type="text"
                                placeholder="Enter event title"
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                                className="bg-[#111] border-[#333] focus:border-[#0ea5e9] text-white"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="event-description" className="text-sm text-gray-400 flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-2 text-[#0ea5e9]"/>
                                Description (Optional)
                            </label>
                            <Input
                                id="event-description"
                                type="text"
                                placeholder="Enter event description"
                                value={newEventDescription}
                                onChange={(e) => setNewEventDescription(e.target.value)}
                                className="bg-[#111] border-[#333] focus:border-[#0ea5e9] text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="meeting-link" className="text-sm text-gray-400 flex items-center">
                                <LinkIcon className="h-4 w-4 mr-2 text-[#0ea5e9]"/>
                                Meeting Room/Link
                            </label>
                            <Input
                                id="meeting-link"
                                type="text"
                                placeholder="Enter room or meeting link"
                                value={newMeetingRoomLink}
                                onChange={(e) => setNewMeetingRoomLink(e.target.value)}
                                className="bg-[#111] border-[#333] focus:border-[#0ea5e9] text-white"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 flex items-center">
                                <Users className="h-4 w-4 mr-2 text-[#0ea5e9]"/>
                                Assign to Roles
                            </label>
                            <div className="flex flex-wrap gap-2 p-2 bg-[#111] border border-[#222] rounded-md">
                                {availableRoles.map((role) => (
                                    <Badge
                                        key={role}
                                        variant="outline"
                                        className={`cursor-pointer transition-all duration-200 ${
                                            selectedRoles.includes(role)
                                                ? "bg-[#0c4a6e] border-[#0ea5e9] text-white"
                                                : "bg-[#111] border-[#333] text-gray-400 hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
                                        }`}
                                        onClick={() => {
                                            setSelectedRoles((prev) =>
                                                prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
                                            )
                                        }}
                                    >
                                        {selectedRoles.includes(role) && <Check className="h-3 w-3 mr-1"/>}
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-[#0ea5e9]"/>
                                Time
                            </label>
                            <div className="bg-[#111] border border-[#222] rounded-md p-3 text-sm">
                                {selectedDate && (
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex items-center">
                                            <span className="text-gray-400 w-20">Start:</span>
                                            <span
                                                className="text-white">{new Date(selectedDate.start).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-gray-400 w-20">End:</span>
                                            <span className="text-white">
                        {selectedDate.end ? new Date(selectedDate.end).toLocaleString() : "Not specified"}
                      </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-gray-400 w-20">All Day:</span>
                                            <span className="text-white">{selectedDate.allDay ? "Yes" : "No"}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseDialog}
                                className="border-[#333] hover:border-[#0ea5e9] text-gray-300 hover:text-[#0ea5e9]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white"
                            >
                                <Plus className="h-4 w-4 mr-2"/>
                                Add Event
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-red-400 font-semibold flex items-center">
                            <Trash2 className="h-5 w-5 mr-2"/>
                            Confirm Delete
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-gray-300">Are you sure you want to delete this event? This action cannot be
                        undone.</p>
                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseDeleteDialog}
                            className="border-[#333] hover:border-[#0ea5e9] text-gray-300 hover:text-[#0ea5e9]"
                        >
                            Cancel
                        </Button>
                        <Button type="button" onClick={confirmDelete}
                                className="bg-red-500 hover:bg-red-600 text-white">
                            <Trash2 className="h-4 w-4 mr-2"/>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Event Details Dialog */}
            <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
                <DialogContent
                    className="bg-[#0a0a0a] border-[#222] text-white sm:max-w-md w-[95vw] max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-[#0ea5e9] font-semibold">Event Details</DialogTitle>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsEventDetailsOpen(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-white"
                        >
                            <X className="h-4 w-4"/>
                        </Button>
                    </DialogHeader>
                    {selectedEvent && (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center">
                                    <div
                                        className="w-3 h-12 rounded-l-md mr-2"
                                        style={{backgroundColor: selectedEvent.backgroundColor || "#0ea5e9"}}
                                    ></div>
                                    <h3 className="text-lg font-medium break-words">{selectedEvent.title}</h3>
                                </div>

                                <div className="flex items-center text-gray-400 text-sm mt-2">
                                    <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0"/>
                                    <span className="break-words">{formatDate(selectedEvent.start)}</span>
                                </div>

                                {selectedEvent.description && (
                                    <div className="mt-2 text-gray-300 break-words">{selectedEvent.description}</div>
                                )}
                            </div>

                            {selectedEvent.link && (
                                <div className="bg-[#111] border border-[#222] rounded-lg p-3">
                                    <div className="flex items-center text-gray-400 text-sm mb-2">
                                        <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0"/>
                                        <span>Meeting Link</span>
                                    </div>
                                    {selectedEvent.link.includes("http") ? (
                                        <Link
                                            href={selectedEvent.link}
                                            target="_blank"
                                            className="text-[#0ea5e9] hover:underline break-all block"
                                        >
                                            {selectedEvent.link}
                                        </Link>
                                    ) : (
                                        <p className="text-gray-300 break-all">{selectedEvent.link}</p>
                                    )}
                                </div>
                            )}

                            {selectedEvent.roles && selectedEvent.roles.length > 0 && (
                                <div className="bg-[#111] border border-[#222] rounded-lg p-3">
                                    <div className="text-gray-400 text-sm mb-2 flex items-center">
                                        <Users className="h-4 w-4 mr-2 flex-shrink-0"/>
                                        <span>Assigned Roles</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedEvent.roles.map((role) => (
                                            <Badge key={role} className="bg-[#0c4a6e] text-white">
                                                {role}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-4">
                                <div className="text-xs text-gray-500">
                                    {selectedEvent.allDay ? "All day event" : "Time-specific event"}
                                </div>

                                {admin && (
                                    <div className="flex space-x-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(selectedEvent.id)}
                                                        className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Delete event</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .calendar-custom-styles .fc-theme-standard .fc-scrollgrid {
                    border-color: #222;
                }

                .calendar-custom-styles .fc-theme-standard td,
                .calendar-custom-styles .fc-theme-standard th {
                    border-color: #222;
                }

                .calendar-custom-styles .fc-day-today {
                    background-color: rgba(14, 165, 233, 0.05) !important;
                }

                .calendar-custom-styles .fc-timegrid-now-indicator-line {
                    border-color: #0ea5e9;
                }

                .calendar-custom-styles .fc-timegrid-now-indicator-arrow {
                    border-color: #0ea5e9;
                    color: #0ea5e9;
                }

                .calendar-custom-styles .fc-list-day-cushion {
                    background-color: #111;
                }

                .calendar-custom-styles .fc-list-event:hover td {
                    background-color: rgba(14, 165, 233, 0.1);
                }

                .calendar-custom-styles .fc-list-event-dot {
                    border-color: #0ea5e9;
                }

                .calendar-custom-styles .fc-event {
                    border-radius: 4px;
                    padding: 2px;
                }

                .calendar-custom-styles .fc-event-main {
                    padding: 2px 4px;
                }

                .calendar-custom-styles .fc-h-event .fc-event-title {
                    font-weight: 500;
                }

                .calendar-custom-styles .fc-daygrid-day-number,
                .calendar-custom-styles .fc-col-header-cell-cushion {
                    color: #e5e5e5;
                }

                .calendar-custom-styles .fc-daygrid-day-number:hover,
                .calendar-custom-styles .fc-col-header-cell-cushion:hover {
                    color: #0ea5e9;
                    text-decoration: none;
                }

                .calendar-custom-styles .fc-toolbar.fc-header-toolbar {
                    flex-direction: column;
                    gap: 0.5rem;
                }

                @media (min-width: 640px) {
                    .calendar-custom-styles .fc-toolbar.fc-header-toolbar {
                        flex-direction: row;
                    }
                }

                .calendar-custom-styles .fc-toolbar-title {
                    font-size: 1.1rem;
                }

                @media (min-width: 640px) {
                    .calendar-custom-styles .fc-toolbar-title {
                        font-size: 1.25rem;
                    }
                }

                .calendar-custom-styles .fc-button {
                    padding: 0.3rem 0.5rem;
                    font-size: 0.8rem;
                }

                @media (min-width: 640px) {
                    .calendar-custom-styles .fc-button {
                        padding: 0.4rem 0.65rem;
                        font-size: 0.875rem;
                    }
                }
            `}</style>
        </div>
    )
}

export default DashboardCalendar