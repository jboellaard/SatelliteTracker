import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Satellite } from 'shared/domain';
import isEmail from 'validator/lib/isEmail';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  id?: string;

  @Prop({
    required: true,
    unique: true,
  })
  name?: string;

  @Prop({
    required: true,
    default: [],
  })
  roles?: string[];

  @Prop({
    required: true,
  })
  emailAddress?: string;

  @Prop({
    default: [],
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Satellite',
  })
  satellites?: Satellite[];
}

export const UserSchema = SchemaFactory.createForClass(User);
