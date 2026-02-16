import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Payloads from './pages/Payloads';
import Targets from './pages/Targets';
import Boxes from './pages/Boxes';
import News from './pages/News';
import ProtectedRoute from './components/ProtectedRoute'; // Import du garde

function App() {
  return (
    <Router>
      <Routes>
        {/* Route Publique */}
        <Route path="/login" element={<Login />} />

        {/* Routes Protégées */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/payloads" element={
          <ProtectedRoute>
            <Layout><Payloads /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/targets" element={
          <ProtectedRoute>
            <Layout><Targets /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/boxes" element={
          <ProtectedRoute>
            <Layout><Boxes /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/news" element={
          <ProtectedRoute>
            <Layout><News /></Layout>
          </ProtectedRoute>
        } />

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;