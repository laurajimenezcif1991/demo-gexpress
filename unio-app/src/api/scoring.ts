import type { ScoringResponse } from '../types/scoring';
import { getCached, setCached } from './apiCache';

const API_BASE = 'https://xhk559kht1.execute-api.us-east-2.amazonaws.com/prod';
const PRESCREENING_WEBHOOK = 'https://uxtar.app.n8n.cloud/webhook/prescreening-set-candidates';

export async function getScoringResults(token: string, selectionProcessId: string): Promise<ScoringResponse> {
  const key = `scoring:${selectionProcessId}`;
  const cached = getCached<ScoringResponse>(key);
  if (cached) return cached;

  const url = new URL(`${API_BASE}/applications/scoring/`);
  url.searchParams.set('selection_process_id', selectionProcessId);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Scoring request failed with status ${res.status}`);
  }

  const data = (await res.json()) as ScoringResponse;
  setCached(key, data);
  return data;
}

export interface PassToPresceningPayload {
  job_id: string;
  process_id: string;
  candidates: Array<{
    candidate_id: string;
    name: string;
    email: string;
  }>;
}

export async function passToPreescreening(token: string, payload: PassToPresceningPayload): Promise<void> {
  const res = await fetch(PRESCREENING_WEBHOOK, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Pass to prescreening failed with status ${res.status}`);
  }
}

