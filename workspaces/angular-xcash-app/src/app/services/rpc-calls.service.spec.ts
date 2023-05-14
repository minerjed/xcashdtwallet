import { TestBed } from '@angular/core/testing';

import { RpcCallsService } from './rpc-calls.service';

describe('RpcCallsService', () => {
  let service: RpcCallsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RpcCallsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
