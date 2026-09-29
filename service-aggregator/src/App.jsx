import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import Home from './pages/Home';


import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Services from './pages/customer/Services';
import CustomerDashboard from './pages/customer/Dashboard';
import ProviderDashboard from './pages/provider/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="services" element={<Services />} />
            <Route path="dashboard" element={
              <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                <DashboardDispatcher />
              </ProtectedRoute>
            } />
            {/* Protected routes will be added here */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Simple dispatcher component
function DashboardDispatcher() {
  const { userRole } = useAuth();
  if (userRole === 'admin') return <AdminDashboard />;
  if (userRole === 'provider') return <ProviderDashboard />;
  return <CustomerDashboard />;
}

export default App;
