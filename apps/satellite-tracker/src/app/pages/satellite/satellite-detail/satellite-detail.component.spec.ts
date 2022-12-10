import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SatelliteDetailComponent } from './satellite-detail.component';

describe('SatelliteDetailComponent', () => {
    let component: SatelliteDetailComponent;
    let fixture: ComponentFixture<SatelliteDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SatelliteDetailComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SatelliteDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
