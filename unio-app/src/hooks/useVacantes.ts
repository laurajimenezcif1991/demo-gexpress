import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCompanyDashboard } from '../api/dashboard';
import { mapJobToVacantes } from '../api/mappers';
import type { Vacante } from '../data/mock';
import { MOCK_VACANTES } from '../data/mock';
import type { Job } from '../types/dashboard';
import { assetUrl } from '../utils/assets';

interface UseVacantesResult {
  vacantes: Vacante[];
  rawJobs: Job[];
  logoUrl: string;
  companyName: string;
  loading: boolean;
  error: string | null;
}

export function useVacantes(): UseVacantesResult {
  const { token } = useAuth();
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [rawJobs, setRawJobs] = useState<Job[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>(assetUrl('/logo-comfandi.webp'));
  const [companyName, setCompanyName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLogoUrl(assetUrl('/logo-comfandi.webp'));
      setCompanyName('Comfandi');
      setVacantes([...MOCK_VACANTES]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getCompanyDashboard(token)
      .then((data) => {
        if (cancelled) return;
        const jobs = data.jobs ?? [];
        setRawJobs(jobs);
        setLogoUrl(assetUrl('/logo-comfandi.webp'));
        setCompanyName('Comfandi');
        const mapped = jobs
          .filter((j) => !j.title?.toLowerCase().includes('supervisor de almac'))
          .flatMap(mapJobToVacantes);
        setVacantes([...mapped, ...MOCK_VACANTES]);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Error al cargar vacantes');
        setLogoUrl(assetUrl('/logo-comfandi.webp'));
        setCompanyName('Comfandi');
        setVacantes([...MOCK_VACANTES]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  return { vacantes, rawJobs, logoUrl, companyName, loading, error };
}
