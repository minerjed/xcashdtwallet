import { TestBed } from '@angular/core/testing';

import { ValidatorsRegexService } from './validators-regex.service';

describe('ValidatorsRegexService', () => {
  let service: ValidatorsRegexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidatorsRegexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
