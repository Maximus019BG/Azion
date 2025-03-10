"use client"

import {useState} from "react"
import {
    addDays,
    addHours,
    addMonths,
    endOfMonth,
    endOfWeek,
    format,
    isSameDay,
    isSameMonth,
    startOfMonth,
    startOfWeek,
    subMonths,
} from "date-fns"
import {ChevronLeft, ChevronRight, Plus} from "lucide-react"
import {cn} from "@/lib/utils/cn"
import {Button} from "@/components/ui/button"
import {Card} from "@/components/ui/card"
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs"
import EventModal from "./event-modal"
import EventList from "./event-list"
import DayView from "./day-view"
import WeekView from "@/app/components/New-Calendar/week-view"
import {useMobile} from "@/hooks/use-mobile"

export type Event = {
    id: string
    title: string
    room: string
    start: Date
    end: Date
}

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [view, setView] = useState<"month" | "week" | "day">("month")
    const [events, setEvents] = useState<Event[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newEventStart, setNewEventStart] = useState<Date | null>(null)
    const [newEventEnd, setNewEventEnd] = useState<Date | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState<Date | null>(null)
    const [dragRange, setDragRange] = useState<{ start: Date | null; end: Date | null }>({start: null, end: null})
    const isMobile = useMobile()

    const nextMonth = () => {
        if (view === "month") {
            setCurrentDate(addMonths(currentDate, 1))
        } else if (view === "week") {
            setCurrentDate(addDays(currentDate, 7))
        } else {
            setCurrentDate(addDays(currentDate, 1))
        }
    }

    const prevMonth = () => {
        if (view === "month") {
            setCurrentDate(subMonths(currentDate, 1))
        } else if (view === "week") {
            setCurrentDate(addDays(currentDate, -7))
        } else {
            setCurrentDate(addDays(currentDate, -1))
        }
    }

    const onDateClick = (day: Date) => {
        setSelectedDate(day)
        if (view === "month") {
            setView("day")
        }
    }

    const handleCellMouseDown = (date: Date) => {
        setIsDragging(true)
        setDragStart(date)
        setDragRange({start: date, end: date})
    }

    const handleCellMouseUp = (date: Date) => {
        if (isDragging && dragStart) {
            setIsDragging(false)

            // Ensure start is before end
            const start = dragStart < date ? dragStart : date
            const end = dragStart < date ? date : dragStart

            setNewEventStart(start)
            setNewEventEnd(end)
            setDragRange({start: null, end: null})
            setIsModalOpen(true)
        }
    }

    const handleCellMouseMove = (date: Date) => {
        if (isDragging && dragStart) {
            setDragRange({
                start: dragStart < date ? dragStart : date,
                end: dragStart < date ? date : dragStart,
            })
        }
    }

    const handleCellClick = (date: Date) => {
        if (!isDragging) {
            const start = date
            const end = addHours(date, 1)
            setNewEventStart(start)
            setNewEventEnd(end)
            setIsModalOpen(true)
        }
    }

    const createEvent = (title: string, room: string) => {
        if (newEventStart && newEventEnd) {
            const newEvent: Event = {
                id: Date.now().toString(),
                title,
                room,
                start: newEventStart,
                end: newEventEnd,
            }
            setEvents([...events, newEvent])
            setIsModalOpen(false)
            setNewEventStart(null)
            setNewEventEnd(null)
        }
    }

    const renderHeader = () => {
        let dateFormat = "MMMM yyyy"
        if (view === "week") dateFormat = "'Week of' MMM d, yyyy"
        if (view === "day") dateFormat = "EEEE, MMMM d, yyyy"

        return (
            <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-1 w-1"/>
                </Button>
                <h2 className="text-xl font-semibold">{format(currentDate, dateFormat)}</h2>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-1 w-1"/>
                </Button>
            </div>
        )
    }

    const renderDays = () => {
        const dateFormat = "EEE"
        const days = []
        const startDate = startOfWeek(currentDate)

        for (let i = 0; i < 7; i++) {
            days.push(
                <div className="text-center py-2 font-medium" key={i}>
                    {format(addDays(startDate, i), dateFormat)}
                </div>,
            )
        }
        return <div className="grid grid-cols-7">{days}</div>
    }

    const isInDragRange = (date: Date) => {
        if (!dragRange.start || !dragRange.end) return false
        return date >= dragRange.start && date <= dragRange.end
    }

    const renderCells = () => {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(monthStart)
        const startDate = startOfWeek(monthStart)
        const endDate = endOfWeek(monthEnd)

        const rows = []
        let days = []
        let day = startDate
        let formattedDate = ""

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d")
                const cloneDay = day

                // Find events for this day
                const dayEvents = events.filter(
                    (event) => isSameDay(event.start, day) || isSameDay(event.end, day) || (event.start < day && event.end > day),
                )

                days.push(
                    <div
                        className={cn(
                            "min-h-[100px] border border-border p-1 relative",
                            !isSameMonth(day, monthStart) && "text-muted-foreground bg-muted/30",
                            isSameDay(day, selectedDate) && "bg-accent/50",
                            isInDragRange(cloneDay) && "bg-primary/20",
                        )}
                        key={day.toString()}
                        onClick={() => onDateClick(cloneDay)}
                        onMouseDown={() => handleCellMouseDown(cloneDay)}
                        onMouseMove={() => handleCellMouseMove(cloneDay)}
                        onMouseUp={() => handleCellMouseUp(cloneDay)}
                    >
                        <div className="text-right">{formattedDate}</div>
                        <div className="mt-1 max-h-[80px] overflow-y-auto">
                            {dayEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="text-xs mb-1 p-1 rounded bg-primary text-primary-foreground truncate"
                                    title={`${event.title} (${format(event.start, "h:mm a")} - ${format(event.end, "h:mm a")})`}
                                >
                                    {event.title}
                                </div>
                            ))}
                        </div>
                    </div>,
                )
                day = addDays(day, 1)
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>,
            )
            days = []
        }
        return <div className="mb-4">{rows}</div>
    }

    return (
        <div className="flex flex-col gap-4">
            <Card className="p-4 flex-1 border-border bg-card text-card-foreground">
                <div className="flex justify-between items-center mb-4">
                    {renderHeader()}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-1"/> Add Event
                        </Button>
                        <Tabs value={view} onValueChange={(v) => setView(v as "month" | "week" | "day")}>
                            <TabsList className="bg-base-100">
                                <TabsTrigger className="hover:bg-base-300 focus:bg-base-300"
                                             value="month">Month</TabsTrigger>
                                <TabsTrigger className="hover:bg-base-300 focus:bg-base-300"
                                             value="week">Week</TabsTrigger>
                                <TabsTrigger className="hover:bg-base-300 focus:bg-base-300"
                                             value="day">Day</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {view === "month" && (
                    <>
                        {renderDays()}
                        {renderCells()}
                    </>
                )}

                {view === "week" && (
                    <WeekView
                        currentDate={currentDate}
                        events={events}
                        onCellClick={handleCellClick}
                        onCellMouseDown={handleCellMouseDown}
                        onCellMouseMove={handleCellMouseMove}
                        onCellMouseUp={handleCellMouseUp}
                        isInDragRange={isInDragRange}
                    />
                )}

                {view === "day" && (
                    <DayView
                        selectedDate={view === "day" ? currentDate : selectedDate}
                        events={events}
                        onCellClick={handleCellClick}
                        onCellMouseDown={handleCellMouseDown}
                        onCellMouseMove={handleCellMouseMove}
                        onCellMouseUp={handleCellMouseUp}
                        isInDragRange={isInDragRange}
                    />
                )}
            </Card>

            <Card className="p-4 w-full border-border bg-card text-card-foreground">
                <h3 className="text-lg font-semibold mb-4">Events</h3>
                <EventList events={events}/>
            </Card>

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={createEvent}
                startTime={newEventStart}
                endTime={newEventEnd}
            />
        </div>
    )
}