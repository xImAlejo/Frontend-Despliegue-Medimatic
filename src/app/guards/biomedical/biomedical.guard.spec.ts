/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BiomedicalGuard } from './biomedical.guard';

describe('Service: Biomedical.guard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BiomedicalGuard]
    });
  });

  it('should ...', inject([BiomedicalGuard], (service: BiomedicalGuard) => {
    expect(service).toBeTruthy();
  }));
});
