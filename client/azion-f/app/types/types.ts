// types.ts
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