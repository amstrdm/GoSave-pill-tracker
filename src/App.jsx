import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import SettingsPanel from './components/Settings';
import IntakeForm from './components/IntakeForm';
import PillCycleForm from './components/PillCycleForm';

function App() {
  // Initialize service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('Service Worker registered'));
  }

  return (  
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/intake" element={<IntakeForm />} />
        <Route path="/cycle" element={<PillCycleForm isSettings={false}/>} />
      </Routes>
    </Router>
  );
}

export default App;
