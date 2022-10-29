import { Id } from "./id.type";

export interface Review {
    id: Id;
    
    rating: number;
    text?: string;
    
    pupil: Id;
    tutor: Id;

    datetime: Date;
}