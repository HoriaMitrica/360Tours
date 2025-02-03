import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ViewTourPage from "./pages/ViewTourPage";
import EditTourPage from "./pages/EditTourPage";
import ToursPage from "./pages/ToursPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ToursPage />} />
        <Route path="/tours" element={<ToursPage />} />
        <Route path="/tours/:id/edit" element={<EditTourPage />} />
        <Route path="/view" element={<ViewTourPage />} /> {/* ✅ Handles /view */}
      </Routes>
    </Router>
  );
}

export default App;
