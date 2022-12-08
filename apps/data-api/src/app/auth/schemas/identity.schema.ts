import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Mongoose, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/user.schema';

export type IdentityDocument = Identity & Document;

@Schema()
export class Identity {
    @Prop({
        required: true,
        unique: true,
        minlength: 3,
    })
    username?: string;

    @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
    user?: User;

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
