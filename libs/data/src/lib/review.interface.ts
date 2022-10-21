import { Id } from "./id.type";

export interface Review {
    id: Id;
    rating: number;
    text: string;
    reviewerId: Id;
    revieweeId: Id;
}