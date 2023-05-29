import { TestBed } from '@angular/core/testing';

import { XcashDelegatesService } from './xcash-delegates.service';

describe('XcashDelegatesService', () => {
  let service: XcashDelegatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XcashDelegatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
