import { TestBed } from '@angular/core/testing';

import { CustomAngularSchematicLibService } from './custom-angular-schematic-lib.service';

describe('CustomAngularSchematicLibService', () => {
  let service: CustomAngularSchematicLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomAngularSchematicLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
