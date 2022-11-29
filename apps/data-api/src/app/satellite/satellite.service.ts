import { Injectable, Logger } from '@nestjs/common';
import { CreateSatelliteDto } from './dto/create-satellite.dto';
import { UpdateSatelliteDto } from './dto/update-satellite.dto';
import { Satellite } from 'shared/domain';

let satellites: Satellite[] = [
  {
    id: 1,
    name: 'International Space Station',
    purpose: 'Research',
    mass: 100,
    radiusOfBase: 100,
    radiusOfParts: 100,
    colorOfBase: '#000000',
    createdBy: 1,
    createdAt: new Date(2022, 11, 19),
    lastUpdated: new Date(2022, 11, 19),
  },
  {
    id: 2,
    name: 'Spaceduck',
    purpose: 'Recreation',
    mass: 200,
    radiusOfBase: 200,
    radiusOfParts: 200,
    colorOfBase: '#ffffff',
    createdBy: 2,
    createdAt: new Date(2022, 11, 19),
    lastUpdated: new Date(2022, 11, 19),
  },
  {
    id: 3,
    name: 'Skyscraper',
    purpose: 'Recreation',
    mass: 200,
    radiusOfBase: 200,
    radiusOfParts: 200,
    colorOfBase: '#ffffff',
    createdBy: 1,
    createdAt: new Date(2022, 11, 19),
    lastUpdated: new Date(2022, 11, 19),
  },
  {
    id: 4,
    name: 'stardrop',
    purpose: 'TBD',
    mass: 200,
    radiusOfBase: 200,
    radiusOfParts: 200,
    colorOfBase: '#0000cc',
    createdBy: 4,
    createdAt: new Date(2022, 11, 19),
    lastUpdated: new Date(2022, 11, 19),
  },
  {
    id: 5,
    name: 'cloud',
    purpose: 'TBD',
    mass: 200,
    radiusOfBase: 200,
    radiusOfParts: 200,
    colorOfBase: '#0000cc',
    createdBy: 4,
    createdAt: new Date(2022, 11, 19),
    lastUpdated: new Date(2022, 11, 19),
  },
  {
    id: 6,
    name: 'sunset',
    purpose: 'TBD',
    mass: 200,
    radiusOfBase: 200,
    radiusOfParts: 200,
    colorOfBase: '#d84390',
    createdBy: 1,
    createdAt: new Date(2022, 11, 19),
    lastUpdated: new Date(2022, 11, 19),
  },
  {
    id: 7,
    name: 'sunset',
    purpose: 'TBD',
    mass: 200,
    radiusOfBase: 200,
    radiusOfParts: 200,
    colorOfBase: '#130449',
    createdBy: 1,
    createdAt: new Date(2022, 11, 19),
    lastUpdated: new Date(2022, 11, 25),
  },
  {
    id: 8,
    name: 'shuttle',
    purpose: 'TBD',
    mass: 200,
    radiusOfBase: 200,
    radiusOfParts: 200,
    colorOfBase: '#a198a5',
    createdBy: 1,
    createdAt: new Date(2022, 11, 19),
    lastUpdated: new Date(2022, 11, 25),
  },
  {
    id: 9,
    name: 'big bird',
    purpose: 'flying',
    mass: 10000,
    radiusOfBase: 10000,
    radiusOfParts: 3000,
    colorOfBase: '#e1f92c',
    createdBy: 1,
    createdAt: new Date(2022, 11, 27),
    lastUpdated: new Date(2022, 11, 27),
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
