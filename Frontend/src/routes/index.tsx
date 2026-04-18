import { LoadingFallback } from "@/components/molecules/LoadingFallback";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// componentes principales
const Auth = lazy(() => import("../components/screens/AuthScreen"));
const Layout = lazy(() => import("../components/screens/LayoutScreen"));
const Dashboard = lazy(() => import("../components/screens/DashboardScreen"));
const Dropfiles = lazy(() => import("../components/screens/DropFilesScreen"));
const EvaluationHistory = lazy(() => import("../components/screens/EvaluationHistoryScreen"));
const CaseHistory = lazy(() => import("../components/screens/CaseHistoryScreen"));
const Evaluation = lazy(() => import("../components/screens/EvaluationScreen"));
const UnauthorizedErrorScreen = lazy(() => import("../components/screens/errors/401"));
const NotFoundErrorScreen = lazy(() => import("../components/screens/errors/404"));
const CreateCaseScreen = lazy(() => import("../components/screens/CreateCaseScreen"));

// rutas de rol
const EvaluatorRoutes = lazy(() => import("./EvaluatorRoutes"));
const ResearcherRoutes = lazy(() => import("./ResearcherRoutes"));
const ProtectedRoutes = lazy(() => import("./ProtectedRoutes"));
// rutas de ajustes
const Settings = lazy(() => import("../components/screens/settings/SettingsScreen"));
const Appearance = lazy(() => import("../components/screens/settings/AppearanceScreen"));
const Account = lazy(() => import("../components/screens/settings/AccountScreen"));
const IASettings = lazy(() => import("../components/screens/settings/IAScreen"));

export const AppRoutes = () => {
  return (
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* rutas públicas */}
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/no-autorizado" element={<UnauthorizedErrorScreen />} />
          <Route path="/auth" element={<Auth />} />

          {/* rutas protegidas bajo Layout */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Layout />}>
              {/* Ajustes */}
              <Route path="ajustes" element={<Settings />}>
                <Route path="cuenta" element={<Account />} />
                <Route path="apariencia" element={<Appearance />} />

                <Route element={<EvaluatorRoutes />}>
                  <Route path="ia" element={<IASettings />} />
                </Route>
              </Route>

              {/* Rutas para evaluadores */}
              <Route element={<EvaluatorRoutes />}>
                <Route path="estadisticas" element={<Dashboard />} />
                <Route path="subir-archivos" element={<Dropfiles />} />
                <Route path="historial-archivos-evaluados" element={<EvaluationHistory />} />
                <Route path="evaluacion/:evaluationId" element={<Evaluation />} />
              </Route>

              {/* Rutas para investigadores */}
              <Route element={<ResearcherRoutes />}>
                <Route path="crear-nuevo-caso" element={<CreateCaseScreen />} />
                <Route path="historial-casos" element={<CaseHistory />} />
              </Route>
            </Route>
          </Route>

          {/* catch-all */}
          <Route path="*" element={<NotFoundErrorScreen />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
