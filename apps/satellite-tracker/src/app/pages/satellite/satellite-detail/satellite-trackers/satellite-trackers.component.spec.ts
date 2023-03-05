import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SatelliteTrackersComponent } from './satellite-trackers.component';

describe('SatelliteTrackersComponent', () => {
    let component: SatelliteTrackersComponent;
    let fixture: ComponentFixture<SatelliteTrackersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SatelliteTrackersComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SatelliteTrackersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
