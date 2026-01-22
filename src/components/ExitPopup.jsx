import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, TrendingUp, TrendingDown, Target, DollarSign, Clock, BarChart3, Percent, Zap } from 'lucide-react';
import brokerIntegration from '../services/brokerIntegration';

const ExitPopup = ({ stock, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    exitPrice: stock.currentPrice || 0,
    exitReason: '',
    exitType: 'target_hit',
    exitQuantity: stock.quantity || 1,
    partialExit: false,
    trailingExit: false,
    notes: ''
  });

  const [realTimePrice, setRealTimePrice] = useState(stock.currentPrice || 0);
  const [priceTrend, setPriceTrend] = useState('stable');
  const [exitSuggestions, setExitSuggestions] = useState([]);
  const [orderStatus, setOrderStatus] = useState('ready');

  // Real-time price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (stock.currentPrice) {
        const randomChange = (Math.random() - 0.5) * 0.15; // ±0.15% change
        const newPrice = stock.currentPrice * (1 + randomChange);
        setRealTimePrice(parseFloat(newPrice.toFixed(2)));
        
        // Determine trend
        if (newPrice > stock.currentPrice * 1.02) {
          setPriceTrend('bullish');
        } else if (newPrice < stock.currentPrice * 0.98) {
          setPriceTrend('bearish');
        } else {
          setPriceTrend('stable');
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [stock.currentPrice]);

  // Auto-suggest exit strategies
  useEffect(() => {
    if (!stock.entryPrice || !realTimePrice) return;

    const suggestions = [];
    const currentProfitPercent = ((realTimePrice - stock.entryPrice) / stock.entryPrice * 100);
    const holdingHours = stock.holdingPeriod ? parseInt(stock.holdingPeriod) : 1;

    // Suggest based on profit percentage
    if (currentProfitPercent >= 5) {
      suggestions.push({
        type: 'take_profit',
        title: 'Take Profit (5%+)',
        description: 'Good profit achieved. Consider booking partial profit.',
        exitType: 'partial_exit',
        exitPercent: 50,
        reason: 'achieved_target'
      });
    }

    if (currentProfitPercent <= -2) {
      suggestions.push({
        type: 'cut_loss',
        title: 'Cut Loss (-2%)',
        description: 'Stop loss triggered. Exit to minimize further loss.',
        exitType: 'full_exit',
        exitPercent: 100,
        reason: 'stop_loss_hit'
      });
    }

    // Time-based suggestions
    if (holdingHours >= 3 && currentProfitPercent > 0) {
      suggestions.push({
        type: 'time_based',
        title: 'Time Exit',
        description: 'Held for sufficient time. Consider exiting.',
        exitType: 'full_exit',
        exitPercent: 100,
        reason: 'time_based'
      });
    }

    // Volatility suggestion
    if (Math.abs(currentProfitPercent) > 8) {
      suggestions.push({
        type: 'volatility',
        title: 'High Volatility',
        description: 'High price movement detected. Secure profits.',
        exitType: 'partial_exit',
        exitPercent: 75,
        reason: 'market_volatility'
      });
    }

    setExitSuggestions(suggestions);
  }, [realTimePrice, stock.entryPrice, stock.holdingPeriod]);

  const handleAutoExit = async (suggestion) => {
    setOrderStatus('placing');
    
    const exitData = {
      ...formData,
      exitPrice: realTimePrice,
      exitReason: suggestion.reason,
      exitType: suggestion.type,
      exitQuantity: Math.floor((suggestion.exitPercent / 100) * (stock.quantity || 1)),
      exitStrategy: 'auto_suggested'
    };

    try {
      // Place sell order through broker
      const orderResult = await brokerIntegration.placeOrder(stock.broker || 'zerodha', {
        symbol: stock.symbol,
        exchange: stock.exchange || 'NSE',
        transactionType: 'SELL',
        orderType: 'MARKET',
        quantity: exitData.exitQuantity,
        price: realTimePrice,
        productType: 'INTRADAY'
      });

      if (orderResult.success) {
        handleSubmit(exitData, orderResult.orderId);
      }
    } catch (error) {
      console.error('Exit order failed:', error);
      setOrderStatus('failed');
    }
  };

  const handleSubmit = (customData = null, orderId = null) => {
    const data = customData || formData;
    
    const profitLoss = data.exitPrice - stock.entryPrice;
    const profitLossPercent = ((profitLoss / stock.entryPrice) * 100).toFixed(2);
    const totalPnL = profitLoss * data.exitQuantity;

    const exitData = {
      ...data,
      stockSymbol: stock.symbol,
      exitDate: new Date().toISOString(),
      profitLoss,
      profitLossPercent,
      totalPnL,
      orderId: orderId || `EXIT_${Date.now()}`,
      holdingPeriod: stock.holdingPeriod || calculateHoldingPeriod(),
      entryPrice: stock.entryPrice,
      maxPrice: stock.maxPrice || realTimePrice,
      minPrice: stock.minPrice || realTimePrice
    };

    onSubmit(exitData);
    setOrderStatus('success');
    
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const calculateHoldingPeriod = () => {
    if (!stock.entryDate) return 'N/A';
    const entry = new Date(stock.entryDate);
    const now = new Date();
    const hours = Math.floor((now - entry) / (1000 * 60 * 60));
    return `${hours} hours`;
  };

  const getExitRecommendation = () => {
    const profitPercent = ((realTimePrice - stock.entryPrice) / stock.entryPrice * 100);
    
    if (profitPercent >= 4) return {
      type: 'strong_buy',
      text: 'Strong Profit - Consider Booking',
      color: 'text-green-600',
      bg: 'bg-green-50',
      icon: <TrendingUp className="w-4 h-4" />
    };
    if (profitPercent >= 2) return {
      type: 'hold',
      text: 'Moderate Profit - Hold or Book Partial',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      icon: <Clock className="w-4 h-4" />
    };
    if (profitPercent <= -2) return {
      type: 'sell',
      text: 'Stop Loss Hit - Exit Now',
      color: 'text-red-600',
      bg: 'bg-red-50',
      icon: <AlertTriangle className="w-4 h-4" />
    };
    
    return {
      type: 'neutral',
      text: 'Neutral - Monitor Closely',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: <BarChart3 className="w-4 h-4" />
    };
  };

  const recommendation = getExitRecommendation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Exit Trade - {stock.symbol}</h2>
                <p className="text-sm text-gray-600">Manage your position</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real-time Status Bar */}
          <div className={`p-3 rounded-lg mb-4 ${recommendation.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {recommendation.icon}
                <span className={`font-medium ${recommendation.color}`}>
                  {recommendation.text}
                </span>
              </div>
              <div className={`text-lg font-bold ${realTimePrice >= stock.entryPrice ? 'text-green-600' : 'text-red-600'}`}>
                {realTimePrice >= stock.entryPrice ? '+' : ''}
                {((realTimePrice - stock.entryPrice) / stock.entryPrice * 100).toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Quick Exit Suggestions */}
          {exitSuggestions.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2 flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Quick Exit Suggestions</span>
              </h3>
              <div className="space-y-2">
                {exitSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleAutoExit(suggestion)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      suggestion.type === 'take_profit' 
                        ? 'border-green-200 bg-green-50 hover:bg-green-100'
                        : suggestion.type === 'cut_loss'
                        ? 'border-red-200 bg-red-50 hover:bg-red-100'
                        : 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{suggestion.title}</p>
                        <p className="text-xs text-gray-600">{suggestion.description}</p>
                      </div>
                      <div className="text-sm font-medium">
                        {suggestion.exitPercent}% Exit
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="space-y-4">
              {/* Trade Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-3">Trade Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Entry Price:</p>
                    <p className="font-medium">₹{stock.entryPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Current Price:</p>
                    <p className="font-medium">₹{realTimePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Quantity:</p>
                    <p className="font-medium">{stock.quantity || 1} shares</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Holding:</p>
                    <p className="font-medium">{calculateHoldingPeriod()}</p>
                  </div>
                </div>
              </div>

              {/* Exit Configuration */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exit Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.exitPrice}
                    onChange={(e) => setFormData({ ...formData, exitPrice: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <div className="flex justify-between mt-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, exitPrice: realTimePrice })}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Use Current (₹{realTimePrice.toFixed(2)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, exitPrice: stock.targetPrice || (stock.entryPrice * 1.04) })}
                      className="text-xs text-green-600 hover:text-green-800"
                    >
                      Use Target (₹{(stock.targetPrice || (stock.entryPrice * 1.04)).toFixed(2)})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exit Quantity</label>
                    <select
                      value={formData.exitQuantity}
                      onChange={(e) => setFormData({ ...formData, exitQuantity: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={stock.quantity || 1}>Full ({stock.quantity || 1} shares)</option>
                      <option value={Math.floor((stock.quantity || 1) * 0.5)}>Half ({(stock.quantity || 1) * 0.5} shares)</option>
                      <option value={Math.floor((stock.quantity || 1) * 0.25)}>Quarter ({(stock.quantity || 1) * 0.25} shares)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exit Type</label>
                    <select
                      value={formData.exitType}
                      onChange={(e) => setFormData({ ...formData, exitType: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="target_hit">Target Hit</option>
                      <option value="stop_loss_hit">Stop Loss Hit</option>
                      <option value="partial_profit">Partial Profit</option>
                      <option value="market_condition">Market Condition</option>
                      <option value="manual_exit">Manual Exit</option>
                      <option value="time_based">Time Based</option>
                      <option value="trailing_exit">Trailing Exit</option>
                    </select>
                  </div>
                </div>

                {formData.exitType === 'partial_profit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exit Percentage</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={Math.floor((formData.exitQuantity / (stock.quantity || 1)) * 100)}
                      onChange={(e) => {
                        const percent = parseInt(e.target.value);
                        const quantity = Math.floor(((stock.quantity || 1) * percent) / 100);
                        setFormData({ ...formData, exitQuantity: quantity });
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1%</span>
                      <span className="font-medium">
                        {Math.floor((formData.exitQuantity / (stock.quantity || 1)) * 100)}%
                      </span>
                      <span>100%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Options */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-3">Advanced Exit Options</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="trailingExit"
                        checked={formData.trailingExit}
                        onChange={(e) => setFormData({ ...formData, trailingExit: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="trailingExit" className="text-sm">
                        Trailing Stop Loss Exit
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="partialExit"
                        checked={formData.partialExit}
                        onChange={(e) => setFormData({ ...formData, partialExit: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="partialExit" className="text-sm">
                        Schedule Partial Exit
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exit Reason</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Why are you exiting this trade? (e.g., target achieved, market turned, news event)"
                      rows="2"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* P&L Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-medium mb-3">Exit Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Profit/Loss:</span>
                    <span className={`text-lg font-bold ${formData.exitPrice >= stock.entryPrice ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{(formData.exitPrice - stock.entryPrice).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Profit/Loss %:</span>
                    <span className={`text-lg font-bold ${formData.exitPrice >= stock.entryPrice ? 'text-green-600' : 'text-red-600'}`}>
                      {(((formData.exitPrice - stock.entryPrice) / stock.entryPrice) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total P&L:</span>
                    <span className={`text-xl font-bold ${(formData.exitPrice - stock.entryPrice) * formData.exitQuantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{((formData.exitPrice - stock.entryPrice) * formData.exitQuantity).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Performance Indicator */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span>Performance:</span>
                      <div className={`px-3 py-1 rounded-full ${
                        ((formData.exitPrice - stock.entryPrice) / stock.entryPrice * 100) >= 3 
                          ? 'bg-green-100 text-green-800'
                          : ((formData.exitPrice - stock.entryPrice) / stock.entryPrice * 100) <= -2
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {((formData.exitPrice - stock.entryPrice) / stock.entryPrice * 100) >= 3 ? 'Excellent' :
                         ((formData.exitPrice - stock.entryPrice) / stock.entryPrice * 100) <= -2 ? 'Poor' : 'Average'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  disabled={orderStatus === 'placing'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderStatus === 'placing'}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                    orderStatus === 'placing'
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white'
                  }`}
                >
                  {orderStatus === 'placing' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Exiting...</span>
                    </>
                  ) : orderStatus === 'success' ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Exit Successful!</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-5 h-5" />
                      <span>Exit Trade</span>
                    </>
                  )}
                </button>
              </div>

              {/* Market Status */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      priceTrend === 'bullish' ? 'bg-green-500' :
                      priceTrend === 'bearish' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span>Market: {priceTrend === 'bullish' ? 'Bullish' : priceTrend === 'bearish' ? 'Bearish' : 'Neutral'}</span>
                  </div>
                  <span>Real-time updates active</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExitPopup;