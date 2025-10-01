import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProjectsProvider } from "./context/ProjectsContext";
import { TasksProvider } from "./context/TasksContext";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import type { ReactNode } from "react"; // ✅ import ReactNode

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return <>{user ? children : <Navigate to="/login" replace />}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ProjectsProvider>
        <TasksProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

            {/* Protected app routes */}
            <Route
              path="/app"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </TasksProvider>
      </ProjectsProvider>
    </AuthProvider>
  );
}
