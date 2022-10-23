import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IdentityDocument = Identity & Document;

@Schema()
export class Identity {
    @Prop({required: true})
    username: string;

    @Prop({required: true})
    hash: string;
}

export const IdentitySchema = SchemaFactory.createForClass(Identity);