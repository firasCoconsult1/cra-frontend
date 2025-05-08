import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CraComponent } from './cra.component';

describe('CraComponent', () => {
  let component: CraComponent;
  let fixture: ComponentFixture<CraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
