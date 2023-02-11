import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabTrackingComponent } from './tab-tracking.component';

describe('TabTrackingComponent', () => {
    let component: TabTrackingComponent;
    let fixture: ComponentFixture<TabTrackingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TabTrackingComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TabTrackingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
