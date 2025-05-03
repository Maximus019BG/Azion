export interface User {
    profilePicture: string;
    id: string | null;
    name: string;
    email: string;
    age: string;
    role: Role;
    orgid: string;
    projects: any;
}

//Task file type
export interface ProjFile {
    fileData?: string;
    fileName?: string;
    link?: string;
    date?: string;
    user: User;
    submittedDate: string;
    projectID: string;
    submitType: string;
    contentType: string;
}

export interface Task {
    id: string;
    name: string;
    description: string;
    status: string;
    date: string;
    createdBy?: User;
    files?: ProjFile[];
    link?: string | null;
    projectID?: string;
    submitType?: string;
    isCreator: boolean;
    orgId?: string;
    priority: string;
    progress: number;
    source: string;
    users?: User[];
    doneBy?: User[];
}

//JWTokens
export interface Token {
    refreshToken: string;
    accessToken: string;
}

export interface Employee {
    id: string;
    name: string;
    email: string;
    age: string;
    role: Role;
    orgid: string;
    roleLevel: number | undefined;
    profilePicture?: string;
    projects?: any;
}

//Meeting type
export interface Meeting {
    id: string;
    topic: string;
    description: string;
    day: string;
    start: string;
    end: string;
    link: string;
}

//Schedule type
export interface EventData {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    link: string;
    roles: string[];
}

//Camera type
export interface Cam {
    id: string;
    camName: string;
    role: Role;
    orgAddress: string;
}

//Type for invite people
export interface PeopleData {
    [email: string]: string;
}

//Types for userdata func
export interface UserDataType {
    name: string,
    email: string,
    age: string,
    orgid: string | null,
    role: Role | null,
    access?: string,
    projects: string[],
    profilePicture: string | null,
    mfaEnabled: boolean,
    faceIdEnabled: boolean
    userType: string | null,
}

export interface Role {
    id: string | null;
    name: string;
    roleAccess: string | null;
    color: string;
}

export interface Organization {
    orgID: string | undefined;
    orgName: string;
    orgDescription: string;
    orgAddress: string;
    orgEmail: string;
    orgPhone: string;
    orgType: string;
    plan?: "FREE" | "STANDARD" | "PRO" | "ENTERPRISE";
}

export interface Message {
    id?: string;
    content: string;
    from: string;
    to: string;
    edited?: boolean;
}