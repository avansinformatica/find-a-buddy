import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { Meetup } from './meetup.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({required: true})
  name: string;

  // SAVE TOPIC IF IT DOESNT EXIST
  @Prop({default: []})
  coachTopics: [string];

  // SAVE TOPIC IF IT DOESNT EXIST
  @Prop({default: []})
  pupilTopics: [string];

  @Prop({
    default: [],
    type: [MongooseSchema.Types.ObjectId],
    // ref: Meetup.name,
    ref: 'Meetup',
  })
  meetups: [Meetup];
}

export const UserSchema = SchemaFactory.createForClass(User);
