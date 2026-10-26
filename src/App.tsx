import type { ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Catalogue } from "./pages/Catalogue";
import { Demandes } from "./pages/Demandes";
import { Reservations } from "./pages/Reservations";
import { Historique } from "./pages/Historique";
import { AdminPilotage } from "./pages/admin/AdminPilotage";
import { AdminStock } from "./pages/admin/AdminStock";
import { AdminValidations } from "./pages/admin/AdminValidations";
import { AdminPlanning } from "./pages/admin/AdminPlanning";
import { AdminMembres } from "./pages/admin/AdminMembres";
import { AppProvider, useApp } from "./store/AppStore";

/** L'administration n'est ouverte qu'à la vue Gestionnaire. */
function RequireManager({ children }: { children: ReactElement }) {
  const { state } = useApp();
  if (state.role !== "Gestionnaire") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/demandes" element={<Demandes />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/historique" element={<Historique />} />

            <Route
              path="/admin"
              element={
                <RequireManager>
                  <AdminPilotage />
                </RequireManager>
              }
            />
            <Route
              path="/admin/stock"
              element={
                <RequireManager>
                  <AdminStock />
                </RequireManager>
              }
            />
            <Route
              path="/admin/validations"
              element={
                <RequireManager>
                  <AdminValidations />
                </RequireManager>
              }
            />
            <Route
              path="/admin/planning"
              element={
                <RequireManager>
                  <AdminPlanning />
                </RequireManager>
              }
            />
            <Route
              path="/admin/membres"
              element={
                <RequireManager>
                  <AdminMembres />
                </RequireManager>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
