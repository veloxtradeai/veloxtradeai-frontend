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

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768; // Changed to 768 for mobile
      setIsMobile(mobile);
      
      // Mobile पर sidebar automatically close
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Check authentication
    setTimeout(() => setIsLoading(false), 500);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="relative mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-xl opacity-60"></div>
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-emerald-500/40">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            VeloxTradeAI
          </h2>
          <p className="text-emerald-300/60">Initializing AI Trading Platform...</p>
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
                {/* REMOVED BACKGROUND CLASS HERE - Let pages handle their own background */}
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={
                    <PublicRoute>
                      <Suspense fallback={
                        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      }>
                        <Login />
                      </Suspense>
                    </PublicRoute>
                  } />
                  <Route path="/register" element={
                    <PublicRoute>
                      <Suspense fallback={
                        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      }>
                        <Register />
                      </Suspense>
                    </PublicRoute>
                  } />
                  
                  {/* Protected Routes */}
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                        {/* Mobile Overlay */}
                        {isMobile && sidebarOpen && (
                          <div 
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                          />
                        )}
                        
                        {/* Sidebar - Fixed positioning for mobile */}
                        <div className={`
                          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative z-10'}
                          transition-transform duration-300 ease-in-out
                          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                          ${!isMobile ? 'translate-x-0' : ''}
                        `}>
                          <Sidebar 
                            isOpen={sidebarOpen} 
                            toggleSidebar={toggleSidebar}
                          />
                        </div>
                        
                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col w-full min-h-screen overflow-hidden">
                          {/* Navbar - Fixed at top */}
                          <div className={`${isMobile ? 'fixed top-0 left-0 right-0 z-30' : 'relative z-20'}`}>
                            <Navbar 
                              toggleSidebar={toggleSidebar}
                              isSidebarOpen={sidebarOpen}
                            />
                          </div>
                          
                          {/* Main Content with proper spacing */}
                          <div className={`flex-1 overflow-y-auto ${isMobile ? 'pt-16' : ''}`}>
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
                                <Route path="*" element={<Navigate to="/" replace />} />
                              </Routes>
                            </Suspense>
                          </div>
                        </div>
                        
                        {/* Chat Widget - Will add later */}
                        {/* <ChatWidget /> */}
                      </div>
                    </ProtectedRoute>
                  } />
                </Routes>
              </StocksProvider>
            </BrokerProvider>
          </AuthProvider>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
