import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { BrokerProvider } from './hooks/useBroker';
import { StocksProvider } from './hooks/useStocks';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatWidget from './components/ChatWidget';
import './styles/globals.css';
import './styles/variables.css';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Subscription = lazy(() => import('./pages/Subscription'));
const Settings = lazy(() => import('./pages/Settings'));
const BrokerSettings = lazy(() => import('./pages/BrokerSettings'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Reports = lazy(() => import('./pages/Reports'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Support = lazy(() => import('./pages/Support'));
const Rewards = lazy(() => import('./pages/Rewards'));

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('velox_auth_token');
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('velox_auth_token');
  return token ? <Navigate to="/" replace /> : children;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop (>=768px), sidebar should be open by default
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Check authentication - show loading for 1 second
    setTimeout(() => setIsLoading(false), 1000);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            VeloxTradeAI
          </h2>
          <p className="text-emerald-300/70">Initializing AI Trading Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <AuthProvider>
            <BrokerProvider>
              <StocksProvider>
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white transition-colors duration-200">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={
                      <PublicRoute>
                        <Suspense fallback={
                          <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-950">
                            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        }>
                          <Login />
                        </Suspense>
                      </PublicRoute>
                    } />
                    <Route path="/register" element={
                      <PublicRoute>
                        <Suspense fallback={
                          <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-950">
                            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        }>
                          <Register />
                        </Suspense>
                      </PublicRoute>
                    } />
                    
                    {/* Protected Routes */}
                    <Route path="/*" element={
                      <ProtectedRoute>
                        <div className="flex min-h-screen">
                          {/* Mobile Backdrop - Fixed z-index */}
                          {isMobile && sidebarOpen && (
                            <div 
                              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
                              onClick={closeSidebar}
                            />
                          )}
                          
                          {/* Sidebar - Fixed positioning and z-index */}
                          <div className={`
                            ${isMobile ? 'fixed inset-y-0 left-0' : 'sticky top-0 h-screen'}
                            z-50 transition-transform duration-300 ease-in-out
                            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                            ${!isMobile ? 'translate-x-0' : ''}
                          `}>
                            <Sidebar 
                              isOpen={sidebarOpen} 
                              toggleSidebar={toggleSidebar}
                            />
                          </div>
                          
                          {/* Main Content */}
                          <div className="flex-1 flex flex-col w-full min-h-screen transition-all duration-300">
                            <Navbar 
                              toggleSidebar={toggleSidebar}
                              isSidebarOpen={sidebarOpen}
                            />
                            
                            <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gradient-to-b from-gray-900/50 to-gray-950/30">
                              <Suspense fallback={
                                <div className="flex justify-center items-center h-64">
                                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              }>
                                <Routes>
                                  <Route path="/" element={<Dashboard />} />
                                  <Route path="/dashboard" element={<Dashboard />} />
                                  <Route path="/analytics" element={<Analytics />} />
                                  <Route path="/subscription" element={<Subscription />} />
                                  <Route path="/settings" element={<Settings />} />
                                  <Route path="/broker-settings" element={<BrokerSettings />} />
                                  <Route path="/reports" element={<Reports />} />
                                  <Route path="/transactions" element={<Transactions />} />
                                  <Route path="/alerts" element={<Alerts />} />
                                  <Route path="/support" element={<Support />} />
                                  <Route path="/rewards" element={<Rewards />} />
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
              </StocksProvider>
            </BrokerProvider>
          </AuthProvider>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
