import { createContext, useContext, useState, type ReactNode } from 'react';
import type { InterviewFeedback } from '../data/mock';

interface SavedFeedbacks {
  hr?: InterviewFeedback;
  hm?: InterviewFeedback;
}

interface InterviewContextValue {
  getFeedback: (candidateId: string) => SavedFeedbacks;
  setFeedback: (candidateId: string, role: 'hr' | 'hm', feedback: InterviewFeedback) => void;
}

const InterviewContext = createContext<InterviewContextValue | null>(null);

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<Record<string, SavedFeedbacks>>({});

  const getFeedback = (candidateId: string): SavedFeedbacks => {
    return feedbacks[candidateId] ?? {};
  };

  const setFeedback = (candidateId: string, role: 'hr' | 'hm', feedback: InterviewFeedback) => {
    setFeedbacks((prev) => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [role]: feedback,
      },
    }));
  };

  return (
    <InterviewContext.Provider value={{ getFeedback, setFeedback }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview(): InterviewContextValue {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error('useInterview must be used within an InterviewProvider');
  return ctx;
}

export function calcScore(feedback?: InterviewFeedback | null): number | null {
  if (!feedback) return null;
  const { ratingA, ratingB, ratingC } = feedback;
  if (ratingA == null || ratingB == null || ratingC == null) return null;
  return Math.round(((ratingA + ratingB + ratingC) / 3) * 20);
}
