import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomeVacantes from './pages/HomeVacantes';
import Pipeline from './pages/Pipeline';
import CandidateList from './pages/CandidateList';
import CandidateOnepage from './pages/CandidateOnepage';
import CrearVacante from './pages/CrearVacante';
import AnalizandoVacante from './pages/AnalizandoVacante';
import NoNegociables from './pages/NoNegociables';
import CompletarRCP from './pages/CompletarRCP';
import CanalesPublicacion from './pages/CanalesPublicacion';
import RCPGenerado from './pages/RCPGenerado';
import FinalistView from './pages/FinalistView';
import Shortlist from './pages/Shortlist';
import HMEvalForm from './pages/HMEvalForm';
import Candidatos from './pages/Candidatos';
import AnalyticsPage from './pages/AnalyticsPage';
import PruebaBienvenida from './pages/PruebaBienvenida';
import PruebaTest from './pages/PruebaTest';
import PruebaExito from './pages/PruebaExito';
import WaApplyFlow from './pages/WaApplyFlow';
import AuthPage from './pages/auth/AuthPage';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ForgotPasswordVerify from './pages/auth/ForgotPasswordVerify';
import NewPassword from './pages/auth/NewPassword';
import PasswordUpdated from './pages/auth/PasswordUpdated';
import { CandidateStatusProvider } from './context/CandidateStatusContext';
import { AuthProvider } from './context/AuthContext';
import { InterviewProvider } from './context/InterviewContext';
import { PipelineProvider } from './context/PipelineContext';
import { WaPrescreeningProvider } from './context/WaPrescreeningContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <CandidateStatusProvider>
        <InterviewProvider>
          <WaPrescreeningProvider>
          <PipelineProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Auth (public) ── */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/forgot-password/verify" element={<ForgotPasswordVerify />} />
            <Route path="/auth/forgot-password/new-password" element={<NewPassword />} />
            <Route path="/auth/password-updated" element={<PasswordUpdated />} />

            {/* ── App (protected) ── */}
            <Route path="/" element={<ProtectedRoute><HomeVacantes /></ProtectedRoute>} />
            <Route path="/vacante/nueva" element={<ProtectedRoute><CrearVacante /></ProtectedRoute>} />
            <Route path="/vacante/nueva/analizando" element={<ProtectedRoute><AnalizandoVacante /></ProtectedRoute>} />
            <Route path="/vacante/nueva/no-negociables" element={<ProtectedRoute><NoNegociables /></ProtectedRoute>} />
            <Route path="/vacante/nueva/completar" element={<ProtectedRoute><CompletarRCP /></ProtectedRoute>} />
            <Route path="/vacante/nueva/canales" element={<ProtectedRoute><CanalesPublicacion /></ProtectedRoute>} />
            <Route path="/vacante/nueva/rcp" element={<ProtectedRoute><RCPGenerado /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId/process/:processId" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />

            {/* Rutas con processId (estructura definida por backend) */}
            <Route path="/pipeline/:jobId/process/:processId/scoring" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId/process/:processId/prescreening" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId/process/:processId/prueba_manejo" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId/process/:processId/entrevistas" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId/process/:processId/evaluaciones" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId/process/:processId/candidate/:candidateId" element={<ProtectedRoute><CandidateOnepage /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId/process/:processId/finalistas" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />

            {/* Rutas legacy sin processId (fallback para back-nav y rutas existentes) */}
            <Route path="/pipeline/:jobId/scoring" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId/prescreening" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId/prueba_manejo" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId/entrevistas" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId/evaluaciones" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId/finalistas" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId/estudios" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />
            <Route path="/finalistas" element={<ProtectedRoute><CandidateList /></ProtectedRoute>} />

            {/* Deep-link routes for candidate & finalist detail (keep for back-nav) */}
            <Route path="/pipeline/:jobId/candidate/:candidateId" element={<ProtectedRoute><CandidateOnepage /></ProtectedRoute>} />
            <Route path="/pipeline/:jobId/finalist/:candidateId" element={<ProtectedRoute><FinalistView /></ProtectedRoute>} />

            {/* /candidatos — backlog: pipeline unificado con ValidationPipelineFilter (solo URL directa) */}
            <Route path="/candidatos" element={<ProtectedRoute><Candidatos /></ProtectedRoute>} />

            {/* Analytics & Reportes */}
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />

            {/* ── Public ── */}
            <Route path="/apply/:vacancyId" element={<WaApplyFlow />} />
            <Route path="/eval/:evalId" element={<HMEvalForm />} />
            <Route path="/prueba/:evalId"       element={<PruebaBienvenida />} />
            <Route path="/prueba/:evalId/test"  element={<PruebaTest />} />
            <Route path="/prueba/:evalId/exito" element={<PruebaExito />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
          </PipelineProvider>
          </WaPrescreeningProvider>
        </InterviewProvider>
      </CandidateStatusProvider>
    </AuthProvider>
  );
}
