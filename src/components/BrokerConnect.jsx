import React, { useState } from 'react';
import { brokerAPI } from '../services/api';

const BrokerConnect = () => {
  const [brokerType, setBrokerType] = useState('zerodha');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleConnect = async () => {
    if (!apiKey) {
      setMessage('API Key is required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Get current user ID (from localStorage or context)
      const userId = localStorage.getItem('user_id') || 'temp-user';
      
      const brokerData = {
        user_id: userId,
        broker_name: brokerType,
        api_key: apiKey,
        api_secret: apiSecret,
        access_token: accessToken
      };

      const response = await brokerAPI.connectBroker(brokerData);
      
      if (response.success) {
        setMessage('✅ Broker connected successfully!');
        
        // Save broker info
        localStorage.setItem('broker_connected', 'true');
        localStorage.setItem('broker_type', brokerType);
        localStorage.setItem('broker_id', response.broker_id);
        
        // Clear form
        setApiKey('');
        setApiSecret('');
        setAccessToken('');
        
        // Refresh page after 2 seconds
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error) {
      setMessage(`❌ Connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const brokerInstructions = {
    zerodha: {
      steps: [
        '1. Login to Zerodha Kite',
        '2. Go to API section',
        '3. Create new API key',
        '4. Copy API Key & Secret',
        '5. Generate access token'
      ],
      link: 'https://kite.trade'
    },
    angel: {
      steps: [
        '1. Login to Angel Broking',
        '2. Navigate to API section',
        '3. Generate API credentials',
        '4. Use Client ID as API Key',
        '5. Use PIN as API Secret'
      ],
      link: 'https://www.angelbroking.com'
    },
    upstox: {
      steps: [
        '1. Login to Upstox',
        '2. Go to Developer section',
        '3. Create new app',
        '4. Get API Key & Secret',
        '5. Authorize app'
      ],
      link: 'https://upstox.com'
    }
  };

  return (
    <div className="broker-connect">
      <h3>Connect Your Broker</h3>
      
      <div className="broker-selection">
        <label>Select Broker:</label>
        <div className="broker-options">
          {['zerodha', 'angel', 'upstox'].map(broker => (
            <button
              key={broker}
              className={`broker-btn ${brokerType === broker ? 'active' : ''}`}
              onClick={() => setBrokerType(broker)}
            >
              {broker.charAt(0).toUpperCase() + broker.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="instructions">
        <h4>Steps to Connect:</h4>
        <ul>
          {brokerInstructions[brokerType].steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
        <a 
          href={brokerInstructions[brokerType].link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="broker-link"
        >
          Go to {brokerType} website →
        </a>
      </div>

      <div className="api-form">
        <div className="form-group">
          <label>API Key *</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API Key"
          />
        </div>

        <div className="form-group">
          <label>API Secret</label>
          <input
            type="password"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            placeholder="Enter API Secret"
          />
        </div>

        <div className="form-group">
          <label>Access Token (if required)</label>
          <input
            type="text"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Enter Access Token"
          />
        </div>

        <button 
          className="connect-btn" 
          onClick={handleConnect}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Broker'}
        </button>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="features-note">
        <h4>After Connection You Get:</h4>
        <ul>
          <li>✅ Real-time market data from broker</li>
          <li>✅ Direct order placement</li>
          <li>✅ Portfolio synchronization</li>
          <li>✅ Live P&L tracking</li>
          <li>✅ Advanced charting</li>
        </ul>
      </div>
    </div>
  );
};

export default BrokerConnect;
