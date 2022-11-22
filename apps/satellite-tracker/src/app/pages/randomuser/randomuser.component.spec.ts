import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomuserComponent } from './randomuser.component';

describe('RandomuserComponent', () => {
  let component: RandomuserComponent;
  let fixture: ComponentFixture<RandomuserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RandomuserComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RandomuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
