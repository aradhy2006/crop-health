import { HashRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Farm from "./pages/farm";
import DiseaseDetection from "./pages/diseasedetection";
import Reports from "./pages/reports";
import ReportDetail from "./pages/reportdetail";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/farm" element={<Farm />} />

          <Route path="/farm/:farmId" element={<Farm />} />

          <Route path="/detect" element={<DiseaseDetection />} />

          <Route path="/reports" element={<Reports />} />

          <Route path="/reports/:reportId" element={<ReportDetail />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;