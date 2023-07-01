import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />} />
          {/* Add more routes here */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
