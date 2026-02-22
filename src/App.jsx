import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup/Signup';
import Payloads from './pages/Payloads';
import Targets from './pages/Targets';
import Boxes from './pages/Boxes';
import News from './pages/News';
import Wiki from './pages/Wiki/Wiki';
import EditPayloads from './pages/Payloads/EditPayloads';
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
import ReverseShell from './pages/ReverseShell/ReverseShell';
import ScrollToTop from './components/ScrollToTop';
import Profile from './pages/Profile';
import Landing from './pages/Landing/Landing';
import About from './pages/About/About';

function App() {
  return (
    <ToastProvider>
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Route Publique */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />

        {/* Layout Persistant pour les routes protégées */}
        <Route element={
          <ProtectedRoute>
            <Layout>
              <Outlet />
            </Layout>
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payloads" element={<Payloads />} />
          
          {/* Routes Payloads Protégées (Pentester & Admin) */}
          <Route path="/payloads/add" element={
            <ProtectedRoute allowedRoles={[ROLES.PENTESTER, ROLES.ADMIN]}><EditPayloads /></ProtectedRoute>
          } />
          <Route path="/payloads/edit/:id" element={
            <ProtectedRoute allowedRoles={[ROLES.PENTESTER, ROLES.ADMIN]}><EditPayloads /></ProtectedRoute>
          } />

          <Route path="/targets" element={
            <ProtectedRoute allowedRoles={[ROLES.PENTESTER, ROLES.ADMIN]}><Targets /></ProtectedRoute>
          } />
          <Route path="/boxes" element={
            <ProtectedRoute allowedRoles={[ROLES.PENTESTER, ROLES.ADMIN]}><Boxes /></ProtectedRoute>
          } />
          <Route path="/boxes/:id" element={
            <ProtectedRoute allowedRoles={[ROLES.PENTESTER, ROLES.ADMIN]}><BoxDetail /></ProtectedRoute>
          } />
          <Route path="/news" element={<News />} />
          <Route path="/wiki" element={<Wiki />} />
          {/* Route vide pour CyberChef car il est géré dans le Layout */}
          <Route path="/cyberchef" element={<div />} />
          <Route path="/killchain" element={<KillChain />} />
          <Route path="/revshell" element={<ReverseShell />} />
          <Route path="/tools/:name" element={<ToolDetail />} />
          
          {/* Routes Administrateur Uniquement */}
          <Route path="/tools/add/:name?" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AddTool /></ProtectedRoute>
          } />
          <Route path="/tools/edit/:name" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><EditTool /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.PENTESTER, ROLES.GUEST]}><AdminPanel /></ProtectedRoute>
          } />
        </Route>
        
        {/* Page 404 - Doit être la dernière route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </ToastProvider>
  );
}

export default App;