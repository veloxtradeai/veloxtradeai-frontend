import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Loading VeloxTradeAI</h2>
        <p className="text-gray-400">Initializing AI Trading Engine...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
