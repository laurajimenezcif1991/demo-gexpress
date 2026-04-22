export interface ScoringResponse {
  count: number;
  applications: ScoringApplication[];
}

export interface ScoringApplication {
  id: string;
  candidate_id: string;
  email?: string;
  photo?: string | null;
  actual_role?: string;
  country_residence?: string;
  city_residence?: string;
  experience_years?: number;
  recruiter_summary?: string;
  final_ai_score: string | null;
  recommended_action: string;
  candidate_context: {
    name: string;
  };
}

