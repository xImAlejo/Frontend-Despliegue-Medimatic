/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CoordinationGuard } from './coordination.guard';

describe('Service: Coordination.guard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoordinationGuard]
    });
  });

  it('should ...', inject([CoordinationGuard], (service: CoordinationGuard) => {
    expect(service).toBeTruthy();
  }));
});
