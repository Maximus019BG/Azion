"use client"
import Link from "next/link"
import {useEffect, useState} from "react"
import {
    Building,
    ChevronDown,
    ClipboardList,
    Cog,
    CreditCard,
    Home,
    LogOutIcon,
    MessageSquare,
    PlusCircle,
    Settings,
    UserCircle,
    Users,
    Video,
} from "lucide-react"

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import LogOut from "@/app/components/LogOut";

// Mock functions to simulate your actual data fetching
const getOrgName = async () => {
    // This would be replaced with your actual API call
    return "Acme Corp"
}

const UserData = async () => {
    // This would be replaced with your actual API call
    return {
        name: "John Doe",
        email: "john@example.com",
        access: "roles:read employees:read settings:write tasks:write tasks:read cameras:read",
    }
}

export function AppSidebar() {
    const [org, setOrg] = useState<string | null>("")
    const [access, setAccess] = useState<string>("")
    const [userData, setUserData] = useState<{ name: string; email: string }>({
        name: "",
        email: "",
    })

    useEffect(() => {
        const fetchOrgName = async () => {
            const result = await getOrgName()
            setOrg(result)
        }

        const fetchUserData = async () => {
            const data = await UserData()
            setAccess(data.access)
            setUserData({
                name: data.name,
                email: data.email,
            })
        }

        fetchOrgName()
        fetchUserData()
    }, [])

    return (
        <Sidebar className="border-r border-sidebar-border">
            <SidebarHeader className="h-16 border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
                        <Building className="h-5 w-5"/>
                    </div>
                    <div className="font-semibold">{org || "Dashboard"}</div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {org && (
                        <>
                            <SidebarMenuItem>
                                <Collapsible className="w-full">
                                    <CollapsibleTrigger className="w-full">
                                        <SidebarMenuButton className="w-full justify-between hover:bg-base-100">
                                            <div className="flex items-center">
                                                <ClipboardList className="mr-2 h-4 w-4"/>
                                                <span>Dashboard</span>
                                            </div>
                                            <ChevronDown
                                                className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180"/>
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent
                                        className="animate-accordion-down space-y-1 overflow-hidden pl-6 pr-2 transition-all">
                                        <SidebarMenuButton asChild size="sm">
                                            <Link href="/dashboard">
                                                <Home className="mr-2 h-4 w-4 text-slate-200"/>
                                                <span className={"text-slate-200"}>Home</span>
                                            </Link>
                                        </SidebarMenuButton>

                                        {access.includes("roles:read") && (
                                            <SidebarMenuButton asChild size="sm">
                                                <Link href="/dashboard/settings/roles">
                                                    <UserCircle className="mr-2 h-4 w-4"/>
                                                    <span>Roles</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        )}

                                        {access.includes("employees:read") && (
                                            <SidebarMenuButton asChild size="sm">
                                                <Link href="/dashboard/settings/employees">
                                                    <Users className="mr-2 h-4 w-4"/>
                                                    <span>Employees</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        )}

                                        {access.includes("settings:write") && (
                                            <SidebarMenuButton asChild size="sm">
                                                <Link href="/dashboard/settings">
                                                    <Cog className="mr-2 h-4 w-4"/>
                                                    <span>Settings</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        )}
                                    </CollapsibleContent>
                                </Collapsible>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                {access.includes("tasks:write") ? (
                                    <Collapsible className="w-full">
                                        <CollapsibleTrigger className="w-full">
                                            <SidebarMenuButton className="w-full justify-between hover:bg-base-100">
                                                <div className="flex items-center">
                                                    <Settings className="mr-2 h-4 w-4 text-slate-200"/>
                                                    <span className={"text-slate-200"}>Tasks</span>
                                                </div>
                                                <ChevronDown
                                                    className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180"/>
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent
                                            className="animate-accordion-down space-y-1 overflow-hidden pl-6 pr-2 transition-all">
                                            {access.includes("tasks:read") && (
                                                <SidebarMenuButton asChild size="sm">
                                                    <Link href="/dashboard/task">
                                                        <Settings className="mr-2 h-4 w-4"/>
                                                        <span>Your Tasks</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            )}

                                            {access.includes("tasks:write") && (
                                                <SidebarMenuButton asChild size="sm">
                                                    <Link href="/dashboard/task/create">
                                                        <PlusCircle className="mr-2 h-4 w-4"/>
                                                        <span>Create Task</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            )}
                                        </CollapsibleContent>
                                    </Collapsible>
                                ) : (
                                    <SidebarMenuButton asChild>
                                        <Link href="/dashboard/task">
                                            <Settings className="mr-2 h-4 w-4"/>
                                            <span>Your Tasks</span>
                                        </Link>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>
                        </>
                    )}

                    {(access.includes("cameras:read") || access.includes("cameras:write")) && org && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild className={"hover:bg-base-100"}>
                                <Link href="/cam/list">
                                    <Video className="mr-2 h-4 w-4 text-slate-200"/>
                                    <span className={"text-slate-200"}>Azion Cameras</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}

                    {org && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild className={"hover:bg-base-100"}>
                                <Link href="/chat">
                                    <MessageSquare className="mr-2 h-4 w-4 text-slate-200"/>
                                    <span className={"text-slate-200"}>Chat</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}

                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className={"hover:bg-base-100"}>
                            <Link href="/organizations">
                                <Building className="mr-2 h-4 w-4 text-slate-200"/>
                                <span className={"text-slate-200"}>Organizations</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="mt-auto border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="h-auto py-2">
                                    <Avatar className="mr-2 h-8 w-8">
                                        <AvatarImage src="/placeholder.svg?height=32&width=32"/>
                                        <AvatarFallback className="bg-blue-600 text-white">
                                            {userData.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start text-sm">
                                        <span className="font-medium">{userData.name}</span>
                                        <span className="text-xs text-muted-foreground">{userData.email}</span>
                                    </div>
                                    <ChevronDown className="ml-auto h-4 w-4 opacity-50"/>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-56 mb-6">
                                <DropdownMenuItem asChild>
                                    <Link href="/account" className="flex cursor-pointer items-center">
                                        <UserCircle className="mr-2 h-4 w-4"/>
                                        <span>Account</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/billing" className="flex cursor-pointer items-center">
                                        <CreditCard className="mr-2 h-4 w-4"/>
                                        <span>Billing</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator/>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className="cursor-pointer text-destructive focus:text-destructive"
                                        >
                                            <LogOutIcon className="mr-2 h-4 w-4"/>
                                            <span>Log Out</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                You will need to log in again to access your account.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction className="bg-blue-600 hover:bg-blue-700">
                                                <LogOut/>
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
