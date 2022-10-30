import { Id } from "./id.type";
import { UserIdentity } from "./user.interface";

export interface Meetup {
    id: Id;

    datetime: Date;

    topic: string;
    pupil: UserIdentity;
    tutor: UserIdentity;
    accepted: boolean;

    reviewId?: string;
}

export interface MeetupCreation {
    topic: string;
    tutorId: Id;
    datetime: Date;
}
