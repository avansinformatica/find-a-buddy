import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { Review, ReviewSchema } from './review.schema';
import { User } from './user.schema';

export type MeetupDocument = Meetup & Document;

@Schema()
export class Meetup {
  // TODO: SAVE TOPIC IF IT DOESNT EXIST
  @Prop({required: true})
  topic: string;

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
  coach: User;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    // cannot use User.name here, as it leads to a circular dependency
    ref: 'User',
  })
  pupil: User;
}

export const MeetupSchema = SchemaFactory.createForClass(Meetup);
