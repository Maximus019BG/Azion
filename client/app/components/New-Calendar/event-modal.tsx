"use client"

import {useEffect, useState} from "react"
import {format} from "date-fns"
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"

interface EventModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (title: string, room: string) => void
    startTime: Date | null
    endTime: Date | null
}

export default function EventModal({isOpen, onClose, onSave, startTime, endTime}: EventModalProps) {
    const [title, setTitle] = useState("")
    const [room, setRoom] = useState("")

    useEffect(() => {
        if (isOpen) {
            setTitle("")
            setRoom("")
        }
    }, [isOpen])

    const handleSave = () => {
        if (title.trim()) {
            onSave(title, room)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-base-300">
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {startTime && endTime && (
                        <div className="text-sm text-muted-foreground mb-2">
                            {format(startTime, "MMM d, yyyy h:mm a")} - {format(endTime, "h:mm a")}
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Event Name
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                            autoFocus
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="room" className="text-right">
                            Room
                        </Label>
                        <Input id="room" value={room} onChange={(e) => setRoom(e.target.value)} className="col-span-3"/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

