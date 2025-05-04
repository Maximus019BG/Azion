"use client"
import Link from "next/link"
import {useEffect, useState} from "react"
import {
    Building,
    Check,
    ChevronDown,
    ClipboardList,
    Cog,
    CreditCard,
    Home,
    LinkIcon,
    LogOutIcon,
    MessageSquare,
    Network,
    PlusCircle,
    Settings,
    UserCircle,
    Users,
    Video,
} from "lucide-react"
import {Skeleton} from "@/components/ui/skeleton"
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
import axios from "axios"
import Cookies from "js-cookie"
import {Organization, UserDataType} from "@/app/types/types";
import {PartOfOrg, UserData} from "@/app/func/funcs";
import {getOrgName} from "@/app/func/org";
import {apiUrl} from "@/app/api/config"
import {cn} from "@/lib/utils/cn"
import JoinOrganization from "@/components/JoinOrg";

export function AppSidebar() {
    const [org, setOrg] = useState<Organization | null>(null)
    const [access, setAccess] = useState<string | undefined>("")
    const [userData, setUserData] = useState<UserDataType | null>(null);
    const [loadingOrg, setLoadingOrg] = useState(true);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const fetchOrgName = async () => {
            const result = await PartOfOrg(true)
            setOrg(result)
            setLoadingOrg(false)
        }

        const fetchUserData = async () => {
            const data = await UserData()
            setUserData(data)
            setAccess(data.access)
            setLoadingUser(false)
        }

        fetchUserData().then(() => {
            setLoadingUser(false);
        })

        setLoadingUser(false);
        fetchOrgName().then(() => {
            setLoadingOrg(false);
        })
    }, [])

    return (
        <Sidebar className="border-r border-neutral-800">
            <SidebarHeader className="h-16 border-b border-neutral-900">
                <OrgSwitch/>
            </SidebarHeader>
            <SidebarContent className="p-2">
                <SidebarMenu>
                    {loadingOrg ? (
                        <Skeleton className="h-96 w-60 mb-2"/>
                    ) : (
                        org && (
                            <>
                                <SidebarMenuItem>
                                    <Collapsible className="w-full">
                                        <CollapsibleTrigger className="w-full">
                                            <SidebarMenuButton className="w-full justify-between hover:bg-neutral-800">
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
                                            <SidebarMenuButton className="hover:bg-neutral-900" asChild size="sm">
                                                <Link href="/dashboard">
                                                    <Home className="mr-2 h-4 w-4 text-slate-200"/>
                                                    <span className={"text-slate-200"}>Home</span>
                                                </Link>
                                            </SidebarMenuButton>

                                            {access?.includes("roles:read") && org.plan !== "FREE" && (
                                                <SidebarMenuButton className="hover:bg-neutral-900" asChild size="sm">
                                                    <Link href="/dashboard/settings/roles">
                                                        <UserCircle className="mr-2 h-4 w-4"/>
                                                        <span>Roles</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            )}

                                            {access?.includes("employees:read") && (
                                                <SidebarMenuButton className="hover:bg-neutral-900" asChild size="sm">
                                                    <Link href="/dashboard/settings/employees">
                                                        <Users className="mr-2 h-4 w-4"/>
                                                        <span>Employees</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            )}

                                            {access?.includes("settings:write") && (
                                                <SidebarMenuButton className="hover:bg-neutral-900" asChild size="sm">
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
                                    {access?.includes("tasks:write") ? (
                                        <Collapsible className="w-full">
                                            <CollapsibleTrigger className="w-full">
                                                <SidebarMenuButton
                                                    className="w-full justify-between hover:bg-neutral-800 ">
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
                                                {access?.includes("tasks:read") && (
                                                    <SidebarMenuButton className="hover:bg-neutral-900" asChild
                                                                       size="sm">
                                                        <Link href="/dashboard/task">
                                                            <Settings className="mr-2 h-4 w-4"/>
                                                            <span>Your Tasks</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                )}

                                                {access?.includes("tasks:write") && (
                                                    <SidebarMenuButton className="hover:bg-neutral-900" asChild
                                                                       size="sm">
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
                        )
                    )}

                    {(access?.includes("cameras:read") || access?.includes("cameras:write")) && org && org.plan !== "FREE" && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild className={"hover:bg-neutral-800"}>
                                <Link href="/cam/list">
                                    <Video className="mr-2 h-4 w-4 text-slate-200"/>
                                    <span className={"text-slate-200"}>Azion Cameras</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}

                    {access?.includes("networks") && org && org.plan === "PRO" && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild className={"hover:bg-neutral-800"}>
                                <Link href="/dashboard/network">
                                    <Network className="mr-2 h-4 w-4 text-slate-200"/>
                                    <span className={"text-slate-200"}>Network</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}

                    {org && org.plan !== "FREE" && (
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild className={"hover:bg-neutral-800"}>
                                <Link href="/chat">
                                    <MessageSquare className="mr-2 h-4 w-4 text-slate-200"/>
                                    <span className={"text-slate-200"}>Chat</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}

                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className={"hover:bg-neutral-800"}>
                            <Link href="/organizations">
                                <Building className="mr-2 h-4 w-4 text-slate-200"/>
                                <span className={"text-slate-200"}>Organizations</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="mt-auto border-t border-neutral-900">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="h-auto py-2">
                                    <Avatar className="mr-2 h-8 w-8">
                                        {loadingUser ? (
                                            <Skeleton className="h-8 w-8 rounded-full"/>
                                        ) : (
                                            <>
                                                <AvatarImage
                                                    src={"data:image/png;base64," + userData?.profilePicture || "/placeholder.svg?height=32&width=32"}/>
                                                <AvatarFallback className="bg-blue-600 text-white">
                                                    {userData && userData.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </>
                                        )}
                                    </Avatar>
                                    <div className="flex flex-col items-start text-sm">
                                                    <span className="font-medium">
                                                        {loadingUser ? <Skeleton
                                                            className="w-24 h-4"/> : (userData ? userData.name : "Guest")}
                                                    </span>
                                        <span className="text-xs text-muted-foreground">
                                                        {loadingUser ? <Skeleton
                                                            className="w-32 h-3"/> : (userData ? userData.email : "No email available")}
                                                    </span>
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
                                {userData?.role?.name === "owner" && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/billing" className="flex cursor-pointer items-center">
                                            <CreditCard className="mr-2 h-4 w-4"/>
                                            <span>Billing</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
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

function OrgSwitch() {
    const [orgs, setOrgs] = useState<Organization[]>([])
    const [org, setOrg] = useState<string | null>("")
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false)
    const [showJoinModal, setShowJoinModal] = useState(false)
    const [joinModalTab, setJoinModalTab] = useState<"join" | "create">("join")

    const handleOpenJoinModal = (tab: "join" | "create") => {
        setJoinModalTab(tab)
        setShowJoinModal(true)
        setOpen(false)
    }

    useEffect(() => {
        const fetchOrgName = async () => {
            const result = await getOrgName()
            setOrg(result)
            setLoading(false)
        }

        const fetchAllOrgs = async () => {
            axios.get(`${apiUrl}/org/get/all/orgs`, {
                headers: {
                    authorization: Cookies.get("azionAccessToken")
                }
            }).then((res) => {
                setOrgs(res.data)
            }).catch((err) => {
                console.log(err)
            })
        }

        fetchOrgName().then(() => {
            setLoading(false);
        })
        fetchAllOrgs().then(() => {
            setLoading(false);
        })

    }, [])

    const handleOrgClick = (orgID: string | undefined) => {
        axios.post(`${apiUrl}/org/set/org`, {
            orgId: orgID
        }, {
            headers: {
                authorization: Cookies.get("azionAccessToken")
            }
        }).then((res) => {
            setOrg(res.data.orgName)
            window.location.reload()
        }).catch((err) => {
            console.log(err)

        });
    };

    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <button
                        className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-600/10 border border-transparent hover:border-blue-600/20 group">
                        <div
                            className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]">
                            <Building className="h-5 w-5"/>
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="font-semibold text-sm">
                                {loading ? <Skeleton className="w-24 h-5"/> : !org ? "Personal" : org}
                            </div>
                            <div className="text-xs text-gray-400">
                                {loading ? <Skeleton className="w-16 h-3 mt-1"/> : "Switch organization"}
                            </div>
                        </div>
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 text-gray-400 transition-transform duration-200 ml-1",
                                open && "rotate-180 text-blue-500",
                            )}
                        />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-64 py-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-[0_0_25px_rgba(0,0,0,0.3)] backdrop-blur-sm"
                >
                    <div className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-neutral-800">
                        Your Organizations
                    </div>
                    {loading ? (
                        <div className="p-3 space-y-2">
                            <Skeleton className="h-8 w-full"/>
                            <Skeleton className="h-8 w-full"/>
                            <Skeleton className="h-8 w-full"/>
                        </div>
                    ) : (
                        <div className="max-h-[320px] overflow-y-auto py-1">
                            {orgs.map((organization) => (
                                <div
                                    key={organization.orgID}
                                    className={cn(
                                        "flex items-center justify-between cursor-pointer px-3 py-2 hover:bg-blue-600/10 transition-colors duration-150",
                                        organization.orgName === org && "bg-blue-600/5",
                                    )}
                                    onClick={() => {
                                        handleOrgClick(organization.orgID)
                                        setOpen(false)
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "flex h-7 w-7 items-center justify-center rounded-md",
                                                organization.orgName === org ? "bg-blue-600 text-white" : "bg-neutral-800 text-gray-400",
                                            )}
                                        >
                                            <Building className="h-4 w-4"/>
                                        </div>
                                        <span
                                            className={cn(
                                                "text-sm",
                                                organization.orgName === org ? "font-medium text-white" : "text-gray-300",
                                            )}
                                        >
                      {organization.orgName}
                    </span>
                                    </div>
                                    {organization.orgName === org && <Check className="h-4 w-4 text-blue-500"/>}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-1 pt-1 px-3 border-t border-neutral-800">
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <button
                                onClick={() => handleOpenJoinModal("join")}
                                className="flex items-center justify-center gap-1.5 text-sm text-blue-500 hover:text-blue-400 py-2 px-3 rounded hover:bg-blue-600/10 transition-colors duration-150"
                            >
                                <LinkIcon className="h-3.5 w-3.5"/>
                                Join Existing
                            </button>
                            <button
                                onClick={() => handleOpenJoinModal("create")}
                                className="flex items-center justify-center gap-1.5 text-sm text-blue-500 hover:text-blue-400 py-2 px-3 rounded hover:bg-blue-600/10 transition-colors duration-150"
                            >
                                <PlusCircle className="h-3.5 w-3.5"/>
                                Create New
                            </button>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {showJoinModal && <JoinOrganization onClose={() => setShowJoinModal(false)} initialTab={joinModalTab}/>}
        </>
    );
}