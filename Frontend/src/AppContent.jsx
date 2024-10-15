// AppContent.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Notification from './components/Notification';
import Home from './components/Home';
import IntakeForm from './components/Forms/IntakeForm';
import PillCycleForm from './components/Forms/PillCycleForm';
import api from './axiosInstance';

function AppContent() {
  const [error, setError] = useState(null);
  const location = useLocation();   
  const [isLoading, setIsLoading] = useState(true)
    
  const checkServer = async () => {
    setIsLoading(true)
    try {
      await api.get('/');
      setError(null);
    } catch (err) {
      setError('Server is not responding. Please try again later.');
      console.error('Error connecting to server:', err);
    }finally{
        setIsLoading(false)
    }
  };

  useEffect(() => {
    checkServer();
  }, [location]);

  if (isLoading){
    return (
        <div className='flex flex-col justify-center items-center h-screen'>
            <span className="loading loading-spinner loading-lg"></span>
        </div>
        
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-6xl font-bold text-center mb-6">{error}</p>
        <button
          onClick={() => {
            setError(null);
            checkServer();
          }}
          className="btn btn-primary mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <Notification />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/intake" element={<IntakeForm />} />
        <Route path="/cycle" element={<PillCycleForm isSettings={false} />} />
      </Routes>
    </>
  );
}

export default AppContent;