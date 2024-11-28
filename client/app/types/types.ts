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

export interface Meeting {
    id: string;
    topic: string;
    description: string;
    day: string;
    start: string;
    end: string;
    link: string;
}

export interface EventData {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    link: string;
    roles: string[];
}

export interface Cam {
    camName: string;
    roleLevel: number;
    orgAddress: string;
}