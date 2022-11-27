import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'apps/satellite-tracker/src/environments/environment';
import { map, Observable, tap } from 'rxjs';
import { EntityService } from 'ui/entity';
import { SatelliteImplemented } from './satellite.model';

let satellites: SatelliteImplemented[] = [
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

@Injectable({
  providedIn: 'root',
})
export class SatelliteService {
  constructor() {
    // super(http, environment.API_URL, 'satellites');
    console.log('SatelliteService created');
  }

  // getSatellitesOfUserWithId(id: string): Observable<Satellite[] | undefined> {
  //   console.log('getUserById');
  //   return this.http.get<APIResponse<Satellite[]>>(environment.API_URL + `users/${id}/satellites`).pipe(
  //     map((response: APIResponse<Satellite[]>) => response.results),
  //     tap((satellites: Satellite[]) => {
  //       return satellites;
  //     })
  //   );
  // }

  create(newSatellite: SatelliteImplemented) {
    const satellite = {
      ...newSatellite,
      id: satellites[satellites.length - 1].id! + 1,
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
    satellites = [...satellites, satellite];
    return satellite;
  }

  update(updatedSatellite: SatelliteImplemented) {
    updatedSatellite.lastUpdated = new Date();
    const index = satellites.findIndex((satellite) => satellite.id === updatedSatellite.id);
    satellites[index] = updatedSatellite;
    return updatedSatellite;
  }

  delete(id: number) {
    satellites = satellites.filter((satellite) => satellite.id !== id);
  }

  getAll(): SatelliteImplemented[] {
    return satellites;
  }

  getById(id: number): SatelliteImplemented | undefined {
    return satellites.find((satellite) => satellite.id === id);
  }

  getSatellitesOfUserWithId(id: number): SatelliteImplemented[] {
    return satellites.filter((satellite) => satellite.createdBy == id);
  }
}
