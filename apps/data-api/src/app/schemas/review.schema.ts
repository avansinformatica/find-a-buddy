import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema()
export class Review {
  @Prop({required: false})
  text: string;

  @Prop({
    required: true, 
    validate: {
      validator: (v: number) => Number.isInteger(v) && 1 <= v && v <= 5,
      message: 'rating should be 1, 2, 3, 4 or 5',
    }
  })
  rating: number;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
