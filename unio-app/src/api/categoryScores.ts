const API_BASE = 'https://xhk559kht1.execute-api.us-east-2.amazonaws.com/prod';

export interface CategoryScoresResponse {
  candidate_id: number;
  email: string;
  total_applications: number;
  applications: Array<{
    id: string;
    candidate_id: number;
    category_scores: {
      role_experience_alignment?: { score: number | null };
      sector_domain_relevance?: { score: number | null };
      demonstrated_skills?: { score: number | null };
      outcomes_impact?: { score: number | null };
      work_artifacts?: { score: number | null };
    };
    // otros campos que puedan existir
  }>;
}

export async function getCategoryScores(token: string, email: string): Promise<CategoryScoresResponse> {
  const url = new URL(`${API_BASE}/scoring`);
  url.searchParams.set('email', email);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Category scores request failed with status ${res.status}`);
  }

  return (await res.json()) as CategoryScoresResponse;
}