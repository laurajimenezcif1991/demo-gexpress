import type { OnePageResponse } from '../types/onePage';
import { getCached, setCached } from './apiCache';

const API_BASE = 'https://xhk559kht1.execute-api.us-east-2.amazonaws.com/prod';

export async function getCandidateOnePage(token: string, candidateId: string): Promise<OnePageResponse> {
  const key = `onepage:${candidateId}`;
  const cached = getCached<OnePageResponse>(key);
  if (cached) return cached;

  const url = new URL(`${API_BASE}/candidate/one-page`);
  url.searchParams.set('candidate_id', candidateId);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`One-page request failed with status ${res.status}`);
  }

  const data = (await res.json()) as OnePageResponse;
  setCached(key, data);
  return data;
}

