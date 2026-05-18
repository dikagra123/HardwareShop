import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import PaintEstimator from './pages/PaintEstimator';
import RepairEstimator from './pages/RepairEstimator';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import './index.css';
import Charts from './pages/Charts';
import Settings from './pages/Settings';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// Add imports at top
import CustomerLogin from './pages/CustomerLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import PaintRecommendation from './pages/PaintRecommendation';

gsap.registerPlugin(ScrollTrigger);


const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="paint-estimator" element={<PaintEstimator />} />
            <Route path="repair-estimator" element={<RepairEstimator />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="charts" element={<Charts />} />
            <Route path="paint-recommendation" element={<PaintRecommendation />} />
            <Route path="settings" element={<Settings />} />
            {/* // Add routes inside <Routes> (outside PrivateRoute) */}
<Route path="/customer/login" element={<CustomerLogin />} />
<Route path="/customer/dashboard" element={<CustomerDashboard />} />
            
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;