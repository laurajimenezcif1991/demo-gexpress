import { getCached, setCached } from './apiCache';

const API_BASE = 'https://xhk559kht1.execute-api.us-east-2.amazonaws.com/prod';

export interface PrescrreningApplication {
  prescreening_id: string;
  url_interview: string;
  prescreening_status: string;
  recommended_action: string | null;
  final_ai_score: string;
  top_strengths: string[];
  signals_to_validate: string[];
  evaluation_context: {
    items: Array<{
      criterio: string;
      evidencia: string;
      puntuacion: number;
    }>;
  };
  summary: string;
  version: string | null;
  created_at: string;
  duration: number;
  transcript_text: string;
  feedback: string | null;
  application_id: string;
  candidate_id: number; // Ahora es requerido y es un número
  job_id: string;
  application_status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo: string | null;
}

export interface PrescrreningResponse {
  count: number;
  selection_process_id: string;
  results: PrescrreningApplication[];
}

export async function getPrescrreningResults(token: string, selectionProcessId: string): Promise<PrescrreningResponse> {
  const key = `prescreening:${selectionProcessId}`;
  const cached = getCached<PrescrreningResponse>(key);
  if (cached) return cached;

  const url = new URL(`${API_BASE}/prescreening`);
  url.searchParams.set('selection_process_id', selectionProcessId);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Prescreening request failed with status ${res.status}`);
  }

  const data = (await res.json()) as PrescrreningResponse;
  setCached(key, data);
  return data;
}