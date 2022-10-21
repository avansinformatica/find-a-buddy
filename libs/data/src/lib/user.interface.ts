import { Id } from "./id.type";

export interface User {
    id: Id;

    name: string;
    
    reviews: [Id];
}