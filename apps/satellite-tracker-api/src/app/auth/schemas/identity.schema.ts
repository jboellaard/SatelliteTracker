import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

export type IdentityDocument = Identity & Document;

@Schema()
export class Identity {
    _id?: string;

    @Prop({
        required: true,
        unique: true,
        minlength: 3,
    })
    username?: string;

    @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
    user?: User;

    @Prop({ required: true })
    hash?: string;

    @Prop({
        trim: true,
        index: {
            unique: true,
            partialFilterExpression: { emailAddress: { $type: 'string' } },
        },
    })
    emailAddress?: string;

    @Prop({
        required: true,
        default: ['user'],
    })
    roles?: string[];
}

export const IdentitySchema = SchemaFactory.createForClass(Identity);
