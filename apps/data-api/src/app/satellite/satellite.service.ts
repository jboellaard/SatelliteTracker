import { Injectable, Logger } from '@nestjs/common';
import { CreateSatelliteDto } from './dto/create-satellite.dto';
import { UpdateSatelliteDto } from './dto/update-satellite.dto';
import { Satellite } from 'shared/domain';

let satellites: Satellite[] = [
  {
    id: 1,
    name: 'ISS',
    mass: 100,
    radiusOfBase: 100,
    radiusOfParts: 100,
    createdBy: 1,
    createdAt: new Date(2022, 11, 19),
    lastUpdated: new Date(2022, 11, 19),
  },
  {
    id: 2,
    name: 'Spaceduck',
    mass: 200,
    radiusOfBase: 200,
    radiusOfParts: 200,
    createdBy: 2,
    createdAt: new Date(2022, 11, 19),
    lastUpdated: new Date(2022, 11, 19),
  },
  {
    id: 3,
    name: 'Skyscraper',
    mass: 200,
    radiusOfBase: 200,
    radiusOfParts: 200,
    createdBy: 1,
    createdAt: new Date(2022, 11, 19),
    lastUpdated: new Date(2022, 11, 19),
  },
  {
    id: 4,
    name: 'stardrop',
    mass: 200,
    radiusOfBase: 200,
    radiusOfParts: 200,
    createdBy: 4,
    createdAt: new Date(2022, 11, 19),
    lastUpdated: new Date(2022, 11, 19),
  },
  {
    id: 5,
    name: 'cloud',
    mass: 200,
    radiusOfBase: 200,
    radiusOfParts: 200,
    createdBy: 4,
    createdAt: new Date(2022, 11, 19),
    lastUpdated: new Date(2022, 11, 19),
  },
];

@Injectable()
export class SatelliteService {
  create(newSatellite: CreateSatelliteDto) {
    const satellite = {
      id: satellites[satellites.length - 1].id! + 1,
      ...newSatellite,
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
    satellites.push(satellite);
    return { results: satellite };
  }

  findAll() {
    return { results: satellites };
  }

  findOne(id: number) {
    return { results: satellites.find((satellite) => satellite.id === id) };
  }

  getSatellitesOfUserWithId(id: number) {
    return { results: satellites.filter((satellite) => satellite.createdBy === id) };
  }

  update(id: number, updateSatelliteDto: UpdateSatelliteDto) {
    const satellite = satellites.find((satellite) => satellite.id === id);
    if (satellite) {
      const updatedSatellite = { ...satellite, ...updateSatelliteDto };
      satellites = satellites.map((satellite) => (satellite.id === id ? updatedSatellite : satellite));
      return { results: updatedSatellite };
    }
    return { results: null };
  }

  remove(id: number) {
    const satellite = satellites.find((satellite) => satellite.id === id);
    satellites = satellites.filter((satellite) => satellite.id !== id);
    return { results: satellites };
  }
}
