"use client"

import React from "react"

import {addDays, addHours, areIntervalsOverlapping, format, isSameDay, isWithinInterval, startOfWeek} from "date-fns"
import type {Event} from "@/app/components/New-Calendar/calendar"
import {cn} from "@/lib/utils/cn"

interface WeekViewProps {
    currentDate: Date
    events: Event[]
    onCellClick: (date: Date) => void
    onCellMouseDown: (date: Date) => void
    onCellMouseMove: (date: Date) => void
    onCellMouseUp: (date: Date) => void
    isInDragRange: (date: Date) => boolean
}

export default function WeekView({
                                     currentDate,
                                     events,
                                     onCellClick,
                                     onCellMouseDown,
                                     onCellMouseMove,
                                     onCellMouseUp,
                                     isInDragRange,
                                 }: WeekViewProps) {
    const weekStart = startOfWeek(currentDate)
    const days = Array.from({length: 7}, (_, i) => addDays(weekStart, i))
    const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17] // Business hours for brevity

    const getEventsForDayAndHour = (day: Date, hour: number) => {
        const hourDate = addHours(day, hour)
        const nextHour = addHours(hourDate, 1)

        return events.filter(
            (event) =>
                (isWithinInterval(hourDate, {start: event.start, end: event.end}) ||
                    isWithinInterval(nextHour, {start: event.start, end: event.end}) ||
                    areIntervalsOverlapping({start: event.start, end: event.end}, {start: hourDate, end: nextHour})) &&
                (isSameDay(event.start, day) ||
                    isSameDay(event.end, day) ||
                    (event.start < day && event.end > addHours(day, 23))),
        )
    }

    return (
        <div className="w-full border border-border rounded-md overflow-x-auto">
            <div className="grid grid-cols-[80px_repeat(7,1fr)] min-w-[800px]">
                {/* Header row with day names */}
                <div className="p-2 border-b border-r border-border font-medium"></div>
                {days.map((day, i) => (
                    <div key={i} className="p-2 text-center border-b border-border font-medium">
                        <div>{format(day, "EEE")}</div>
                        <div className="text-sm text-muted-foreground">{format(day, "MMM d")}</div>
                    </div>
                ))}

                {/* Hour rows */}
                {hours.map((hour) => (
                    <React.Fragment key={hour}>
                        <div className="p-2 text-sm text-muted-foreground border-r border-b border-border">
                            {format(addHours(weekStart, hour), "h a")}
                        </div>

                        {days.map((day, dayIndex) => {
                            const hourDate = addHours(day, hour)
                            const cellEvents = getEventsForDayAndHour(day, hour)

                            return (
                                <div
                                    key={dayIndex}
                                    className={cn(
                                        "p-1 min-h-[60px] border-b border-r border-border last:border-r-0",
                                        "hover:bg-accent/50 cursor-pointer",
                                        isInDragRange(hourDate) && "bg-primary/20",
                                    )}
                                    onClick={() => onCellClick(hourDate)}
                                    onMouseDown={() => onCellMouseDown(hourDate)}
                                    onMouseMove={() => onCellMouseMove(hourDate)}
                                    onMouseUp={() => onCellMouseUp(hourDate)}
                                >
                                    {cellEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="text-xs p-1 mb-1 rounded bg-primary text-primary-foreground truncate"
                                            title={`${event.title} (${format(event.start, "h:mm a")} - ${format(event.end, "h:mm a")})`}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

