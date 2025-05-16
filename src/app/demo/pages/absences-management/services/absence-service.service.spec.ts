import { TestBed } from '@angular/core/testing';

import { AbsenceServiceService } from './absence-service.service';

describe('AbsenceServiceService', () => {
  let service: AbsenceServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AbsenceServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
