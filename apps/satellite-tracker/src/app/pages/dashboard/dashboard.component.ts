import { Component } from '@angular/core';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {}

// mean anomoly M = n * (t - t0) where n = 2pi / period (number of orbits per unit time) and t0 = time of perigee
// eccentric anomoly E = M + e * sin(M) where e = eccentricity
// true anomoly v = 2 * atan(sqrt((1 + e) / (1 - e)) * tan(E / 2))
// or v = 2 * atan2(sqrt(1 + e) * sin(E / 2), sqrt(1 - e) * cos(E / 2))
// argument of latitude u = v + w where w = argument of perigee
// right ascension alpha = atan2(sin(omega) * sin(u), cos(u)) where omega = longitude of ascending node
// declination delta = asin(sin(u) * cos(omega))
