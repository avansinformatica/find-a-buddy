import { Id } from "./id.type";
import { Review } from "./review.interface";
import { UserIdentity } from "./user.interface";

export interface Meetup {
    id: Id;

    datetime: Date;

    topic: string;
    pupil: UserIdentity;
    tutor: UserIdentity;
    accepted: boolean;

    review?: Review;
}

export interface MeetupCreation {
    topic: string;
    tutorId: Id;
    datetime: Date;
}
