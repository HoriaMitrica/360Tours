import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EditTourPage from "./pages/EditTourPage";
import ToursPage from "./pages/ToursPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/tours" element={<ToursPage />} />
        <Route path="/tours/:id/edit" element={<EditTourPage />} />
        <Route path="/" element={<ToursPage />} />
      </Routes>
    </Router>
  );
};


export default App;