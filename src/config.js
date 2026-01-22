const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Broker Configuration
  BROKERS: {
    ZERODHA: 'zerodha',
    GROWW: 'groww',
    UPSTOX: 'upstox',
    ANGEL: 'angel',
    CHOICE: 'choice',
    NIFTY_CORE: 'nifty_core'
  },
  
  // Stock Exchange
  EXCHANGES: {
    NSE: 'NSE',
    BSE: 'BSE'
  },
  
  // Trade Types
  TRADE_TYPES: {
    INTRADAY: 'intraday',
    SWING: 'swing',
    POSITIONAL: 'positional'
  },
  
  // Subscription Plans
  PLANS: {
    FREE: { id: 1, name: 'Free Trial', price: 0, duration: '7 days' },
    BASIC: { id: 2, name: 'Basic', price: 999, duration: 'month' },
    PRO: { id: 3, name: 'Pro', price: 1999, duration: 'month', popular: true },
    PREMIUM: { id: 4, name: 'Premium', price: 4999, duration: '3 months' }
  },
  
  // App Settings
  APP_NAME: 'VeloxTradeAI',
  VERSION: '2.0.0',
  
  // Time Intervals for Real-time Updates (in seconds)
  UPDATE_INTERVALS: {
    STOCK_DATA: 30,
    PORTFOLIO: 60,
    RECOMMENDATIONS: 300,
    LIVE_PRICES: 10
  },
  
  // Default Settings
  DEFAULTS: {
    RISK_LEVEL: 'medium',
    CAPITAL: 100000,
    MAX_POSITIONS: 5,
    STOP_LOSS: 2, // in percentage
    TARGET_PROFIT: 4 // in percentage
  },

  // Mobile-specific settings
  MOBILE: {
    MIN_WIDTH: 320,
    BREAKPOINTS: {
      SM: 640,
      MD: 768,
      LG: 1024,
      XL: 1280
    }
  },

  // Chart Configuration
  CHART: {
    COLORS: {
      UP: '#10b981',
      DOWN: '#ef4444',
      NEUTRAL: '#6b7280'
    },
    PERIODS: ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL']
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'velox_auth_token',
    USER_DATA: 'velox_user',
    THEME: 'velox_theme',
    BROKER_SETTINGS: 'velox_broker_settings',
    WATCHLIST: 'velox_watchlist'
  }
};

export default config;