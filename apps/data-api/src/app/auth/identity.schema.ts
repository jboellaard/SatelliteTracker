import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IdentityDocument = Identity & Document;

@Schema()
export class Identity {
    @Prop({
        required: true,
        unique: true,
        minlength: 3,
    })
    username?: string;

    @Prop({ required: true })
    hash!: string;

    @Prop({
        required: true,
        unique: true,
    })
    emailAddress?: string;

    @Prop({
        required: true,
        default: ['user'],
    })
    roles?: string[];
}

export const IdentitySchema = SchemaFactory.createForClass(Identity);
