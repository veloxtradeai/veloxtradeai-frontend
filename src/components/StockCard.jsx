import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Info, Target, Clock } from 'lucide-react';
import EntryPopup from './EntryPopup';
import ExitPopup from './ExitPopup';

const StockCard = ({ stock, onTrade }) => {
  const [showEntryPopup, setShowEntryPopup] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const getSignalColor = (signal) => {
    switch(signal.toLowerCase()) {
      case 'strong_buy': return 'bg-green-500';
      case 'buy': return 'bg-green-400';
      case 'neutral': return 'bg-yellow-500';
      case 'sell': return 'bg-red-400';
      case 'strong_sell': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getRiskBadge = (risk) => {
    const config = {
      low: { color: 'bg-green-100 text-green-800', label: 'Low' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      high: { color: 'bg-red-100 text-red-800', label: 'High' }
    };
    const cfg = config[risk.toLowerCase()] || config.medium;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold">{stock.symbol}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignalColor(stock.signal)} text-white`}>
                  {stock.signal.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600">{stock.companyName}</p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold">{formatPrice(stock.currentPrice)}</div>
              <div className={`flex items-center justify-end space-x-1 ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Target className="w-4 h-4 text-gray-400" />
                <span>Target: {formatPrice(stock.targetPrice)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Stop Loss: {formatPrice(stock.stopLoss)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Risk:</span>
                {getRiskBadge(stock.riskLevel)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Time Frame:</span>
                <span className="text-sm font-medium">{stock.timeFrame}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => setShowEntryPopup(true)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              Enter Trade
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-2">Analysis Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>RSI:</strong> {stock.indicators.rsi.toFixed(2)}</p>
                  <p><strong>Volume:</strong> {stock.indicators.volume.toLocaleString()}</p>
                </div>
                <div>
                  <p><strong>Market Cap:</strong> {stock.marketCap}</p>
                  <p><strong>Sector:</strong> {stock.sector}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{stock.reason}</p>
            </div>
          )}
        </div>
      </div>

      {showEntryPopup && (
        <EntryPopup
          stock={stock}
          onClose={() => setShowEntryPopup(false)}
          onSubmit={(data) => {
            onTrade('entry', data);
            setShowEntryPopup(false);
          }}
        />
      )}

      {showExitPopup && (
        <ExitPopup
          stock={stock}
          onClose={() => setShowExitPopup(false)}
          onSubmit={(data) => {
            onTrade('exit', data);
            setShowExitPopup(false);
          }}
        />
      )}
    </>
  );
};

export default StockCard;