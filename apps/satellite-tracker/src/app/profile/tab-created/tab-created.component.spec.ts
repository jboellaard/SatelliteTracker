import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabCreatedComponent } from './tab-created.component';

describe('TabCreatedComponent', () => {
    let component: TabCreatedComponent;
    let fixture: ComponentFixture<TabCreatedComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TabCreatedComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TabCreatedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
