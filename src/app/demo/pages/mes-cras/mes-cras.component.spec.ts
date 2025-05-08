import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesCrasComponent } from './mes-cras.component';

describe('MesCrasComponent', () => {
  let component: MesCrasComponent;
  let fixture: ComponentFixture<MesCrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesCrasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesCrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
