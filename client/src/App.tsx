import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import SessionsPage from "./pages/SessionPage";
import HeatmapPage from "./pages/HeatmapPage";

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen w-full overflow-hidden bg-[#0A0A0A]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#0A0A0A] pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
