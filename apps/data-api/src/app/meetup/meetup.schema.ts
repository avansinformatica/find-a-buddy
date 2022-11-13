import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { Review, ReviewSchema } from './review.schema';
import { User } from '../user/user.schema';
import { UserIdentity } from '@find-a-buddy/data';

export type MeetupDocument = Meetup & Document;

@Schema()
export class Meetup {
  @Prop({default: uuid})
  id: string;

  // we don't use hooks to ensure the topic exists, as nestjs does not play nice
  // https://github.com/nestjs/mongoose/issues/7
  @Prop({required: true})
  topic: string;

  @Prop({required: true})
  datetime: Date;

  @Prop({type: ReviewSchema})
  review: Review;

  @Prop({default: false})
  accepted: boolean;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    // cannot use User.name here, as it leads to a circular dependency
    ref: 'User',
  })
  tutorRef: User;

  @Prop({required: true, type: {id: String, name: String}})
  tutor: UserIdentity;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    // cannot use User.name here, as it leads to a circular dependency
    ref: 'User',
  })
  pupilRef: User;

  @Prop({required: true, type: {id: String, name: String}})
  pupil: UserIdentity;
}

export const MeetupSchema = SchemaFactory.createForClass(Meetup);
