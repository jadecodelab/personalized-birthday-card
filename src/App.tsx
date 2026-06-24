import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CreatePage from "./pages/CreatePage";
import CardPage from "./pages/CardPage";
import ShortCardPage from "./pages/ShortCardPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/create" replace />} />
        <Route path="/create" element={<CreatePage />} />
        {/* Kept for backward compatibility with links already sent before
            short links (/c/:id) existed. */}
        <Route path="/card" element={<CardPage />} />
        <Route path="/c/:id" element={<ShortCardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
