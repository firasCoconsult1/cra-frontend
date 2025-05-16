import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsencesManagementComponent } from './absences-management.component';

describe('AbsencesManagementComponent', () => {
  let component: AbsencesManagementComponent;
  let fixture: ComponentFixture<AbsencesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbsencesManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbsencesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
