import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Payloads from './pages/Payloads';
import Targets from './pages/Targets';
import Boxes from './pages/Boxes';
import News from './pages/News';
import KillChain from './pages/Methodology/KillChain';
import ToolDetail from './pages/Tools/ToolDetail';
import AddTool from './pages/Tools/AddTool';
import BoxDetail from './pages/Boxes/BoxDetail';
import EditTool from './pages/Tools/EditTool';
import AdminPanel from './pages/Admin/AdminPanel';
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

        <Route path="/boxes/:id" element={
          <ProtectedRoute>
            <Layout><BoxDetail /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/news" element={
          <ProtectedRoute>
            <Layout><News /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/killchain" element={
          <ProtectedRoute>
            <Layout><KillChain /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/tools/:name" element={<ProtectedRoute><Layout><ToolDetail /></Layout></ProtectedRoute>} />
        
        <Route path="/tools/add/:name?" element={
          <ProtectedRoute>
            <Layout><AddTool /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/tools/edit/:name" element={
          <ProtectedRoute>
            <Layout><EditTool /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute>
            <Layout><AdminPanel /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;