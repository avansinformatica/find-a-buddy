import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid';

export type TopicDocument = Topic & Document;

@Schema()
export class Topic {
  @Prop({default: uuid, index: true})
  id: string;

  @Prop({required: true, unique: true})
  title: string;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
