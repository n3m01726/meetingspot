import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import PlanDetailPage from "./pages/PlanDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/plans/:planId" element={<PlanDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/profile/:userId" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;
