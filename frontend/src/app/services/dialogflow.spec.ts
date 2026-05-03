import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Auth } from '@angular/fire/auth';
import { DialogflowService } from './dialogflow';
import { environment } from '../../environments/environment';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('DialogflowService', () => {
  let service: DialogflowService;
  let httpMock: HttpTestingController;
  const authMock = {
    currentUser: null,
  } as unknown as Auth;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DialogflowService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Auth, useValue: authMock },
      ]
    });
    service = TestBed.inject(DialogflowService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a POST request to the proxyUrl', async () => {
    const mockResponse = {
      responseId: '123',
      queryResult: { 
        fulfillmentText: 'Hello from Dialogflow',
        queryText: 'Hello',
        languageCode: 'en',
        intent: { name: 'test', displayName: 'Default Welcome Intent' },
        intentDetectionConfidence: 1
      }
    };
    const testQuery = 'Hello';

    service.sendQuery(testQuery).subscribe(response => {
      expect(response.fulfillmentText).toEqual('Hello from Dialogflow');
      expect(response.intent).toEqual('Default Welcome Intent');
    });

    await Promise.resolve();

    const req = httpMock.expectOne(environment.dialogflow.proxyUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.text).toEqual(testQuery);
    expect(req.request.body.sessionId).toBeDefined();
    
    req.flush(mockResponse);
  });
});
