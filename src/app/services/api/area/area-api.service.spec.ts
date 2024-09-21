import { TestBed } from '@angular/core/testing';

import { AreaApiService } from './area-api.service';

describe('AreaApiService', () => {
  let service: AreaApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AreaApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
