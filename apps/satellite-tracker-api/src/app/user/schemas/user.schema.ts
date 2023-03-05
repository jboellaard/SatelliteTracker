import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import { Satellite, SatelliteSchema } from '../../satellite/schemas/satellite.schema';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class PointCoordinates {
    @Prop({
        required: true,
        default: 'Point',
    })
    type?: string;

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
        ref: 'Satellite',
    })
    satellites?: Satellite[];

    createdAt?: Date;
    updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre('findOneAndDelete', function (next) {
    const userId = this.getQuery()['_id'];
    if (userId) mongoose.model('Satellite', SatelliteSchema).deleteMany({ createdBy: userId }, next);
    next();
});
