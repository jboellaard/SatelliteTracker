import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrbitEditComponent } from './orbit-edit.component';

describe('OrbitEditComponent', () => {
    let component: OrbitEditComponent;
    let fixture: ComponentFixture<OrbitEditComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrbitEditComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(OrbitEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
