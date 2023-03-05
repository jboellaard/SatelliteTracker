import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabFollowersComponent } from './tab-followers.component';

describe('TabFollowersComponent', () => {
    let component: TabFollowersComponent;
    let fixture: ComponentFixture<TabFollowersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TabFollowersComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TabFollowersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
