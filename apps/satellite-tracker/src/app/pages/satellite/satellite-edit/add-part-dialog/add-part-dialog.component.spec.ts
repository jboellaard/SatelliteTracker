import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SnackBarService } from '../../../../utils/snack-bar.service';
import { of } from 'rxjs';

import { AddPartDialogComponent } from './add-part-dialog.component';

describe('AddPartDialogComponent', () => {
    let component: AddPartDialogComponent;
    let fixture: ComponentFixture<AddPartDialogComponent>;

    let mockSnackBarService: any;
    let mockDialog: any;
    let mockDialogData: any;

    const parts = [
        {
            id: '1',
            partName: 'test part',
            description: 'test description',
        },
        {
            id: '2',
            partName: 'test part 2',
            description: 'test description 2',
        },
        {
            id: '3',
            partName: 'test part 3',
            description: 'test description 3',
        },
    ];

    beforeEach(async () => {
        mockSnackBarService = {
            error: jest.fn(() => of({})),
        };

        mockDialog = {
            close: jest.fn(() => of({})),
        };

        mockDialogData = {
            allSatelliteParts: parts,
        };

        await TestBed.configureTestingModule({
            declarations: [AddPartDialogComponent],
            imports: [
                BrowserAnimationsModule,
                NoopAnimationsModule,
                FormsModule,
                MatInputModule,
                MatFormFieldModule,
                MatExpansionModule,
                MatDialogModule,
                MatDividerModule,
            ],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: mockDialogData,
                },
                { provide: MatDialogRef, useValue: mockDialog },
                { provide: SnackBarService, useValue: mockSnackBarService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AddPartDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create a custom satellite part', () => {
        expect(component.selectedPart).toEqual({
            satellitePart: parts[0],
            color: '#000000',
            size: 0,
            quantity: 0,
        });
    });

    it('should close the dialog and return an error if there are no parts given', () => {
        jest.spyOn(mockSnackBarService, 'error');
        jest.spyOn(mockDialog, 'close');

        mockDialogData.allSatelliteParts = [];
        fixture = TestBed.createComponent(AddPartDialogComponent);
        component = fixture.componentInstance;
        component.selectedPart = {
            satellitePart: {
                id: '1',
                partName: 'no part',
            },
            color: '#000000',
            size: 0,
            quantity: 0,
        };
        fixture.detectChanges();

        expect(mockSnackBarService.error).toHaveBeenCalled();
        expect(mockDialog.close).toHaveBeenCalled();
    });
});
