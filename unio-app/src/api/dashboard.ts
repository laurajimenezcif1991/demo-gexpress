import type { DashboardResponse } from '../types/dashboard';
import { getCached, setCached } from './apiCache';

const API_BASE = 'https://xhk559kht1.execute-api.us-east-2.amazonaws.com/prod';

export async function getCompanyDashboard(token: string): Promise<DashboardResponse> {
  const key = `dashboard:${token}`;
  const cached = getCached<DashboardResponse>(key);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/company/dashboard`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Dashboard request failed with status ${res.status}`);
  }

  const data = (await res.json()) as DashboardResponse;
  setCached(key, data);
  return data;
}
