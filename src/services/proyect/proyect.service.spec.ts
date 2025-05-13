/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProyectService } from './proyect.service';

describe('Service: Proyect', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProyectService]
    });
  });

  it('should ...', inject([ProyectService], (service: ProyectService) => {
    expect(service).toBeTruthy();
  }));
});
