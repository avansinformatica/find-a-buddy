import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { Meetup } from '../meetup/meetup.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({default: uuid, index: true})
  id: string;

  @Prop({
    required: true,
    unique: true,
  })
  name: string;

  // we don't use hooks to ensure the topics exist, as nestjs does not play nice
  // https://github.com/nestjs/mongoose/issues/7
  @Prop({default: []})
  tutorTopics: string[];

  @Prop({default: []})
  pupilTopics: string[];

  @Prop({
    default: [],
    type: [MongooseSchema.Types.ObjectId],
    // cannot use Meetup.name here, as it leads to a circular dependency
    ref: 'Meetup',
  })
  meetups: Meetup[];
}

export const UserSchema = SchemaFactory.createForClass(User);
