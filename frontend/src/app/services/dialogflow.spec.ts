import { TestBed } from '@angular/core/testing';

import { Dialogflow } from './dialogflow';

describe('Dialogflow', () => {
  let service: Dialogflow;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Dialogflow);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
