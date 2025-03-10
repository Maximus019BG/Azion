"use client"

import {useState} from "react"
import {differenceInMinutes, format} from "date-fns"
import type {Event} from "./calendar"
import {Card} from "@/components/ui/card"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {ScrollArea} from "@/components/ui/scroll-area"

interface EventListProps {
    events: Event[]
}

export default function EventList({events}: EventListProps) {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime())

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m` : ""}`
    }

    return (
        <>
            <ScrollArea className="h-[500px] pr-4">
                {sortedEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No events scheduled</p>
                ) : (
                    <div className="space-y-2">
                        {sortedEvents.map((event) => (
                            <Card
                                key={event.id}
                                className="p-3 cursor-pointer hover:bg-accent"
                                onClick={() => setSelectedEvent(event)}
                            >
                                <h4 className="font-medium truncate">{event.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {format(event.start, "MMM d, h:mm a")} - {format(event.end, "h:mm a")}
                                </p>
                                {event.room && <p className="text-xs text-muted-foreground mt-1">Room: {event.room}</p>}
                            </Card>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedEvent?.title}</DialogTitle>
                    </DialogHeader>
                    {selectedEvent && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-sm font-medium">Start Time</div>
                                <div
                                    className="col-span-2 text-sm">{format(selectedEvent.start, "MMMM d, yyyy h:mm a")}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-sm font-medium">End Time</div>
                                <div
                                    className="col-span-2 text-sm">{format(selectedEvent.end, "MMMM d, yyyy h:mm a")}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-sm font-medium">Duration</div>
                                <div className="col-span-2 text-sm">
                                    {formatDuration(differenceInMinutes(selectedEvent.end, selectedEvent.start))}
                                </div>
                            </div>
                            {selectedEvent.room && (
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-sm font-medium">Room</div>
                                    <div className="col-span-2 text-sm">{selectedEvent.room}</div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

