import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { BrokerProvider } from './hooks/useBroker';
import { StocksProvider } from './hooks/useStocks';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatWidget from './components/ChatWidget';
import TradingPopup from './components/TradingPopup';
import BrokerConnect from './components/BrokerConnect';
import './styles/globals.css';
import './styles/variables.css';

// API Service
import api from './services/api';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Subscription = lazy(() => import('./pages/Subscription'));
const Settings = lazy(() => import('./pages/Settings'));
const BrokerSettings = lazy(() => import('./pages/BrokerSettings'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('veloxtradeai_token');
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('veloxtradeai_token');
  return token ? <Navigate to="/" replace /> : children;
};

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [signals, setSignals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Initialize app
    initializeApp();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initializeApp = async () => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('veloxtradeai_token');
      const storedUser = localStorage.getItem('veloxtradeai_user');
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Check broker connection
      const brokerStatus = localStorage.getItem('broker_connected');
      setBrokerConnected(brokerStatus === 'true');

      // Fetch initial signals
      await fetchSignals();

    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSignals = async () => {
    try {
      const token = localStorage.getItem('veloxtradeai_token');
      if (!token) return;

      const response = await api.get('/api/signals');
      if (response.success) {
        setSignals(response.signals || []);
      }
    } catch (error) {
      console.error('Signals fetch error:', error);
    }
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('veloxtradeai_token', token);
    localStorage.setItem('veloxtradeai_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('veloxtradeai_token');
    localStorage.removeItem('veloxtradeai_user');
    localStorage.removeItem('broker_connected');
    setUser(null);
    setBrokerConnected(false);
    window.location.href = '/login';
  };

  const handleBrokerConnect = (status) => {
    setBrokerConnected(status);
    localStorage.setItem('broker_connected', status);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="spinner w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Loading VeloxTradeAI...</h2>
          <p className="text-gray-400">Initializing trading engine</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login onLogin={handleLogin} />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register onRegister={handleLogin} />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex min-h-screen">
                {/* Trading Popup */}
                <TradingPopup signals={signals} onTradePlaced={fetchSignals} />

                {/* Mobile Backdrop */}
                {isMobile && sidebarOpen && (
                  <div 
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                  />
                )}
                
                {/* Sidebar */}
                <div className={`
                  ${isMobile ? 'fixed' : 'sticky top-0 h-screen'}
                  z-40 transition-transform duration-300 ease-in-out
                  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                  ${!isMobile ? 'translate-x-0' : ''}
                `}>
                  <Sidebar 
                    isOpen={sidebarOpen} 
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    user={user}
                    brokerConnected={brokerConnected}
                    onLogout={handleLogout}
                  />
                </div>
                
                {/* Main Content */}
                <div className="flex-1 flex flex-col w-full min-h-screen">
                  <Navbar 
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    isSidebarOpen={sidebarOpen}
                    user={user}
                  />
                  
                  {/* Broker Connection Modal */}
                  {!brokerConnected && user && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full">
                        <div className="p-6">
                          <BrokerConnect onConnect={handleBrokerConnect} />
                        </div>
                      </div>
                    </div>
                  )}

                  <main className="flex-1 p-4 md:p-6 mt-16 md:mt-0 overflow-y-auto">
                    <Suspense fallback={
                      <div className="flex justify-center items-center h-64">
                        <div className="spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    }>
                      <Routes>
                        <Route path="/" element={
                          <Dashboard 
                            user={user}
                            brokerConnected={brokerConnected}
                            signals={signals}
                          />
                        } />
                        <Route path="/analytics" element={
                          <Analytics 
                            user={user}
                          />
                        } />
                        <Route path="/subscription" element={
                          <Subscription 
                            user={user}
                          />
                        } />
                        <Route path="/settings" element={
                          <Settings 
                            user={user}
                            onLogout={handleLogout}
                          />
                        } />
                        <Route path="/broker-settings" element={
                          <BrokerSettings 
                            user={user}
                            brokerConnected={brokerConnected}
                            onConnect={handleBrokerConnect}
                          />
                        } />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </main>
                </div>
                
                {/* Chat Widget */}
                <ChatWidget />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrokerProvider>
          <StocksProvider>
            <AppContent />
          </StocksProvider>
        </BrokerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
