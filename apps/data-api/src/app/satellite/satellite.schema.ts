import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SatellitePartDocument = SatellitePart & Document;
export type CustomSatellitePartDocument = CustomSatellitePart & Document;
export type OrbitDocument = Orbit & Document;
// export type LaunchDocument = Launch & Document;
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

    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'SatelliteParts' })
    dependsOn?: SatellitePart[];
}

export const SatellitePartSchema = SchemaFactory.createForClass(SatellitePart);

@Schema({ _id: false })
export class CustomSatellitePart {
    //extends SatellitePart
    @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'SatelliteParts' })
    satellitePart!: SatellitePart;

    // @Prop({unique: false })
    // override partName?: string;

    @Prop()
    size?: number;

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

    @Prop({ required: false })
    dateTimeOfLaunch?: Date;

    createdAt?: Date;
    updatedAt?: Date;
}

export const OrbitSchema = SchemaFactory.createForClass(Orbit);
OrbitSchema.virtual('period').get(function () {
    return 2 * Math.PI * Math.sqrt(Math.pow(this.semiMajorAxis, 3) / 398600.4418);
});

/**
@Schema({ _id: false, timestamps: true })
export class Launch {
    @Prop()
    launchDate!: Date;

    @Prop()
    launchSite?: PointCoordinates;

    @Prop()
    succeeded?: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

export const LaunchSchema = SchemaFactory.createForClass(Launch);
LaunchSchema.path('succeeded').validate(function () {
    return this.launchDate >= new Date() ? true : false;
}, 'Succeeded cannot be set before launchDate');
 */

@Schema({ timestamps: true })
export class Satellite {
    @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
    createdById?: string;

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

    @Prop({ required: true, default: 'TBD' })
    purpose?: string;

    @Prop({ default: [], type: [CustomSatellitePartSchema] })
    satelliteParts?: CustomSatellitePart[];

    @Prop({ required: false, type: OrbitSchema })
    orbit?: Orbit;

    // Launch is temporarily disabled and replaced by a launchDate in Orbit
    // @Prop({ required: false, type: LaunchSchema })
    // launch?: Launch;

    createdAt?: Date;
    updatedAt?: Date;
}

export const SatelliteSchema = SchemaFactory.createForClass(Satellite);
SatelliteSchema.index({ createdById: 1, satelliteName: 1 }, { unique: true });

// SatelliteSchema.pre('validate', function (next) {
//     if (this.launch && !this.orbit) {
//         next(new Error('Cannot create launch if there is no orbit'));
//     } else {
//         next();
//     }
// });

SatelliteSchema.pre('validate', function (next) {
    if (this.satelliteParts && this.satelliteParts.length > 50) {
        next(new Error('Max number of satelliteparts is 50'));
    } else {
        next();
    }
});

SatelliteSchema.pre('validate', function (next) {
    if (this.satelliteParts && this.satelliteParts.length > 0) {
        for (const part of this.satelliteParts) {
            if (part.satellitePart.dependsOn) {
                if (
                    part.satellitePart.dependsOn.some((d) =>
                        this.satelliteParts
                            ?.map(function (p) {
                                return p.satellitePart;
                            })
                            .includes(d)
                    )
                ) {
                    next(
                        new Error(
                            `SatellitePart ${part.satellitePart.partName} depends on ${part.satellitePart.dependsOn}, please add it to the satelliteParts`
                        )
                    );
                }
            }
        }
    }
    next();
});

SatelliteSchema.post('save', async function (doc) {
    const User = this.$model('User');
    await User.updateOne({ _id: doc.createdById }, { $push: { satellites: doc._id } });
});
