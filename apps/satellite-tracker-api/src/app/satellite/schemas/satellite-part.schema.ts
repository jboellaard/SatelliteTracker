import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SatellitePartDocument = SatellitePart & Document;
export type CustomSatellitePartDocument = CustomSatellitePart & Document;

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
