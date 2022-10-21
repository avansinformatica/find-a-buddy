import { Id } from "./id.type";

export interface MeetUp {
    id: Id;

    datetime: Date;

    topicId: Id;
    pupilId: Id;
    tutorId: Id;
    tutorAccepted: boolean;

    reviewId?: string;
}