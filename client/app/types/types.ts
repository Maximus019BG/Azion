export interface User {
    profilePicture: string;
    id: string | null;
    name: string;
    email: string;
    age: string;
    role: string;
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
    role: string;
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
    camName: string;
    roleLevel: number;
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
    role: Role,
    access: string,
    projects: string[],
    profilePicture: string | null,
    mfaEnabled: boolean,
    faceIdEnabled: boolean
}

export interface Role{
    id: string;
    name: string;
    roleAccess: string;
    color: string;
}