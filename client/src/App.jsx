import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Farm from "./pages/farm";
import DiseaseDetection from "./pages/diseasedetection";
function App() {
    return (
        <BrowserRouter>
            <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/farm" element={<Farm />} />
    <Route path="/detect" element={<DiseaseDetection />} />
</Routes>
        </BrowserRouter>
    );
}

export default App;