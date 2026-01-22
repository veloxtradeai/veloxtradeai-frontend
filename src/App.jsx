import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { BrokerProvider } from './hooks/useBroker';
import { StocksProvider } from './hooks/useStocks';
import { ThemeProvider } from './contexts/ThemeContext';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
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

  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <BrokerProvider>
            <StocksProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />
                  <Route path="/register" element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } />
                  
                  {/* Protected Routes */}
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <div className="flex min-h-screen">
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
                          />
                        </div>
                        
                        {/* Main Content */}
                        <div className="flex-1 flex flex-col w-full min-h-screen">
                          <Navbar 
                            toggleSidebar={toggleSidebar}
                            isSidebarOpen={sidebarOpen}
                          />
                          
                          <main className="flex-1 p-4 md:p-6 mt-16 md:mt-0 overflow-y-auto">
                            <Suspense fallback={
                              <div className="flex justify-center items-center h-64">
                                <div className="spinner w-12 h-12"></div>
                              </div>
                            }>
                              <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/analytics" element={<Analytics />} />
                                <Route path="/subscription" element={<Subscription />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/broker-settings" element={<BrokerSettings />} />
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
    </ThemeProvider>
  );
}

export default App;