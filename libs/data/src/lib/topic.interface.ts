import { Id } from "./id.type";
import { Role } from "./roles";

export interface Topic {
    id: Id;
    
    title: string;
}

export interface TopicUpdate {
    title: string;

    role: Role;
}
