// Application constants
export const APP_CONSTANTS = {
  APP_NAME: 'VeloxTradeAI',
  APP_VERSION: '1.0.0',
  COMPANY_NAME: 'Velox Technologies',
  SUPPORT_EMAIL: 'support@veloxtradeai.com',
  SUPPORT_PHONE: '+91 9876543210',
  
  // Subscription plans
  SUBSCRIPTION_PLANS: {
    FREE_TRIAL: {
      id: 'free_trial',
      name: 'Free Trial',
      price: 0,
      duration: 7,
      features: ['3 Daily Signals', 'Basic Analysis', 'Email Alerts'],
      color: 'gray'
    },
    BASIC: {
      id: 'basic',
      name: 'Basic',
      price: 999,
      duration: 30,
      features: ['5 Daily Signals', 'Advanced Analysis', 'SMS Alerts', '1 Broker'],
      color: 'blue'
    },
    PRO: {
      id: 'pro',
      name: 'Pro',
      price: 1999,
      duration: 30,
      features: ['10 Daily Signals', 'AI Analysis', 'WhatsApp Alerts', '3 Brokers'],
      color: 'purple'
    },
    PREMIUM: {
      id: 'premium',
      name: 'Premium',
      price: 4999,
      duration: 30,
      features: ['Unlimited Signals', 'AI + ML Analysis', 'All Alerts', 'All Brokers'],
      color: 'orange'
    }
  },
  
  // Broker list
  BROKERS: [
    { id: 'zerodha', name: 'Zerodha', logo: 'Z', color: 'blue' },
    { id: 'upstox', name: 'Upstox', logo: 'U', color: 'purple' },
    { id: 'groww', name: 'Groww', logo: 'G', color: 'green' },
    { id: 'angel', name: 'Angel One', logo: 'A', color: 'red' },
    { id: 'choice', name: 'Choice', logo: 'C', color: 'orange' }
  ],
  
  // Stock exchanges
  EXCHANGES: {
    NSE: 'NSE',
    BSE: 'BSE'
  },
  
  // Trade types
  TRADE_TYPES: {
    INTRADAY: 'INTRADAY',
    SWING: 'SWING',
    POSITIONAL: 'POSITIONAL'
  },
  
  // Order types
  ORDER_TYPES: {
    MARKET: 'MARKET',
    LIMIT: 'LIMIT',
    SL: 'SL',
    SLM: 'SLM'
  },
  
  // Signal types
  SIGNAL_TYPES: {
    STRONG_BUY: 'STRONG_BUY',
    BUY: 'BUY',
    NEUTRAL: 'NEUTRAL',
    SELL: 'SELL',
    STRONG_SELL: 'STRONG_SELL'
  },
  
  // Risk levels
  RISK_LEVELS: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH'
  },
  
  // Time frames
  TIME_FRAMES: [
    '1min', '5min', '15min', '30min', '1hour', '4hour', 'daily'
  ],
  
  // Market hours
  MARKET_HOURS: {
    NSE: {
      PRE_OPEN: '9:00 - 9:15',
      REGULAR: '9:15 - 15:30',
      POST_CLOSE: '15:30 - 16:00'
    },
    BSE: {
      PRE_OPEN: '9:00 - 9:15',
      REGULAR: '9:15 - 15:30',
      POST_CLOSE: '15:30 - 16:00'
    }
  },
  
  // Default settings
  DEFAULT_SETTINGS: {
    RISK_PER_TRADE: 2, // 2%
    MAX_POSITIONS: 5,
    STOP_LOSS: 2, // 2%
    TARGET: 4, // 4%
    TRAILING_STOP: 1, // 1%
    AUTO_SQUARE_OFF: '15:20'
  }
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'velox_auth_token',
  USER_DATA: 'velox_user',
  USERS_LIST: 'velox_users',
  STOCKS_DATA: 'velox_stocks',
  TRADES_DATA: 'velox_trades',
  SETTINGS: 'velox_settings',
  PORTFOLIO: 'velox_portfolio',
  BROKER_CONNECTIONS: 'velox_broker_connections',
  LAST_LOGIN: 'velox_last_login'
};

// API endpoints (for future use)
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  
  // Stocks
  GET_RECOMMENDATIONS: '/api/stocks/recommendations',
  GET_REALTIME_DATA: '/api/stocks/realtime',
  GET_HISTORICAL_DATA: '/api/stocks/historical',
  
  // Trades
  PLACE_ORDER: '/api/trades/place',
  GET_ORDERS: '/api/trades/orders',
  GET_POSITIONS: '/api/trades/positions',
  
  // Portfolio
  GET_PORTFOLIO: '/api/portfolio',
  GET_HOLDINGS: '/api/portfolio/holdings',
  
  // Broker
  CONNECT_BROKER: '/api/broker/connect',
  DISCONNECT_BROKER: '/api/broker/disconnect',
  GET_BROKER_HOLDINGS: '/api/broker/holdings',
  
  // Subscription
  GET_PLANS: '/api/subscription/plans',
  SUBSCRIBE: '/api/subscription/subscribe'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_EXISTS: 'Email already registered.',
  INSUFFICIENT_BALANCE: 'Insufficient balance.',
  ORDER_FAILED: 'Order placement failed.',
  BROKER_CONNECTION_FAILED: 'Broker connection failed.',
  SUBSCRIPTION_EXPIRED: 'Subscription expired. Please renew.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  ORDER_PLACED: 'Order placed successfully!',
  BROKER_CONNECTED: 'Broker connected successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  SUBSCRIPTION_ACTIVE: 'Subscription activated successfully!'
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10}$/,
  PINCODE: /^[0-9]{6}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  AADHAAR: /^[0-9]{12}$/
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  DISPLAY_TIME: 'DD MMM YYYY, hh:mm A',
  API: 'YYYY-MM-DD',
  API_FULL: 'YYYY-MM-DDTHH:mm:ss'
};

export default APP_CONSTANTS;