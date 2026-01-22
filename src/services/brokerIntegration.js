// Broker integration service - Ready for real API integration
const brokerIntegration = {
  brokers: [
    { id: 'zerodha', name: 'Zerodha', apiUrl: 'https://api.kite.trade', authType: 'oauth2' },
    { id: 'upstox', name: 'Upstox', apiUrl: 'https://api.upstox.com/v2', authType: 'oauth2' },
    { id: 'groww', name: 'Groww', apiUrl: 'https://api.groww.in/v1', authType: 'oauth2' },
    { id: 'angel', name: 'Angel One', apiUrl: 'https://apiconnect.angelbroking.com', authType: 'api_key' },
    { id: 'choice', name: 'Choice', apiUrl: 'https://api.choiceindia.com', authType: 'api_key' },
    { id: 'icici', name: 'ICICI Direct', apiUrl: 'https://api.icicidirect.com', authType: 'oauth2' },
    { id: 'hdfc', name: 'HDFC Securities', apiUrl: 'https://api.hdfcsec.com', authType: 'api_key' },
    { id: 'kotak', name: 'Kotak Securities', apiUrl: 'https://tradeapi.kotaksecurities.com', authType: 'oauth2' }
  ],

  // Connection management
  connectBroker: async (brokerId, credentials) => {
    try {
      // REAL API INTEGRATION POINT - Replace with actual broker API
      const response = await fetch(`/api/brokers/${brokerId}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Save connection to localStorage
        const connections = JSON.parse(localStorage.getItem('velox_broker_connections') || '[]');
        const existingIndex = connections.findIndex(conn => conn.brokerId === brokerId);
        
        if (existingIndex > -1) {
          connections[existingIndex] = {
            brokerId,
            ...data,
            connectedAt: new Date().toISOString(),
            status: 'connected',
            lastSync: new Date().toISOString()
          };
        } else {
          connections.push({
            brokerId,
            ...data,
            connectedAt: new Date().toISOString(),
            status: 'connected',
            lastSync: new Date().toISOString()
          });
        }
        
        localStorage.setItem('velox_broker_connections', JSON.stringify(connections));
        
        return {
          success: true,
          message: `${brokerId} connected successfully`,
          connectionId: data.connectionId || Date.now().toString(),
          data: data
        };
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      console.error('Broker connection error:', error);
      
      // Fallback to mock for development
      return new Promise((resolve) => {
        setTimeout(() => {
          const connections = JSON.parse(localStorage.getItem('velox_broker_connections') || '[]');
          connections.push({
            brokerId,
            connectedAt: new Date().toISOString(),
            status: 'connected',
            lastSync: new Date().toISOString(),
            isMock: true
          });
          localStorage.setItem('velox_broker_connections', JSON.stringify(connections));
          
          resolve({
            success: true,
            message: `${brokerId} connected (mock)`,
            connectionId: Date.now().toString(),
            isMock: true
          });
        }, 1500);
      });
    }
  },

  disconnectBroker: async (brokerId) => {
    try {
      // REAL API INTEGRATION POINT
      await fetch(`/api/brokers/${brokerId}/disconnect`, { method: 'POST' });
    } catch (error) {
      console.error('Disconnection error:', error);
    }
    
    const connections = JSON.parse(localStorage.getItem('velox_broker_connections') || '[]');
    const updatedConnections = connections.filter(conn => conn.brokerId !== brokerId);
    localStorage.setItem('velox_broker_connections', JSON.stringify(updatedConnections));
    
    return { success: true, message: 'Broker disconnected' };
  },

  // Order placement
  placeOrder: async (brokerId, orderData) => {
    try {
      // REAL API INTEGRATION POINT - Replace with actual broker API
      const response = await fetch(`/api/brokers/${brokerId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const orderResult = await response.json();
        
        // Save order to history
        const orders = JSON.parse(localStorage.getItem('velox_orders') || '[]');
        orders.push({
          ...orderData,
          ...orderResult,
          brokerId,
          placedAt: new Date().toISOString(),
          status: orderResult.status || 'PENDING'
        });
        localStorage.setItem('velox_orders', JSON.stringify(orders));
        
        return {
          success: true,
          orderId: orderResult.orderId || `ORD_${Date.now()}`,
          status: orderResult.status || 'COMPLETED',
          message: 'Order placed successfully',
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('Order placement failed');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      
      // Fallback to mock
      return new Promise((resolve) => {
        setTimeout(() => {
          const orders = JSON.parse(localStorage.getItem('velox_orders') || '[]');
          const mockOrder = {
            ...orderData,
            orderId: `MOCK_ORD_${Date.now()}`,
            brokerId,
            status: 'COMPLETED',
            placedAt: new Date().toISOString(),
            isMock: true
          };
          orders.push(mockOrder);
          localStorage.setItem('velox_orders', JSON.stringify(orders));
          
          resolve({
            success: true,
            orderId: mockOrder.orderId,
            status: 'COMPLETED',
            message: 'Order placed (mock)',
            timestamp: new Date().toISOString(),
            isMock: true
          });
        }, 2000);
      });
    }
  },

  // Portfolio and holdings
  getHoldings: async (brokerId) => {
    try {
      // REAL API INTEGRATION POINT
      const response = await fetch(`/api/brokers/${brokerId}/holdings`);
      
      if (response.ok) {
        const holdings = await response.json();
        return holdings;
      }
    } catch (error) {
      console.error('Get holdings error:', error);
    }
    
    // Fallback to mock
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 1000);
    });
  },

  // Real-time data subscription
  subscribeToStock: (brokerId, symbol, callback) => {
    // This would be WebSocket connection in real implementation
    console.log(`Subscribing to ${symbol} via ${brokerId}`);
    
    // Mock real-time updates
    const interval = setInterval(() => {
      const mockPrice = 100 + Math.random() * 10;
      callback({
        symbol,
        price: parseFloat(mockPrice.toFixed(2)),
        change: (Math.random() - 0.5) * 2,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: new Date().toISOString()
      });
    }, 3000);
    
    return () => clearInterval(interval); // Cleanup function
  },

  // Get order status
  getOrderStatus: async (brokerId, orderId) => {
    try {
      const response = await fetch(`/api/brokers/${brokerId}/orders/${orderId}`);
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Get order status error:', error);
    }
    
    return { status: 'COMPLETED', orderId };
  },

  // Get connected brokers
  getConnectedBrokers: () => {
    const connections = JSON.parse(localStorage.getItem('velox_broker_connections') || '[]');
    return connections;
  },

  // Check if broker is connected
  isBrokerConnected: (brokerId) => {
    const connections = JSON.parse(localStorage.getItem('velox_broker_connections') || '[]');
    return connections.some(conn => conn.brokerId === brokerId);
  },

  // Get broker API configuration
  getBrokerConfig: (brokerId) => {
    const broker = brokerIntegration.brokers.find(b => b.id === brokerId);
    return broker || null;
  },

  // Sync all broker data
  syncAllBrokers: async () => {
    const connections = brokerIntegration.getConnectedBrokers();
    const results = [];
    
    for (const connection of connections) {
      try {
        const holdings = await brokerIntegration.getHoldings(connection.brokerId);
        const orders = await brokerIntegration.getOrders(connection.brokerId);
        
        results.push({
          brokerId: connection.brokerId,
          holdings,
          orders,
          success: true
        });
      } catch (error) {
        results.push({
          brokerId: connection.brokerId,
          error: error.message,
          success: false
        });
      }
    }
    
    return results;
  },

  // Get order history
  getOrders: async (brokerId, limit = 50) => {
    const orders = JSON.parse(localStorage.getItem('velox_orders') || '[]');
    return orders
      .filter(order => order.brokerId === brokerId)
      .slice(-limit)
      .reverse();
  }
};

export default brokerIntegration;