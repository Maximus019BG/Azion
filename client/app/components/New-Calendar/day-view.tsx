"use client"

import {addHours, areIntervalsOverlapping, format, isSameHour, isWithinInterval, startOfDay} from "date-fns"
import type {Event} from "./calendar"
import {cn} from "@/lib/utils/cn"

interface DayViewProps {
    selectedDate: Date
    events: Event[]
    onCellClick: (date: Date) => void
    onCellMouseDown: (date: Date) => void
    onCellMouseMove: (date: Date) => void
    onCellMouseUp: (date: Date) => void
    isInDragRange: (date: Date) => boolean
}

export default function DayView({
                                    selectedDate,
                                    events,
                                    onCellClick,
                                    onCellMouseDown,
                                    onCellMouseMove,
                                    onCellMouseUp,
                                    isInDragRange,
                                }: DayViewProps) {
    const hours = Array.from({length: 24}, (_, i) => i)
    const dayStart = startOfDay(selectedDate)

    // Get events for this day
    const dayEvents = events.filter(
        (event) =>
            isWithinInterval(event.start, {start: dayStart, end: addHours(dayStart, 24)}) ||
            isWithinInterval(event.end, {start: dayStart, end: addHours(dayStart, 24)}) ||
            areIntervalsOverlapping({start: event.start, end: event.end}, {
                start: dayStart,
                end: addHours(dayStart, 24)
            }),
    )

    const getEventPosition = (event: Event, hour: number) => {
        const hourDate = addHours(dayStart, hour)
        const nextHour = addHours(hourDate, 1)

        // Check if event overlaps with this hour
        if ((event.start < nextHour && event.end > hourDate) || isSameHour(event.start, hourDate)) {
            return true
        }

        return false
    }

    return (
        <div className="border border-border rounded-md">
            <div className="grid grid-cols-[80px_1fr]">
                {hours.map((hour) => {
                    const hourDate = addHours(dayStart, hour)
                    const hourEvents = dayEvents.filter((event) => getEventPosition(event, hour))

                    return (
                        <div key={hour} className="grid grid-cols-[80px_1fr] border-b border-border last:border-b-0">
                            <div
                                className="p-2 text-sm text-muted-foreground border-r border-border">{format(hourDate, "h a")}</div>
                            <div
                                className={cn(
                                    "p-2 min-h-[60px] relative",
                                    "hover:bg-accent/50 cursor-pointer",
                                    isInDragRange(hourDate) && "bg-primary/20",
                                )}
                                onClick={() => onCellClick(hourDate)}
                                onMouseDown={() => onCellMouseDown(hourDate)}
                                onMouseMove={() => onCellMouseMove(hourDate)}
                                onMouseUp={() => onCellMouseUp(hourDate)}
                            >
                                {hourEvents.map((event) => (
                                    <div
                                        key={`${event.id}-${hour}`}
                                        className="text-xs p-1 mb-1 rounded bg-primary text-primary-foreground"
                                        title={`${event.title} (${format(event.start, "h:mm a")} - ${format(event.end, "h:mm a")})`}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

