import React, { useState } from 'react';
import { Check, ExternalLink, Key, Shield } from 'lucide-react';
import { useBroker } from '../hooks/useBroker';

const BrokerSelector = () => {
  const { brokers, connectBroker, disconnectBroker } = useBroker();
  const [selectedBroker, setSelectedBroker] = useState(null);

  const brokerConfigs = {
    zerodha: {
      name: 'Zerodha',
      logo: 'https://zerodha.com/static/images/logo.svg',
      color: 'bg-blue-500',
      description: 'India\'s largest stock broker',
      status: 'connected'
    },
    groww: {
      name: 'Groww',
      logo: 'https://groww.in/groww-logo-270.png',
      color: 'bg-green-500',
      description: 'Simple investing platform',
      status: 'disconnected'
    },
    upstox: {
      name: 'Upstox',
      logo: 'https://upstox.com/app/themes/upstox/dist/images/logo.svg',
      color: 'bg-purple-500',
      description: 'Fastest trading platform',
      status: 'connected'
    },
    angel: {
      name: 'Angel One',
      logo: 'https://www.angelone.in/static/media/Logo_Dark.3b5a6b21.svg',
      color: 'bg-red-500',
      description: 'Full-service broker',
      status: 'disconnected'
    },
    choice: {
      name: 'Choice',
      logo: 'https://www.choiceindia.com/images/logo.svg',
      color: 'bg-orange-500',
      description: 'Advanced trading platform',
      status: 'disconnected'
    }
  };

  const handleConnect = async (brokerId) => {
    try {
      await connectBroker(brokerId);
      // Redirect to broker OAuth URL
      window.location.href = `/api/broker/${brokerId}/auth`;
    } catch (error) {
      console.error('Failed to connect broker:', error);
    }
  };

  const handleDisconnect = async (brokerId) => {
    if (window.confirm(`Are you sure you want to disconnect ${brokerConfigs[brokerId]?.name}?`)) {
      try {
        await disconnectBroker(brokerId);
      } catch (error) {
        console.error('Failed to disconnect broker:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Connected Brokers</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          + Add New Broker
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(brokerConfigs).map(([brokerId, config]) => {
          const isConnected = config.status === 'connected';
          
          return (
            <div key={brokerId} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${config.color} rounded-lg flex items-center justify-center`}>
                    {isConnected ? (
                      <Shield className="w-6 h-6 text-white" />
                    ) : (
                      <Key className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{config.name}</h4>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                </div>
                
                {isConnected ? (
                  <button
                    onClick={() => setSelectedBroker(brokerId)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                ) : null}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isConnected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
                
                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(brokerId)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(brokerId)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Connect
                  </button>
                )}
              </div>
              
              {isConnected && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button className="w-full text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center space-x-1">
                    <span>View Holdings</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedBroker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {brokerConfigs[selectedBroker]?.name} Settings
              </h3>
              <button onClick={() => setSelectedBroker(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Broker-specific settings would go here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerSelector;