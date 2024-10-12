import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import IntakeForm from './components/Forms/IntakeForm';
import PillCycleForm from './components/Forms/PillCycleForm';
import Notification from './components/Notification';

function App() {

  return (  
    <>
    <Notification />    
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/intake" element={<IntakeForm />} />
        <Route path="/cycle" element={<PillCycleForm isSettings={false}/>} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
