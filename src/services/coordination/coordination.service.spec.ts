/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CoordinationService } from './coordination.service';

describe('Service: Coordination', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoordinationService]
    });
  });

  it('should ...', inject([CoordinationService], (service: CoordinationService) => {
    expect(service).toBeTruthy();
  }));
});
