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
