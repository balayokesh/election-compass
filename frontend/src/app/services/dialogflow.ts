import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ---------------------------------------------------------------------------
// Environment / config
// ---------------------------------------------------------------------------
const PROXY_URL = environment.dialogflow.proxyUrl;

// ---------------------------------------------------------------------------
// Request / Response interfaces (Dialogflow ES REST v2)
// Docs: https://cloud.google.com/dialogflow/es/docs/reference/rest/v2/projects.agent.sessions/detectIntent
// ---------------------------------------------------------------------------

export interface DialogflowFulfillmentMessage {
  text?: { text: string[] };
  [key: string]: unknown;
}

export interface DialogflowQueryResult {
  queryText: string;
  languageCode: string;
  speechRecognitionConfidence?: number;
  action?: string;
  parameters?: Record<string, unknown>;
  allRequiredParamsPresent?: boolean;
  fulfillmentText?: string;
  fulfillmentMessages?: DialogflowFulfillmentMessage[];
  intent?: {
    name: string;
    displayName: string;
  };
  intentDetectionConfidence?: number;
  diagnosticInfo?: Record<string, unknown>;
}

export interface DialogflowDetectIntentResponse {
  responseId: string;
  queryResult: DialogflowQueryResult;
  webhookStatus?: { code: number; message: string };
}

/** Simplified result surfaced to callers. */
export interface DialogflowReply {
  fulfillmentText: string;
  intent: string;
  confidence: number;
  raw: DialogflowDetectIntentResponse;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable({
  providedIn: 'root',
})
export class DialogflowService {
  private readonly http = inject(HttpClient);

  /**
   * Session ID — kept stable for the lifetime of the service instance so the
   * agent can maintain conversation context across multiple turns.
   */
  private readonly sessionId = crypto.randomUUID();

  /**
   * Sends a text query to the backend proxy, which forwards it to
   * Dialogflow ES using server-side ADC authentication.
   *
   * @param text The user's raw text input.
   */
  sendQuery(text: string): Observable<DialogflowReply> {
    if (!text.trim()) {
      return throwError(() => new Error('Query text must not be empty.'));
    }

    const body = {
      text: text.trim(),
      sessionId: this.sessionId,
    };

    return this.http
      .post<DialogflowDetectIntentResponse>(PROXY_URL, body)
      .pipe(
        map((response) => this.mapResponse(response)),
        catchError((err) => {
          console.error('[DialogflowService] detectIntent failed', err);
          return throwError(() => err);
        }),
      );
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private mapResponse(
    response: DialogflowDetectIntentResponse,
  ): DialogflowReply {
    const { queryResult } = response;

    // Prefer the top-level fulfillmentText; fall back to the first text message.
    const fulfillmentText =
      queryResult.fulfillmentText ||
      queryResult.fulfillmentMessages
        ?.flatMap((m) => m.text?.text ?? [])
        .join(' ') ||
      '';

    return {
      fulfillmentText,
      intent: queryResult.intent?.displayName ?? '',
      confidence: queryResult.intentDetectionConfidence ?? 0,
      raw: response,
    };
  }
}
