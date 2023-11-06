import { TestBed } from '@angular/core/testing';

import { XcashGetblockhightService } from './xcash-getblockhight.service';

describe('XcashGetblockhightService', () => {
  let service: XcashGetblockhightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XcashGetblockhightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
