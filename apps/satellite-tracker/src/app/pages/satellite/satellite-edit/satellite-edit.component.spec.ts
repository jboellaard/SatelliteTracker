import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SatelliteEditComponent } from './satellite-edit.component';

describe('SatelliteEditComponent', () => {
    let component: SatelliteEditComponent;
    let fixture: ComponentFixture<SatelliteEditComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SatelliteEditComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SatelliteEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
