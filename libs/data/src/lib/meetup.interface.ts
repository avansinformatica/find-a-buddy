import { Id } from "./id.type";

export interface MeetUp {
    id: Id;
    datetime: Date;
    coachId: Id;
    pupilId: Id;
}