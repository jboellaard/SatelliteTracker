import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { PointCoordinates } from '../user/user.schema';

export type SatelliteDocument = Satellite & Document;

@Schema()
export class SatellitePart {
    @Prop()
    name?: string;

    @Prop()
    function?: string;

    @Prop()
    material?: string;
}

export const SatellitePartSchema = SchemaFactory.createForClass(SatellitePart);

@Schema({ _id: false })
export class CustomSatellitePart {
    @Prop({ required: true, type: SatellitePartSchema })
    satellitePart?: SatellitePart;

    @Prop()
    height?: number;

    @Prop()
    color?: string;

    @Prop()
    quantity?: number;
}

export const CustomSatellitePartSchema = SchemaFactory.createForClass(CustomSatellitePart);

@Schema({ _id: false, timestamps: true })
export class Orbit {
    @Prop({ required: true })
    semiMajorAxis!: number;

    @Prop({ required: true, default: 1, min: 0, max: 1 })
    eccentricity?: number;

    @Prop({ required: true, default: 0, min: 0, max: 180 })
    inclination?: number;

    @Prop({ required: true, default: 0, min: 0, max: 360 })
    longitudeOfAscendingNode?: number;

    @Prop({ required: true, default: 0, min: 0, max: 360 })
    argumentOfPerigee?: number;

    createdAt!: Date;
    updatedAt!: Date;
}

export const OrbitSchema = SchemaFactory.createForClass(Orbit);
OrbitSchema.virtual('period').get(function () {
    return 2 * Math.PI * Math.sqrt(Math.pow(this.semiMajorAxis, 3) / 398600.4418);
});

@Schema({ _id: false, timestamps: true })
export class Launch {
    @Prop()
    launchDate!: Date;

    @Prop()
    launchSite?: PointCoordinates;

    @Prop()
    succeeded?: boolean;

    createdAt!: Date;
    updatedAt!: Date;
}

export const LaunchSchema = SchemaFactory.createForClass(Launch);

@Schema({ timestamps: true })
export class Satellite {
    @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
    createdById!: string;

    @Prop({
        required: true,
        minlength: 1,
    })
    name!: string;

    @Prop({ required: true })
    mass!: number;

    @Prop({ required: true })
    sizeOfBase!: number;

    @Prop({ required: true })
    colorOfBase!: string;

    @Prop({ required: true, default: 'TBD' })
    purpose!: string;

    @Prop({ required: true, default: [], type: [CustomSatellitePartSchema] })
    satelliteParts?: CustomSatellitePart[];

    @Prop({ required: false, type: OrbitSchema })
    orbit?: Orbit;

    @Prop({ required: false, type: LaunchSchema })
    launch?: Launch;

    createdAt!: Date;
    updatedAt!: Date;
}

export const SatelliteSchema = SchemaFactory.createForClass(Satellite);
SatelliteSchema.index({ createdBy: 1, name: 1 }, { unique: true });
SatelliteSchema.pre('validate', function (next) {
    if (this.launch && !this.orbit) {
        next(new Error('Cannot create launch if there is no orbit'));
    } else {
        next();
    }
});
SatelliteSchema.pre('validate', function (next) {
    if (this.satelliteParts && this.satelliteParts.length > 50) {
        next(new Error('Max number of satelliteparts is 50'));
    } else {
        next();
    }
});
