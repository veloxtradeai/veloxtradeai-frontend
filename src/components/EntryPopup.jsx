import React, { useState, useEffect } from 'react';
import { X, Calculator, Info, TrendingUp, TrendingDown, Target, AlertTriangle, Shield, Zap, Clock } from 'lucide-react';
import { useBroker } from '../hooks/useBroker';
import brokerIntegration from '../services/brokerIntegration';

const EntryPopup = ({ stock, onClose, onSubmit }) => {
  const { brokers, getConnectedBrokers } = useBroker();
  const [formData, setFormData] = useState({
    broker: brokers[0]?.id || '',
    quantity: 1,
    entryPrice: stock.currentPrice || 0,
    stopLoss: stock.stopLoss || 0,
    targetPrice: stock.targetPrice || 0,
    orderType: 'MARKET',
    capitalPercent: 10,
    trailingSL: false,
    trailingSLPercent: 2,
    partialExit: false,
    partialExitTargets: []
  });

  const [realTimePrice, setRealTimePrice] = useState(stock.currentPrice || 0);
  const [isBrokerConnected, setIsBrokerConnected] = useState(false);
  const [orderStatus, setOrderStatus] = useState('ready');
  const [priceHistory, setPriceHistory] = useState([]);

  // Auto-calculate SL and Target if not provided
  useEffect(() => {
    if (!formData.stopLoss && stock.currentPrice) {
      const calculatedSL = stock.currentPrice * 0.98; // 2% SL by default
      setFormData(prev => ({ ...prev, stopLoss: parseFloat(calculatedSL.toFixed(2)) }));
    }
    
    if (!formData.targetPrice && stock.currentPrice) {
      const calculatedTarget = stock.currentPrice * 1.04; // 4% Target by default
      setFormData(prev => ({ ...prev, targetPrice: parseFloat(calculatedTarget.toFixed(2)) }));
    }

    // Check broker connection
    if (formData.broker) {
      const connected = brokerIntegration.isBrokerConnected(formData.broker);
      setIsBrokerConnected(connected);
    }
  }, [formData.broker, stock.currentPrice]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (stock.currentPrice) {
        const randomChange = (Math.random() - 0.5) * 0.2; // ±0.2% change
        const newPrice = stock.currentPrice * (1 + randomChange);
        setRealTimePrice(parseFloat(newPrice.toFixed(2)));
        
        setPriceHistory(prev => {
          const newHistory = [...prev, { price: newPrice, time: new Date() }];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        });

        // Auto-update entry price if market order
        if (formData.orderType === 'MARKET') {
          setFormData(prev => ({ ...prev, entryPrice: parseFloat(newPrice.toFixed(2)) }));
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [stock.currentPrice, formData.orderType]);

  const calculatePosition = () => {
    const capitalAmount = (formData.capitalPercent / 100) * 100000; // Assuming 1L capital
    const quantityByCapital = Math.floor(capitalAmount / formData.entryPrice);
    return Math.max(1, Math.min(quantityByCapital, formData.quantity));
  };

  const calculateRisk = () => {
    const riskPerShare = formData.entryPrice - formData.stopLoss;
    const totalRisk = riskPerShare * calculatePosition();
    const riskPercentage = ((riskPerShare / formData.entryPrice) * 100).toFixed(2);
    return { riskPerShare, totalRisk, riskPercentage };
  };

  const calculateReward = () => {
    const rewardPerShare = formData.targetPrice - formData.entryPrice;
    const totalReward = rewardPerShare * calculatePosition();
    const rewardPercentage = ((rewardPerShare / formData.entryPrice) * 100).toFixed(2);
    return { rewardPerShare, totalReward, rewardPercentage };
  };

  const getRiskRewardRatio = () => {
    const risk = formData.entryPrice - formData.stopLoss;
    const reward = formData.targetPrice - formData.entryPrice;
    return risk > 0 ? (reward / risk).toFixed(2) : '0.00';
  };

  const calculatePartialExits = () => {
    if (!formData.partialExit) return [];
    
    const totalProfit = formData.targetPrice - formData.entryPrice;
    const partialTargets = [];
    
    // Generate 3 partial targets
    for (let i = 1; i <= 3; i++) {
      const targetPrice = formData.entryPrice + (totalProfit * (i * 0.25));
      const exitPercent = i === 3 ? 50 : 25; // 25%, 25%, 50%
      partialTargets.push({
        level: i,
        price: parseFloat(targetPrice.toFixed(2)),
        exitPercent,
        quantity: Math.floor(calculatePosition() * (exitPercent / 100))
      });
    }
    
    setFormData(prev => ({ ...prev, partialExitTargets: partialTargets }));
    return partialTargets;
  };

  const handleBrokerConnect = async () => {
    setOrderStatus('connecting');
    // Simulate broker connection
    setTimeout(() => {
      brokerIntegration.connectBroker(formData.broker, {});
      setIsBrokerConnected(true);
      setOrderStatus('ready');
    }, 1500);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderStatus('placing');
    
    const position = calculatePosition();
    const risk = calculateRisk();
    const reward = calculateReward();
    const partialExits = formData.partialExit ? calculatePartialExits() : [];

    try {
      // Place order through broker integration
      const orderResult = await brokerIntegration.placeOrder(formData.broker, {
        symbol: stock.symbol,
        exchange: stock.exchange || 'NSE',
        transactionType: 'BUY',
        orderType: formData.orderType,
        quantity: position,
        price: formData.entryPrice,
        triggerPrice: formData.orderType === 'SL' ? formData.entryPrice : undefined,
        productType: 'INTRADAY'
      });

      if (orderResult.success) {
        const tradeData = {
          ...formData,
          quantity: position,
          stockSymbol: stock.symbol,
          stockName: stock.companyName || stock.symbol,
          risk,
          reward,
          partialExits,
          trailingSL: formData.trailingSL,
          trailingSLPercent: formData.trailingSLPercent,
          orderId: orderResult.orderId,
          status: 'PENDING',
          timestamp: new Date().toISOString(),
          broker: formData.broker,
          exchange: stock.exchange || 'NSE'
        };

        onSubmit(tradeData);
        setOrderStatus('success');
        
        // Close popup after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setOrderStatus('failed');
      }
    } catch (error) {
      console.error('Order placement failed:', error);
      setOrderStatus('failed');
    }
  };

  const handleAutoCalculate = () => {
    if (!realTimePrice) return;
    
    const volatility = Math.random() * 0.03; // 0-3% volatility
    const calculatedSL = realTimePrice * (1 - volatility);
    const calculatedTarget = realTimePrice * (1 + (volatility * 1.5)); // 1.5x risk:reward
    
    setFormData(prev => ({
      ...prev,
      entryPrice: parseFloat(realTimePrice.toFixed(2)),
      stopLoss: parseFloat(calculatedSL.toFixed(2)),
      targetPrice: parseFloat(calculatedTarget.toFixed(2))
    }));
  };

  const connectedBrokers = getConnectedBrokers();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Enter Trade - {stock.symbol}</h2>
                <p className="text-sm text-gray-600">{stock.companyName || 'Stock'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Real-time Price Bar */}
          <div className="bg-gray-50 p-3 rounded-lg mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-xs text-gray-500">Current Price</p>
                <p className="text-lg font-bold">₹{realTimePrice.toFixed(2)}</p>
              </div>
              <div className={`flex items-center space-x-1 ${realTimePrice >= stock.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                {realTimePrice >= stock.currentPrice ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{(realTimePrice - stock.currentPrice).toFixed(2)}</span>
              </div>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Signal Strength: </span>
              <span className="font-medium text-green-600">{stock.confidence || '85%'}</span>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder}>
            <div className="space-y-4">
              {/* Broker Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Broker</label>
                  <div className="flex space-x-2">
                    <select
                      value={formData.broker}
                      onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Broker</option>
                      {brokers.map((broker) => (
                        <option key={broker.id} value={broker.id}>
                          {broker.name}
                        </option>
                      ))}
                    </select>
                    {formData.broker && !isBrokerConnected && (
                      <button
                        type="button"
                        onClick={handleBrokerConnect}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                  {formData.broker && (
                    <p className={`text-xs mt-1 ${isBrokerConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {isBrokerConnected ? '✓ Connected' : '✗ Not Connected'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                  <select
                    value={formData.orderType}
                    onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MARKET">Market</option>
                    <option value="LIMIT">Limit</option>
                    <option value="SL">Stop Loss</option>
                    <option value="SL-M">Stop Loss Market</option>
                  </select>
                </div>
              </div>

              {/* Price Inputs */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entry (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({ ...formData, entryPrice: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stop Loss (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.stopLoss}
                    onChange={(e) => setFormData({ ...formData, stopLoss: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetPrice}
                    onChange={(e) => setFormData({ ...formData, targetPrice: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Advanced Settings</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAutoCalculate}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Auto Calculate
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capital Allocation (%)</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={formData.capitalPercent}
                          onChange={(e) => setFormData({ ...formData, capitalPercent: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="w-12 text-center font-medium">{formData.capitalPercent}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="trailingSL"
                        checked={formData.trailingSL}
                        onChange={(e) => setFormData({ ...formData, trailingSL: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="trailingSL" className="text-sm">Trailing Stop Loss</label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="partialExit"
                        checked={formData.partialExit}
                        onChange={(e) => setFormData({ ...formData, partialExit: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="partialExit" className="text-sm">Partial Exit Strategy</label>
                    </div>
                  </div>

                  {formData.trailingSL && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trailing SL (%)</label>
                      <input
                        type="range"
                        min="0.5"
                        max="5"
                        step="0.1"
                        value={formData.trailingSLPercent}
                        onChange={(e) => setFormData({ ...formData, trailingSLPercent: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0.5%</span>
                        <span className="font-medium">{formData.trailingSLPercent}%</span>
                        <span>5%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trade Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center space-x-2">
                    <Calculator className="w-4 h-4" />
                    <span>Trade Summary</span>
                  </h3>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Position Size:</span>
                      <span className="font-medium">{calculatePosition()} shares</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investment:</span>
                      <span className="font-medium">₹{(calculatePosition() * formData.entryPrice).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk (SL):</span>
                      <span className="font-medium text-red-600">₹{calculateRisk().totalRisk.toFixed(2)} ({calculateRisk().riskPercentage}%)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Reward (Target):</span>
                      <span className="font-medium text-green-600">₹{calculateReward().totalReward.toFixed(2)} ({calculateReward().rewardPercentage}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk/Reward Ratio:</span>
                      <span className="font-medium">1:{getRiskRewardRatio()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Probability:</span>
                      <span className="font-medium text-green-600">{stock.probability || '85%'}</span>
                    </div>
                  </div>
                </div>

                {/* Risk Meter */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-green-600">Low Risk</span>
                    <span className="text-yellow-600">Medium Risk</span>
                    <span className="text-red-600">High Risk</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${Math.min(100 - parseFloat(calculateRisk().riskPercentage) * 10, 100)}%` }}
                    />
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
                  disabled={orderStatus === 'placing' || !isBrokerConnected}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                    orderStatus === 'placing'
                      ? 'bg-blue-400 cursor-not-allowed'
                      : !isBrokerConnected
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  }`}
                >
                  {orderStatus === 'placing' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Placing Order...</span>
                    </>
                  ) : orderStatus === 'success' ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Order Placed!</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      <span>Place {formData.orderType} Order</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Disclaimer */}
              <p className="text-xs text-gray-500 text-center pt-2">
                Trading involves risk. Past performance is not indicative of future results.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EntryPopup;