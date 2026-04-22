import type { JobDetailsResponse } from '../types/onePage';

const API_BASE = 'https://xhk559kht1.execute-api.us-east-2.amazonaws.com/prod';

export async function getJobDetails(token: string, jobId: string): Promise<JobDetailsResponse> {
  const res = await fetch(`${API_BASE}/company/etexgroup/jobs/${jobId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Job details request failed with status ${res.status}`);
  }

  return (await res.json()) as JobDetailsResponse;
}