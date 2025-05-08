import { TestBed } from '@angular/core/testing';

import { CrasService } from './cras.service';

describe('CrasService', () => {
  let service: CrasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
