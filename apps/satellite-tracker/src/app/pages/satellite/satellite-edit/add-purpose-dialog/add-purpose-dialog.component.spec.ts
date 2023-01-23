import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPurposeDialogComponent } from './add-purpose-dialog.component';

describe('AddPurposeDialogComponent', () => {
    let component: AddPurposeDialogComponent;
    let fixture: ComponentFixture<AddPurposeDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AddPurposeDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AddPurposeDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
