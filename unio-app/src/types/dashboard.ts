export interface DashboardResponse {
  id: string;
  company_name: string;
  logo_url: string;
  company_description: string;
  company_size: string;
  jobs: Job[] | null;
}

export interface Job {
  job_id: string;
  title: string;
  job_status: string;
  seniority_level: string;
  area: string;
  location_city?: string;
  location_country?: string;
  mission?: string;
  total_job_applications: number;
  selection_processes: SelectionProcess[] | null;
}

export interface SelectionProcess {
  process_id: string;
  process_name: string;
  process_status: string;
  process_status_label: string;
  created_at: string;
  process_applications_count: number;
  phases: Phase[] | null;
}

export interface Phase {
  phase_id: string;
  process_phase_type: string;
  phase_type_label: string;
  phase_status_label?: string;
  step_order: number;
  phase_candidates_count: number;
}
