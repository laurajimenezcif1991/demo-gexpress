export interface OnePageResponse {
  candidate_section: {
    identity: {
      first_name: string;
      last_name: string;
      photo: string;
    };
    contact: {
      country: string;
      city: string | null;
      email?: string;
    };
    professional_details: {
      actual_role: string;
      target_role: string;
      employment_status: string;
      experience_sector: string;
      salary_expectation: string;
    };
    external_links: {
      cv_url: string;
      portfolio_url: string;
      super_power: string;
    };
  };
  application_section: {
    ai_analysis: {
      final_score: string;
      recommended_action: string;
      recruiter_summary: string;
      top_strengths: string[];
      signals_to_validate: string[];
    };
    evaluation_details: {
      evaluation: {
        rcp_must_haves: string[];
      };
      decision_reason: string;
    };
    category_scores?: {
      role_experience_alignment?: { score: number | null };
      sector_domain_relevance?: { score: number | null };
      demonstrated_skills?: { score: number | null };
      outcomes_impact?: { score: number | null };
      work_artifacts?: { score: number | null };
    };
  };
  prescreening_section?: {
    interview_info: {
      id: string;
      url: string;
      status: string;
      duration: number;
      created_at: string;
      version: string | null;
    };
    ai_analysis: {
      score: string;
      recommended_action: string | null;
      summary: string;
      top_strengths: string[];
      signals_to_validate: string[];
      feedback: string | null;
    };
    content: {
      transcript: string;
      evaluation_context: {
        items: Array<{
          criterio: string;
          evidencia: string;
          puntuacion: number;
        }>;
      };
    };
  };
}

export interface JobDetailsResponse {
  proposed_salary?: string;
  // otros campos del job que puedan ser necesarios
}

