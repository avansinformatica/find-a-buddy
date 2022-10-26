import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { Meetup } from './meetup.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({required: true})
  name: string;

  // we don't use hooks to ensure the topics exist, as nestjs does not play nice
  // https://github.com/nestjs/mongoose/issues/7
  @Prop({default: []})
  coachTopics: [string];

  @Prop({default: []})
  pupilTopics: [string];

  @Prop({
    default: [],
    type: [MongooseSchema.Types.ObjectId],
    // cannot use Meetup.name here, as it leads to a circular dependency
    ref: 'Meetup',
  })
  meetups: [Meetup];
}

export const UserSchema = SchemaFactory.createForClass(User);
