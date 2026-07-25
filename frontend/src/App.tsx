import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from "./components/Home";
import WorkerRegistration from './components/WorkerRegistration';
import EmployerRegistration from './components/EmployerRegistration';
import EmployerDashboard from './components/EmployerDashboard';
import WorkerDashboard from './components/WorkerDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/worker_registration" element={<WorkerRegistration />} />
          <Route path="/employer_registration" element={<EmployerRegistration />} />
          <Route path="/employer_dashboard" element={<EmployerDashboard />} />
          <Route path="/worker_dashboard" element={<WorkerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
