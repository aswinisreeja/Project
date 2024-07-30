import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import Auth from './components/Auth/Auth';

const App = () => (
  <Router>
    <Routes>
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
    </Routes>
  </Router>
);

export default App;
