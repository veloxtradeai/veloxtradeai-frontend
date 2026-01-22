import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatWidget from './components/ChatWidget';
import TradingPopup from './components/TradingPopup';
import BrokerConnect from './components/BrokerConnect';
import LoadingScreen from './components/LoadingScreen';
import './styles/globals.css';
import './styles/variables.css';

// Import API
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
  const user = localStorage.getItem('veloxtradeai_user');
  return token && user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('veloxtradeai_token');
  const user = localStorage.getItem('veloxtradeai_user');
  return token && user ? <Navigate to="/" replace /> : children;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [signals, setSignals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    // Check screen size
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
      // Check API status
      const backendAvailable = await api.isBackendAvailable();
      setApiStatus(backendAvailable ? 'connected' : 'mock');
      
      // Check if user is logged in
      const token = localStorage.getItem('veloxtradeai_token');
      const storedUser = localStorage.getItem('veloxtradeai_user');
      
      if (token && storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Fetch signals if user is logged in
        await fetchSignals();
      }

      // Check broker connection
      const brokerStatus = localStorage.getItem('broker_connected');
      setBrokerConnected(brokerStatus === 'true');

    } catch (error) {
      console.error('Initialization error:', error);
      setApiStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSignals = async () => {
    try {
      const response = await api.trading.getSignals();
      if (response.success && response.signals) {
        setSignals(response.signals);
      }
    } catch (error) {
      console.error('Error fetching signals:', error);
    }
  };

  const handleLogin = async (userData, token) => {
    localStorage.setItem('veloxtradeai_token', token);
    localStorage.setItem('veloxtradeai_user', JSON.stringify(userData));
    setUser(userData);
    
    // Fetch data after login
    await fetchSignals();
  };

  const handleLogout = () => {
    localStorage.removeItem('veloxtradeai_token');
    localStorage.removeItem('veloxtradeai_user');
    localStorage.removeItem('broker_connected');
    setUser(null);
    setBrokerConnected(false);
    setSignals([]);
    window.location.href = '/login';
  };

  const handleBrokerConnect = (status) => {
    setBrokerConnected(status);
    localStorage.setItem('broker_connected', status.toString());
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading VeloxTradeAI..." />;
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {/* API Status Indicator */}
          {apiStatus === 'mock' && (
            <div className="bg-yellow-500 text-white text-center py-2 text-sm">
              Using Mock Data - Backend Connection Failed
            </div>
          )}
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Suspense fallback={<LoadingScreen />}>
                  <Login onLogin={handleLogin} />
                </Suspense>
              </PublicRoute>
            } />
            
            <Route path="/register" element={
              <PublicRoute>
                <Suspense fallback={<LoadingScreen />}>
                  <Register onRegister={handleLogin} />
                </Suspense>
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
                      onClick={closeSidebar}
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
                      toggleSidebar={toggleSidebar}
                      user={user}
                      brokerConnected={brokerConnected}
                      onLogout={handleLogout}
                      apiStatus={apiStatus}
                    />
                  </div>
                  
                  {/* Main Content */}
                  <div className="flex-1 flex flex-col w-full min-h-screen">
                    <Navbar 
                      toggleSidebar={toggleSidebar}
                      isSidebarOpen={sidebarOpen}
                      user={user}
                      brokerConnected={brokerConnected}
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
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      }>
                        <Routes>
                          <Route path="/" element={
                            <Dashboard 
                              user={user}
                              brokerConnected={brokerConnected}
                              signals={signals}
                              onRefreshSignals={fetchSignals}
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
    </ThemeProvider>
  );
}

export default App;
