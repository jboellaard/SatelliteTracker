import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateSatelliteDto } from './dto/create-satellite.dto';
import { UpdateSatelliteDto } from './dto/update-satellite.dto';
import { Id } from 'shared/domain';
import { Satellite } from './satellite.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/user.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class SatelliteService {
    private logger = new Logger(SatelliteService.name);

    constructor(
        @InjectModel(User.name, 'satellitetrackerdb') private userModel: Model<UserDocument>,
        @InjectModel(Satellite.name, 'satellitetrackerdb') private satelliteModel: Model<Satellite>,
        @InjectConnection('satellitetrackerdb') private connection: mongoose.Connection
    ) {}

    // create(newSatellite: CreateSatelliteDto) {
    //     const satellite = {
    //         id: satellites[satellites.length - 1].id! + 1,
    //         ...newSatellite,
    //         createdAt: new Date(),
    //         lastUpdated: new Date(),
    //     };
    //     satellites.push(satellite);
    //     return { results: satellite };
    // }

    // findAll() {
    //     return { results: satellites };
    // }

    // findOne(id: Id) {
    //     return { results: satellites.find((satellite) => satellite.id === id) };
    // }

    // getSatellitesOfUserWithId(id: Id) {
    //     return { results: satellites.filter((satellite) => satellite.createdBy === id) };
    // }

    // update(id: Id, updateSatelliteDto: UpdateSatelliteDto) {
    //     const satellite = satellites.find((satellite) => satellite.id === id);
    //     if (satellite) {
    //         const updatedSatellite = { ...satellite, ...updateSatelliteDto };
    //         satellites = satellites.map((satellite) => (satellite.id === id ? updatedSatellite : satellite));
    //         return { results: updatedSatellite };
    //     }
    //     return { results: null };
    // }

    // remove(id: Id) {
    //     const satellite = satellites.find((satellite) => satellite.id === id);
    //     satellites = satellites.filter((satellite) => satellite.id !== id);
    //     return { results: satellites };
    // }
}
