// Frontend-only API service (mock API calls)
const API_BASE_URL = 'http://localhost:5000/api';

// Mock API calls for frontend
const stocksAPI = {
  getRecommendations: async () => {
    // This will be replaced by real API in production
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [],
          message: 'Stock recommendations will load from API'
        });
      }, 1000);
    });
  },

  getRealTimeData: async (symbols) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = symbols.reduce((acc, symbol) => {
          acc[symbol] = {
            price: 0,
            change: 0,
            volume: 0
          };
          return acc;
        }, {});
        resolve(data);
      }, 500);
    });
  },

  placeOrder: async (orderData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          orderId: 'MOCK_' + Date.now(),
          message: 'Order placed successfully (mock)'
        });
      }, 1500);
    });
  }
};

const authAPI = {
  login: async (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          token: 'mock_token_' + Date.now(),
          user: {
            id: '1',
            name: 'Demo User',
            email: email,
            subscriptionStatus: 'trial',
            trialDays: 7
          }
        });
      }, 1000);
    });
  },

  register: async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          user: {
            id: Date.now().toString(),
            ...userData,
            subscriptionStatus: 'trial',
            trialDays: 7
          }
        });
      }, 1500);
    });
  }
};

const brokerAPI = {
  connectBroker: async (brokerId, credentials) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          brokerId,
          message: 'Broker connected successfully (mock)'
        });
      }, 2000);
    });
  },

  getHoldings: async (brokerId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          holdings: []
        });
      }, 1000);
    });
  }
};

export { stocksAPI, authAPI, brokerAPI, API_BASE_URL };