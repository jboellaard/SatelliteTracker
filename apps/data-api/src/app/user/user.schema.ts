import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Satellite } from '../satellite/satellite.schema';

// export type UserDocument = User & Document;
export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
export class PointCoordinates {
    @Prop({
        required: true,
        default: 'Point',
    })
    type!: string;

    @Prop({
        _id: false,
        required: true,
        type: { longitude: Number, latitude: Number },
    })
    coordinates?: { longitude: number; latitude: number };
}

// export const LocationSchema = SchemaFactory.createForClass(LocationCoordinates);

@Schema({ timestamps: true })
export class User {
    @Prop({
        required: true,
        unique: true,
        minlength: 3,
        index: true,
    })
    username!: string;

    @Prop()
    profileDescription?: string;

    @Prop({
        type: PointCoordinates,
    })
    location?: PointCoordinates;

    @Prop({
        default: [],
        type: [MongooseSchema.Types.ObjectId],
        ref: 'Satellites',
    })
    satellites?: Satellite[];

    createdAt!: Date;
    updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
