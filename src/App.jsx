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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showChatWidget, setShowChatWidget] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, sidebar should be open by default
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Check authentication and load user data
    const loadUserData = async () => {
      const token = localStorage.getItem('velox_auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Load user data from localStorage
        const userData = JSON.parse(localStorage.getItem('velox_user') || '{}');
        const brokerData = JSON.parse(localStorage.getItem('velox_brokers') || '[]');
        const marketData = JSON.parse(localStorage.getItem('market_data') || 'null');
        
        // If no user data exists, create default
        if (!userData.email) {
          localStorage.setItem('velox_user', JSON.stringify({
            name: 'Trader Pro',
            email: 'premium@veloxtrade.ai',
            plan: 'elite',
            joinDate: new Date().toISOString()
          }));
        }
        
        // Initialize broker connections if not exists
        if (brokerData.length === 0) {
          localStorage.setItem('velox_brokers', JSON.stringify([
            { id: 1, name: 'Zerodha', status: 'connected', lastSync: new Date().toISOString() },
            { id: 2, name: 'Angel One', status: 'disconnected', lastSync: null }
          ]));
        }
        
        // Initialize market data if not exists
        if (!marketData) {
          localStorage.setItem('market_data', JSON.stringify({
            nifty: { value: 22450.75, change: '+1.2%', trend: 'up' },
            sensex: { value: 73980.25, change: '+0.8%', trend: 'up' },
            aiConfidence: 87,
            marketStatus: 'open',
            lastUpdated: new Date().toISOString()
          }));
        }
        
        // Check chat widget preference
        const chatPref = localStorage.getItem('velox_chat_widget');
        if (chatPref !== null) {
          setShowChatWidget(chatPref === 'true');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    
    loadUserData();
    
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
        <div className="text-center relative">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 blur-3xl opacity-20 animate-pulse"></div>
          
          <div className="relative">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-xl opacity-60"></div>
              <div className="relative w-24 h-24 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-cyan-500 rounded-full flex items-center justify-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-950 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              VeloxTradeAI
            </h2>
            <p className="text-emerald-300/70 mb-1">Initializing AI Trading Engine...</p>
            <div className="w-64 h-1 bg-gradient-to-r from-emerald-900 to-cyan-900 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-progress"></div>
            </div>
          </div>
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
                          {/* Mobile Backdrop */}
                          {isMobile && sidebarOpen && (
                            <div 
                              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                              onClick={closeSidebar}
                            />
                          )}
                          
                          {/* Sidebar */}
                          <div className={`
                            ${isMobile ? 'fixed' : 'sticky top-0 h-screen'}
                            z-50 transition-all duration-300 ease-in-out
                            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                            ${!isMobile ? 'translate-x-0' : ''}
                          `}>
                            <Sidebar 
                              isOpen={sidebarOpen} 
                              toggleSidebar={toggleSidebar}
                            />
                          </div>
                          
                          {/* Main Content */}
                          <div className="flex-1 flex flex-col w-full min-h-screen">
                            <Navbar 
                              toggleSidebar={toggleSidebar}
                              isSidebarOpen={sidebarOpen}
                              setShowChatWidget={setShowChatWidget}
                            />
                            
                            <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gradient-to-b from-gray-900/50 to-gray-950/30">
                              <Suspense fallback={
                                <div className="flex justify-center items-center h-64">
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 blur-xl opacity-20"></div>
                                    <div className="relative w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
                                  </div>
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
                          
                          {/* Chat Widget - Conditionally render */}
                          {showChatWidget && <ChatWidget />}
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
