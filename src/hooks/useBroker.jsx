import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import brokerIntegration from '../services/brokerIntegration';
import storageService from '../services/storageService';

const BrokerContext = createContext();

export const useBroker = () => {
  const context = useContext(BrokerContext);
  if (!context) {
    throw new Error('useBroker must be used within a BrokerProvider');
  }
  return context;
};

export const BrokerProvider = ({ children }) => {
  const [brokers, setBrokers] = useState([]);
  const [connectedBrokers, setConnectedBrokers] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load brokers and connections on mount
  useEffect(() => {
    loadBrokers();
    loadConnections();
  }, []);

  const loadBrokers = () => {
    const availableBrokers = [
      { id: 'zerodha', name: 'Zerodha', logo: 'Z', color: 'blue', description: 'Largest stock broker in India' },
      { id: 'upstox', name: 'Upstox', logo: 'U', color: 'purple', description: 'Fastest trading platform' },
      { id: 'groww', name: 'Groww', logo: 'G', color: 'green', description: 'Simple investing platform' },
      { id: 'angel', name: 'Angel One', logo: 'A', color: 'red', description: 'Full-service broker' },
      { id: 'choice', name: 'Choice', logo: 'C', color: 'orange', description: 'Advanced trading tools' }
    ];
    
    setBrokers(availableBrokers);
  };

  const loadConnections = () => {
    const connections = brokerIntegration.getConnectedBrokers();
    setConnectedBrokers(connections);
    
    // Load holdings from localStorage
    const savedHoldings = storageService.portfolio.get().holdings;
    setHoldings(savedHoldings);
  };

  const connectBroker = async (brokerId, credentials = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await brokerIntegration.connectBroker(brokerId, credentials);
      
      if (result.success) {
        // Update connections list
        const connections = brokerIntegration.getConnectedBrokers();
        setConnectedBrokers(connections);
        
        return { success: true, message: result.message };
      } else {
        throw new Error(result.message || 'Connection failed');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const disconnectBroker = async (brokerId) => {
    try {
      const result = await brokerIntegration.disconnectBroker(brokerId);
      
      if (result.success) {
        const connections = brokerIntegration.getConnectedBrokers();
        setConnectedBrokers(connections);
        
        // Remove holdings from this broker
        const updatedHoldings = holdings.filter(h => h.brokerId !== brokerId);
        setHoldings(updatedHoldings);
        
        return { success: true, message: result.message };
      } else {
        throw new Error(result.message || 'Disconnection failed');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const syncHoldings = async (brokerId) => {
    setLoading(true);
    
    try {
      const result = await brokerIntegration.getHoldings(brokerId);
      
      if (result.success) {
        // Update holdings state
        const brokerHoldings = result.holdings.map(h => ({
          ...h,
          brokerId,
          lastSynced: new Date().toISOString()
        }));
        
        // Update holdings
        const otherHoldings = holdings.filter(h => h.brokerId !== brokerId);
        const updatedHoldings = [...otherHoldings, ...brokerHoldings];
        
        setHoldings(updatedHoldings);
        
        // Update portfolio in storage
        const portfolio = storageService.portfolio.get();
        portfolio.holdings = updatedHoldings;
        storageService.portfolio.save(portfolio);
        
        return { success: true, holdings: updatedHoldings };
      } else {
        throw new Error('Failed to sync holdings');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const syncAllHoldings = async () => {
    setLoading(true);
    
    try {
      const syncPromises = connectedBrokers.map(conn => 
        brokerIntegration.getHoldings(conn.brokerId)
      );
      
      const results = await Promise.all(syncPromises);
      
      let allHoldings = [];
      results.forEach((result, index) => {
        if (result.success) {
          const brokerId = connectedBrokers[index].brokerId;
          const brokerHoldings = result.holdings.map(h => ({
            ...h,
            brokerId,
            lastSynced: new Date().toISOString()
          }));
          allHoldings = [...allHoldings, ...brokerHoldings];
        }
      });
      
      setHoldings(allHoldings);
      
      // Update portfolio in storage
      const portfolio = storageService.portfolio.get();
      portfolio.holdings = allHoldings;
      storageService.portfolio.save(portfolio);
      
      return { success: true, holdings: allHoldings };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (brokerId, orderData) => {
    setLoading(true);
    
    try {
      const result = await brokerIntegration.placeOrder(brokerId, orderData);
      
      if (result.success) {
        // Update holdings if needed
        if (orderData.action === 'BUY') {
          const newHolding = {
            id: result.orderId,
            symbol: orderData.symbol,
            quantity: orderData.quantity,
            averagePrice: orderData.price,
            currentPrice: orderData.price,
            brokerId,
            tradeType: orderData.type || 'INTRADAY'
          };
          
          const updatedHoldings = [...holdings, newHolding];
          setHoldings(updatedHoldings);
          
          // Update portfolio
          const portfolio = storageService.portfolio.get();
          portfolio.holdings = updatedHoldings;
          storageService.portfolio.save(portfolio);
        }
        
        return { success: true, order: result };
      } else {
        throw new Error(result.message || 'Order placement failed');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getBrokerStatus = (brokerId) => {
    return connectedBrokers.some(conn => conn.brokerId === brokerId);
  };

  const value = {
    brokers,
    connectedBrokers,
    holdings,
    loading,
    error,
    
    // Methods
    connectBroker,
    disconnectBroker,
    syncHoldings,
    syncAllHoldings,
    placeOrder,
    getBrokerStatus,
    
    // Helper
    hasConnectedBrokers: connectedBrokers.length > 0
  };

  return (
    <BrokerContext.Provider value={value}>
      {children}
    </BrokerContext.Provider>
  );
};