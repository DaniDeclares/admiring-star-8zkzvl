import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Homepage from './Homepage';
import WeddingsPage from './WeddingsPage';
import CalendarPage from './CalendarPage';
import CoachingPage from './CoachingPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/weddings" element={<WeddingsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/coaching" element={<CoachingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
