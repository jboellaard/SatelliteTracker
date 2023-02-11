import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabFollowingComponent } from './tab-following.component';

describe('TabFollowingComponent', () => {
    let component: TabFollowingComponent;
    let fixture: ComponentFixture<TabFollowingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TabFollowingComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TabFollowingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
