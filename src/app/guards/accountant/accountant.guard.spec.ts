/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AccountantGuard } from './accountant.guard';

describe('Service: AccountantGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccountantGuard]
    });
  });

  it('should ...', inject([AccountantGuard], (service: AccountantGuard) => {
    expect(service).toBeTruthy();
  }));
});