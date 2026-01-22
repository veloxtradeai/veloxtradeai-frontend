// Local storage service for frontend
const storageService = {
  // User data
  user: {
    save: (userData) => {
      localStorage.setItem('velox_user', JSON.stringify(userData));
    },
    
    get: () => {
      const user = localStorage.getItem('velox_user');
      return user ? JSON.parse(user) : null;
    },
    
    remove: () => {
      localStorage.removeItem('velox_user');
    }
  },

  // Stock data
  stocks: {
    saveRecommendations: (stocks) => {
      localStorage.setItem('velox_stock_recommendations', JSON.stringify(stocks));
      localStorage.setItem('velox_stocks_last_updated', new Date().toISOString());
    },
    
    getRecommendations: () => {
      const stocks = localStorage.getItem('velox_stock_recommendations');
      return stocks ? JSON.parse(stocks) : [];
    },
    
    getLastUpdated: () => {
      return localStorage.getItem('velox_stocks_last_updated');
    }
  },

  // Trades
  trades: {
    save: (trades) => {
      localStorage.setItem('velox_trades', JSON.stringify(trades));
    },
    
    get: () => {
      const trades = localStorage.getItem('velox_trades');
      return trades ? JSON.parse(trades) : [];
    },
    
    add: (trade) => {
      const trades = storageService.trades.get();
      trades.push({
        ...trade,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      });
      storageService.trades.save(trades);
    }
  },

  // Settings
  settings: {
    save: (settings) => {
      localStorage.setItem('velox_settings', JSON.stringify(settings));
    },
    
    get: () => {
      const settings = localStorage.getItem('velox_settings');
      return settings ? JSON.parse(settings) : {
        notifications: true,
        autoTrade: false,
        riskLevel: 'medium',
        theme: 'light'
      };
    }
  },

  // Portfolio
  portfolio: {
    save: (portfolio) => {
      localStorage.setItem('velox_portfolio', JSON.stringify(portfolio));
    },
    
    get: () => {
      const portfolio = localStorage.getItem('velox_portfolio');
      return portfolio ? JSON.parse(portfolio) : {
        totalValue: 0,
        dailyPnl: 0,
        holdings: []
      };
    }
  },

  // Clear all data
  clearAll: () => {
    const keysToKeep = ['velox_users'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
  },

  // Export all data
  exportData: () => {
    const data = {
      user: storageService.user.get(),
      trades: storageService.trades.get(),
      settings: storageService.settings.get(),
      portfolio: storageService.portfolio.get(),
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    return dataUri;
  }
};

export default storageService;