import { TestBed } from '@angular/core/testing';

import { XcashPriceIndexService } from './xcash-price-index.service';

describe('XcashPriceIndexService', () => {
  let service: XcashPriceIndexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XcashPriceIndexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
