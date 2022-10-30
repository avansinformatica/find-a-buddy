import { Id } from "./id.type";

export interface Review {
    rating: number;
    text?: string;
}

export interface ReviewCreation {
    rating: number;
    text?: string;
}
