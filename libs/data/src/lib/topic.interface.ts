import { Id } from "./id.type";
import { Role } from "./role.type";

export interface Topic {
    id: Id;
    
    title: string;
}

export interface TopicUpdate {
    title: string;

    role: Role;
}
