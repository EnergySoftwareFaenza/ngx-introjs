import { TestBed } from '@angular/core/testing';

import { IntroJsService } from './intro-js.service';

describe('IntroJsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IntroJsService = TestBed.get(IntroJsService);
    expect(service).toBeTruthy();
  });
});
