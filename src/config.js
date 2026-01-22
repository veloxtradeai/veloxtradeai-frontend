// src/config.js
const config = {
  // API URLs
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://veloxtradeai-api.velox-trade-ai.workers.dev',
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'https://veloxtradeai-frontend.pages.dev',
  
  // App Info
  APP_NAME: import.meta.env.VITE_APP_NAME || 'VeloxTradeAI',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'production',
  
  // Trading Settings
  MAX_RISK_PER_TRADE: parseFloat(import.meta.env.VITE_MAX_RISK_PER_TRADE) || 2.5,
  MIN_CONFIDENCE: parseInt(import.meta.env.VITE_MIN_CONFIDENCE) || 85,
  SIGNAL_EXPIRE_MINUTES: parseInt(import.meta.env.VITE_SIGNAL_EXPIRE_MINUTES) || 15,
  
  // Market Hours
  MARKET_OPEN_HOUR: parseInt(import.meta.env.VITE_MARKET_OPEN_HOUR) || 9,
  MARKET_CLOSE_HOUR: parseInt(import.meta.env.VITE_MARKET_CLOSE_HOUR) || 15,
  MARKET_DAYS: (import.meta.env.VITE_MARKET_DAYS || '1,2,3,4,5').split(',').map(Number),
  
  // Feature Flags
  ENABLE_REALTIME_SIGNALS: import.meta.env.VITE_ENABLE_REALTIME_SIGNALS === 'true',
  ENABLE_AUTO_ADJUST: import.meta.env.VITE_ENABLE_AUTO_ADJUST === 'true',
  ENABLE_BROKER_INTEGRATION: import.meta.env.VITE_ENABLE_BROKER_INTEGRATION === 'true',
  ENABLE_PUSH_NOTIFICATIONS: import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true',
  
  // WebSocket
  WS_RECONNECT_INTERVAL: parseInt(import.meta.env.VITE_WS_RECONNECT_INTERVAL) || 5000,
  WS_HEARTBEAT_INTERVAL: parseInt(import.meta.env.VITE_WS_HEARTBEAT_INTERVAL) || 30000,
  
  // Performance
  CACHE_TTL: parseInt(import.meta.env.VITE_CACHE_TTL) || 300000,
  DATA_FETCH_INTERVAL: parseInt(import.meta.env.VITE_DATA_FETCH_INTERVAL) || 30000,
  
  // Debug
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // Broker URLs
  ZERODHA_REDIRECT_URI: import.meta.env.VITE_ZERODHA_REDIRECT_URI,
  ANGEL_REDIRECT_URI: import.meta.env.VITE_ANGEL_REDIRECT_URI,
};

export default config;
