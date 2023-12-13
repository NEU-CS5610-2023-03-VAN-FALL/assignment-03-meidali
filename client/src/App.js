import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Layout from './components/Layout';
import Menu from './components/Menu';
import Profile from './components/Profile';
import OrderHistory from './components/OrderHistory';
import Detail from './components/Detail';
import AuthDebugger from './components/AuthDebugger';
import VerifyUser from './components/VerifyUser';
import Likes from './components/Likes';

function App() {
  
  return (
    <Router>
      <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify-user" element={<VerifyUser />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth-debugger" element={<AuthDebugger />} />
        <Route path="/order-detail/:orderId" element={<Detail />} />
        <Route path="/likes" element={<Likes />} />
      </Routes>
      </Layout>
    </Router>
  );
}

export default App;

