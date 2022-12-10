import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SatelliteListComponent } from './satellite-list.component';

describe('SatelliteListComponent', () => {
    let component: SatelliteListComponent;
    let fixture: ComponentFixture<SatelliteListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SatelliteListComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SatelliteListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
