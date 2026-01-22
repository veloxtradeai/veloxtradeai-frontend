import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import TradingPopup from './components/TradingPopup';
import BrokerConnect from './components/BrokerConnect';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Brokers from './pages/Brokers';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import LiveMarketWidget from './components/LiveMarketWidget';

// API Services
import api from './services/api';

// Styles
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [signals, setSignals] = useState([]);
  const navigate = useNavigate();

  // Initialize App
  useEffect(() => {
    initializeApp();
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

      // Fetch initial market data
      await fetchMarketData();

      // Fetch trading signals
      await fetchSignals();

      // Setup WebSocket for real-time updates
      setupWebSocket();

    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMarketData = async () => {
    try {
      const response = await api.market.getLiveData();
      if (response.success) {
        setMarketData(response.data);
      }
    } catch (error) {
      console.error('Market data error:', error);
    }
  };

  const fetchSignals = async () => {
    try {
      const response = await api.trading.getSignals();
      if (response.success) {
        setSignals(response.signals);
      }
    } catch (error) {
      console.error('Signals fetch error:', error);
    }
  };

  const setupWebSocket = () => {
    try {
      const ws = api.setupWebSocket((data) => {
        if (data.type === 'signal') {
          console.log('🔔 New signal received:', data);
          // Update signals list
          setSignals(prev => [data.signal, ...prev.slice(0, 9)]);
          
          // Show notification for high confidence signals
          if (data.signal.confidence >= 90) {
            showSignalNotification(data.signal);
          }
          
        } else if (data.type === 'market_update') {
          // Update market data in real-time
          updateMarketData(data);
          
        } else if (data.type === 'trade_update') {
          // Update trade status
          console.log('Trade updated:', data.trade);
          
        } else if (data.type === 'broker_update') {
          // Broker connection status update
          setBrokerConnected(data.connected);
          localStorage.setItem('broker_connected', data.connected);
        }
      });

      return () => {
        if (ws) ws.close();
      };
    } catch (error) {
      console.error('WebSocket setup error:', error);
    }
  };

  const updateMarketData = (newData) => {
    setMarketData(prev => 
      prev.map(stock => 
        stock.symbol === newData.symbol ? { ...stock, ...newData } : stock
      )
    );
  };

  const showSignalNotification = (signal) => {
    // Create browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`🎯 ${signal.symbol} - ${signal.confidence}% Confidence`, {
        body: `Entry: ₹${signal.entry_price} | Target: ₹${signal.target_price}`,
        icon: '/logo.png',
        tag: 'trading_signal'
      });
    }
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('veloxtradeai_token', token);
    localStorage.setItem('veloxtradeai_user', JSON.stringify(userData));
    setUser(userData);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('veloxtradeai_token');
    localStorage.removeItem('veloxtradeai_user');
    localStorage.removeItem('broker_connected');
    setUser(null);
    navigate('/login');
  };

  const handleBrokerConnect = (status) => {
    setBrokerConnected(status);
    localStorage.setItem('broker_connected', status);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <h2>Loading VeloxTradeAI...</h2>
        <p>Initializing trading engine</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #3b82f6'
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Trading Popup - Automatically shows for high confidence signals */}
      <TradingPopup signals={signals} onTradePlaced={fetchSignals} />

      {/* Main Layout */}
      {user ? (
        <div className="app-layout">
          {/* Sidebar */}
          <Sidebar 
            user={user} 
            onLogout={handleLogout}
            brokerConnected={brokerConnected}
          />

          {/* Main Content */}
          <div className="main-content">
            {/* Top Bar */}
            <div className="top-bar">
              <div className="top-bar-left">
                <h1>VeloxTradeAI</h1>
                <span className="premium-badge">Premium Member</span>
              </div>
              <div className="top-bar-right">
                <LiveMarketWidget data={marketData.slice(0, 5)} />
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Broker Connection Modal - Shows if broker not connected */}
            {!brokerConnected && (
              <div className="broker-modal-overlay">
                <div className="broker-modal">
                  <BrokerConnect onConnect={handleBrokerConnect} />
                </div>
              </div>
            )}

            {/* Page Content */}
            <div className="page-content">
              <Routes>
                <Route path="/dashboard" element={
                  <Dashboard 
                    user={user}
                    marketData={marketData}
                    signals={signals}
                    brokerConnected={brokerConnected}
                  />
                } />
                <Route path="/analytics" element={
                  <Analytics 
                    user={user}
                    marketData={marketData}
                  />
                } />
                <Route path="/brokers" element={
                  <Brokers 
                    user={user}
                    brokerConnected={brokerConnected}
                    onConnect={handleBrokerConnect}
                  />
                } />
                <Route path="/settings" element={
                  <Settings 
                    user={user}
                    onLogout={handleLogout}
                  />
                } />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>

            {/* Real-time Signal Indicator */}
            {signals.length > 0 && (
              <div className="signal-indicator">
                <span className="indicator-dot"></span>
                <span className="indicator-text">
                  {signals.length} Active Signals
                </span>
              </div>
            )}

            {/* Footer */}
            <footer className="app-footer">
              <div className="footer-content">
                <p>© 2025 VeloxTradeAI. All rights reserved.</p>
                <div className="footer-links">
                  <a href="#">Terms</a>
                  <a href="#">Privacy</a>
                  <a href="#">Support</a>
                  <a href="#">Contact</a>
                </div>
                <p className="market-status">
                  Market: {new Date().getHours() >= 9 && new Date().getHours() <= 15 ? 'Open' : 'Closed'}
                  {brokerConnected && ' • Broker Connected'}
                </p>
              </div>
            </footer>
          </div>
        </div>
      ) : (
        // Auth Pages (Login/Register)
        <Routes>
          <Route path="/login" element={
            <Login onLogin={handleLogin} />
          } />
          <Route path="/register" element={
            <Register onRegister={handleLogin} />
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
