import { Component } from '@angular/core';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {}

// what is the start of the orbit? -> surface area A = 0
// (date - launch) % period
// n (mean motion) = 2pi / period
// mean anomaly (M) = n * (date - launch) ( % 360 )
// true anomaly (v) = 2 * atan(sqrt((1 + e) / (1 - e)) * tan(mean anomaly / 2))
// radius vector (r) = a * (1 - e^2) / (1 + e * cos(true anamoly))
// x = a * (cos(n * t) - e)
// y = a * (sqrt(1 - e^2) * sin(n * t))
// semi minor axis = a * sqrt(1 - e^2)
// eccentric anamoly = 2 * atan(sqrt((1 - e) / (1 + e)) * tan(mean anomaly / 2))

// r = a * (1 - e^2) / (1 + e * cos(v))
// v = sqrt(GM * (2 / r - 1 / a))
// phi = arctan(e * sin(v) / (1 + e * cos(v)))

// mean anomoly M = n * (t - t0) where n = 2pi / period (number of orbits per unit time) and t0 = time of perigee
// eccentric anomoly E = M + e * sin(M) where e = eccentricity
// true anomoly v = 2 * atan(sqrt((1 + e) / (1 - e)) * tan(E / 2))
// or v = 2 * atan2(sqrt(1 + e) * sin(E / 2), sqrt(1 - e) * cos(E / 2))
// argument of latitude u = v + w where w = argument of perigee
// right ascension alpha = atan2(sin(omega) * sin(u), cos(u)) where omega = longitude of ascending node
// declination delta = asin(sin(u) * cos(omega))
