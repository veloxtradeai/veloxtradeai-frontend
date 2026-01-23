import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

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

  const loadBrokers = useCallback(() => {
    const availableBrokers = [
      { id: 'zerodha', name: 'Zerodha', logo: 'Z', color: 'blue', description: 'Largest stock broker in India' },
      { id: 'upstox', name: 'Upstox', logo: 'U', color: 'purple', description: 'Fastest trading platform' },
      { id: 'groww', name: 'Groww', logo: 'G', color: 'green', description: 'Simple investing platform' },
      { id: 'angel', name: 'Angel One', logo: 'A', color: 'red', description: 'Full-service broker' },
      { id: 'choice', name: 'Choice', logo: 'C', color: 'orange', description: 'Advanced trading tools' }
    ];
    
    setBrokers(availableBrokers);
  }, []);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const result = await api.broker.getBrokers();
      
      if (result.success && result.brokers) {
        setConnectedBrokers(result.brokers);
      } else {
        setConnectedBrokers([]);
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
      setConnectedBrokers([]);
    } finally {
      setLoading(false);
    }
  };

  const connectBroker = async (brokerData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.broker.connectBroker(brokerData);
      
      if (result.success) {
        await loadConnections();
        return { success: true, message: result.message };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
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
      // For now, just update local state
      const updated = connectedBrokers.filter(b => b.id !== brokerId);
      setConnectedBrokers(updated);
      
      return { success: true, message: 'Broker disconnected' };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const syncHoldings = async (brokerId) => {
    setLoading(true);
    
    try {
      // Get portfolio data
      const result = await api.portfolio.getAnalytics();
      
      if (result.success && result.portfolio) {
        // Filter holdings by broker if needed
        const brokerHoldings = (result.portfolio.holdings || []).filter(h => h.brokerId === brokerId);
        setHoldings(brokerHoldings);
        
        return { success: true, holdings: brokerHoldings };
      } else {
        setHoldings([]);
        return { success: false, error: 'No holdings found' };
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
      const result = await api.portfolio.getAnalytics();
      
      if (result.success && result.portfolio) {
        setHoldings(result.portfolio.holdings || []);
        return { success: true, holdings: result.portfolio.holdings || [] };
      } else {
        setHoldings([]);
        return { success: false, error: 'No holdings found' };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (orderData) => {
    setLoading(true);
    
    try {
      const result = await api.broker.placeOrder(orderData);
      
      if (result.success) {
        return { success: true, order: result };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getBrokerStatus = (brokerId) => {
    return connectedBrokers.some(conn => conn.id === brokerId);
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
