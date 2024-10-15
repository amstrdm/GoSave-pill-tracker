import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppContent from './AppContent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  return (  
    <>
    <Router>
      <AppContent/>
      <ToastContainer/>
    </Router>

    {}
    </>
  );
}

export default App;
