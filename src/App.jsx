import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Payloads from './pages/Payloads';
import Targets from './pages/Targets';
import Boxes from './pages/Boxes';
import News from './pages/News';
import Wiki from './pages/Wiki/Wiki';
import KillChain from './pages/Methodology/KillChain';
import ToolDetail from './pages/Tools/ToolDetail';
import AddTool from './pages/Tools/AddTool';
import BoxDetail from './pages/Boxes/BoxDetail';
import EditTool from './pages/Tools/EditTool';
import AdminPanel from './pages/Admin/AdminPanel';
import NotFound from './pages/NotFound/NotFound';
import ProtectedRoute from './components/ProtectedRoute'; // Import du garde
import { ToastProvider } from './components/Toast/ToastContext';
import { ROLES } from './utils/constants';

function App() {
  return (
    <ToastProvider>
    <Router>
      <Routes>
        {/* Route Publique */}
        <Route path="/login" element={<Login />} />

        {/* Layout Persistant pour les routes protégées */}
        <Route element={
          <ProtectedRoute>
            <Layout>
              <Outlet />
            </Layout>
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payloads" element={<Payloads />} />
          <Route path="/targets" element={<Targets />} />
          <Route path="/boxes" element={<Boxes />} />
          <Route path="/boxes/:id" element={<BoxDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/wiki" element={<Wiki />} />
          {/* Route vide pour CyberChef car il est géré dans le Layout */}
          <Route path="/cyberchef" element={<div />} />
          <Route path="/killchain" element={<KillChain />} />
          <Route path="/tools/:name" element={<ToolDetail />} />
          
          {/* Routes Administrateur Uniquement */}
          <Route path="/tools/add/:name?" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AddTool /></ProtectedRoute>
          } />
          <Route path="/tools/edit/:name" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><EditTool /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminPanel /></ProtectedRoute>
          } />
        </Route>
        
        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Page 404 - Doit être la dernière route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </ToastProvider>
  );
}

export default App;