import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CreatePage from "./pages/CreatePage";
import CardPage from "./pages/CardPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/create" replace />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/card" element={<CardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
