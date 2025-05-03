import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import { ParticleBackground } from "./components/ui/ParticleBackground";

// Pages
import Dashboard from "./pages/Dashboard";
import ProblemLogger from "./pages/ProblemLogger";
import Calendar from "./pages/Calendar";
import RetryList from "./pages/RetryList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/layout/Layout";
import NotFound from "./pages/NotFound";

// Loading Screen
import LoadingScreen from "./components/ui/LoadingScreen";

function App() {
  const { user, loading } = useAuth();
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app loading
    if (!loading) {
      setTimeout(() => {
        setAppLoading(false);
      }, 1800);
    }
  }, [loading]);

  if (loading || appLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <ParticleBackground />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="problem-logger" element={<ProblemLogger />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="retry-list" element={<RetryList />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
