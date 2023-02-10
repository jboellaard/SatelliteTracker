import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { getPeriod, Shape } from 'shared/domain';

export type SatellitePartDocument = SatellitePart & Document;
export type CustomSatellitePartDocument = CustomSatellitePart & Document;
export type OrbitDocument = Orbit & Document;
export type SatelliteDocument = Satellite & Document;

@Schema()
export class SatellitePart {
    @Prop({ required: true, unique: true, minlength: 1 })
    partName!: string;

    @Prop()
    description?: string;

    @Prop()
    function?: string;

    @Prop()
    material?: string;

    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'SatellitePart' })
    dependsOn?: SatellitePart[];
}
export const SatellitePartSchema = SchemaFactory.createForClass(SatellitePart);

@Schema({ _id: false })
export class CustomSatellitePart {
    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'SatellitePart' })
    satellitePart!: SatellitePart;

    @Prop({ min: 0 })
    size?: number;

    @Prop()
    color?: string;

    @Prop({ min: 1, max: 100 })
    quantity?: number;
}
export const CustomSatellitePartSchema = SchemaFactory.createForClass(CustomSatellitePart);

@Schema({ _id: false, timestamps: true, toJSON: { virtuals: true } })
export class Orbit {
    @Prop({ required: true })
    semiMajorAxis!: number;

    @Prop({ required: true, default: 1, min: 0, max: 1 })
    eccentricity?: number;

    @Prop({ required: true, default: 0, min: 0, max: 180 })
    inclination?: number;

    @Prop({ required: false, default: 0, min: 0, max: 360 })
    longitudeOfAscendingNode?: number;

    @Prop({ required: true, default: 0, min: 0, max: 360 })
    argumentOfPerigee?: number; // argument of latitude if e==0 and true latitude if e==0 and i==0

    @Prop({ required: false })
    dateTimeOfLaunch?: Date;

    period?: number;

    createdAt?: Date;
    updatedAt?: Date;
}
export const OrbitSchema = SchemaFactory.createForClass(Orbit);
OrbitSchema.virtual('period').get(function () {
    return getPeriod(this.semiMajorAxis * 1000) / (24 * 60 * 60);
});

@Schema({ timestamps: true })
export class Satellite {
    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
    createdBy?: string;

    @Prop({
        required: true,
        minlength: 1,
    })
    satelliteName!: string;

    @Prop()
    description?: string;

    @Prop({ required: true })
    mass!: number;

    @Prop({ required: true })
    sizeOfBase!: number;

    @Prop({ required: true })
    colorOfBase!: string;

    @Prop({ required: true, default: Shape.Cube, enum: Object.values(Shape), type: String })
    shapeOfBase?: Shape;

    @Prop({ required: true, default: 'TBD' })
    purpose?: string;

    @Prop({ default: [], type: [CustomSatellitePartSchema] })
    satelliteParts?: CustomSatellitePart[];

    @Prop({ required: false, type: OrbitSchema })
    orbit?: Orbit;

    createdAt?: Date;
    updatedAt?: Date;
}
export const SatelliteSchema = SchemaFactory.createForClass(Satellite);
SatelliteSchema.index({ createdBy: 1, satelliteName: 1 }, { unique: true });

SatelliteSchema.pre('validate', function (next) {
    if (this.satelliteParts && this.satelliteParts.length > 50) {
        next(new Error('Max number of satelliteparts is 50'));
    } else {
        next();
    }
});

SatelliteSchema.pre('validate', async function (next) {
    if (this.satelliteParts && this.satelliteParts.length > 0) {
        for (const part of this.satelliteParts) {
            if (part.satellitePart.dependsOn && part.satellitePart.dependsOn.length > 0) {
                for (const sp of this.satelliteParts as any) {
                    if (
                        part.satellitePart.dependsOn
                            .map((p) => p?.toString())
                            .includes(sp.satellitePart._id?.toString())
                    ) {
                        next();
                    }
                }
                next(
                    new Error(
                        `SatellitePart ${part.satellitePart.partName} depends on ${part.satellitePart.dependsOn}, please add any to the satelliteParts`
                    )
                );
            }
        }
    }
    next();
});

SatelliteSchema.post('save', async function (doc) {
    const User = this.$model('User');
    await User.updateOne({ _id: doc.createdBy }, { $push: { satellites: doc._id } });
});
