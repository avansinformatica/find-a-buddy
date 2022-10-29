import { Id } from "./id.type";
import { Review } from "./review.interface";

export interface UserSummary {
    id: Id;
    name: string;

    rating: number;

    pupilTopics: string[];
    tutorTopics: string[];
}

export interface User extends UserSummary {
    reviews: Review[];
}