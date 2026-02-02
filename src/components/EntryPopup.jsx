import React, { useState, useEffect } from 'react';
import { X, Calculator, Info, TrendingUp, TrendingDown, Target, Shield, Zap, Clock, DollarSign, Percent, BarChart3 } from 'lucide-react';
import { brokerAPI } from '../services/api';

const EntryPopup = ({ stock, onClose, onSubmit, isHindi }) => {
  const [formData, setFormData] = useState({
    broker: '',
    quantity: 1,
    entryPrice: stock.currentPrice || 0,
    stopLoss: stock.stopLoss || 0,
    targetPrice: stock.targetPrice || 0,
    orderType: 'MARKET',
    capitalPercent: 10,
    trailingSL: false,
    trailingSLPercent: 2,
    partialExit: false,
    notes: ''
  });

  const [realTimePrice, setRealTimePrice] = useState(stock.currentPrice || 0);
  const [brokers, setBrokers] = useState([]);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState('ready');

  // Load brokers
  useEffect(() => {
    fetchBrokers();
  }, []);

  // Simulate real-time price updates
  useEffect(() => {
    if (!stock.currentPrice) return;
    
    const interval = setInterval(() => {
      const randomChange = (Math.random() - 0.5) * 0.1;
      const newPrice = stock.currentPrice * (1 + randomChange);
      setRealTimePrice(parseFloat(newPrice.toFixed(2)));
      
      if (formData.orderType === 'MARKET') {
        setFormData(prev => ({ ...prev, entryPrice: parseFloat(newPrice.toFixed(2)) }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [stock.currentPrice, formData.orderType]);

  const fetchBrokers = async () => {
    try {
      const result = await brokerAPI.getBrokers();
      if (result?.success && result.brokers?.length > 0) {
        setBrokers(result.brokers);
        setSelectedBroker(result.brokers.find(b => b.is_active));
        setFormData(prev => ({ ...prev, broker: result.brokers.find(b => b.is_active)?.id || '' }));
      }
    } catch (error) {
      console.error('Error fetching brokers:', error);
    }
  };

  const calculatePosition = () => {
    const capitalAmount = (formData.capitalPercent / 100) * 100000;
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

  const handleAutoCalculate = () => {
    if (!realTimePrice) return;
    
    const volatility = Math.random() * 0.03;
    const calculatedSL = realTimePrice * (1 - volatility);
    const calculatedTarget = realTimePrice * (1 + (volatility * 1.5));
    
    setFormData(prev => ({
      ...prev,
      entryPrice: parseFloat(realTimePrice.toFixed(2)),
      stopLoss: parseFloat(calculatedSL.toFixed(2)),
      targetPrice: parseFloat(calculatedTarget.toFixed(2))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBroker) {
      alert(isHindi ? 'कृपया ब्रोकर चुनें' : 'Please select a broker');
      return;
    }
    
    setOrderStatus('placing');
    
    const position = calculatePosition();
    const risk = calculateRisk();
    const reward = calculateReward();

    try {
      const orderData = {
        brokerId: selectedBroker.id,
        symbol: stock.symbol,
        action: 'BUY',
        orderType: formData.orderType,
        quantity: position,
        price: formData.entryPrice,
        stopLoss: formData.stopLoss,
        target: formData.targetPrice,
        trailingSL: formData.trailingSL,
        trailingSLPercent: formData.trailingSLPercent,
        notes: formData.notes
      };

      const result = await brokerAPI.placeOrder(orderData);
      
      if (result?.success) {
        const tradeData = {
          ...formData,
          quantity: position,
          stockSymbol: stock.symbol,
          stockName: stock.name || stock.symbol,
          risk,
          reward,
          riskRewardRatio: getRiskRewardRatio(),
          orderId: result.orderId,
          status: 'PENDING',
          timestamp: new Date().toISOString(),
          broker: selectedBroker.name
        };

        onSubmit(tradeData);
        setOrderStatus('success');
        
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setOrderStatus('failed');
        alert(isHindi ? `ऑर्डर फेल: ${result?.message}` : `Order failed: ${result?.message}`);
      }
    } catch (error) {
      console.error('Order placement failed:', error);
      setOrderStatus('failed');
      alert(isHindi ? 'ऑर्डर प्लेसमेंट में समस्या' : 'Order placement error');
    }
  };

  const riskData = calculateRisk();
  const rewardData = calculateReward();
  const riskRewardRatio = getRiskRewardRatio();
  const positionSize = calculatePosition();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-emerald-900/40 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isHindi ? 'ट्रेड में एंटर करें' : 'Enter Trade'} - {stock.symbol}
                </h2>
                <p className="text-sm text-emerald-300/60">
                  {stock.name || stock.symbol}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-emerald-400" />
            </button>
          </div>

          {/* REAL-TIME PRICE */}
          <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/10 p-3 rounded-xl mb-4 border border-emerald-900/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-300/60">{isHindi ? 'करंट प्राइस' : 'Current Price'}</p>
                <p className="text-lg font-bold text-white">₹{realTimePrice.toFixed(2)}</p>
              </div>
              <div className={`flex items-center space-x-1 ${
                realTimePrice >= stock.currentPrice ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {realTimePrice >= stock.currentPrice ? 
                  <TrendingUp className="w-4 h-4" /> : 
                  <TrendingDown className="w-4 h-4" />
                }
                <span>{(realTimePrice - stock.currentPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* BROKER SELECTION */}
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  {isHindi ? 'ब्रोकर' : 'Broker'}
                </label>
                <div className="flex space-x-2">
                  <select
                    value={formData.broker}
                    onChange={(e) => {
                      const broker = brokers.find(b => b.id === e.target.value);
                      setSelectedBroker(broker);
                      setFormData(prev => ({ ...prev, broker: e.target.value }));
                    }}
                    className="flex-1 bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  >
                    <option value="" className="bg-slate-900">
                      {isHindi ? 'ब्रोकर चुनें' : 'Select Broker'}
                    </option>
                    {brokers.map((broker) => (
                      <option key={broker.id} value={broker.id} className="bg-slate-900">
                        {broker.broker_name} {broker.is_active ? '✅' : '❌'}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedBroker && (
                  <p className={`text-xs mt-1 ${selectedBroker.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedBroker.is_active ? '✅ Connected' : '❌ Disconnected'}
                  </p>
                )}
              </div>

              {/* PRICE INPUTS */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-emerald-300/70 mb-2">{isHindi ? 'एंट्री' : 'Entry'}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({ ...formData, entryPrice: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-emerald-300/70 mb-2">{isHindi ? 'एसएल' : 'SL'}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.stopLoss}
                    onChange={(e) => setFormData({ ...formData, stopLoss: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-emerald-300/70 mb-2">{isHindi ? 'टारगेट' : 'Target'}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetPrice}
                    onChange={(e) => setFormData({ ...formData, targetPrice: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* ORDER TYPE */}
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  {isHindi ? 'ऑर्डर टाइप' : 'Order Type'}
                </label>
                <select
                  value={formData.orderType}
                  onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                  className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="MARKET" className="bg-slate-900">Market</option>
                  <option value="LIMIT" className="bg-slate-900">Limit</option>
                  <option value="SL" className="bg-slate-900">Stop Loss</option>
                </select>
              </div>

              {/* QUANTITY & CAPITAL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">
                    {isHindi ? 'क्वांटिटी' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">
                    {isHindi ? 'कैपिटल (%)' : 'Capital (%)'}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={formData.capitalPercent}
                      onChange={(e) => setFormData({ ...formData, capitalPercent: parseInt(e.target.value) })}
                      className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400"
                    />
                    <span className="w-12 text-center font-medium text-white">{formData.capitalPercent}%</span>
                  </div>
                </div>
              </div>

              {/* ADVANCED SETTINGS */}
              <div className="border border-emerald-900/40 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>{isHindi ? 'एडवांस्ड सेटिंग्स' : 'Advanced Settings'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAutoCalculate}
                    className="text-sm text-emerald-400 hover:text-emerald-300"
                  >
                    {isHindi ? 'ऑटो कैलकुलेट' : 'Auto Calculate'}
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="trailingSL"
                        checked={formData.trailingSL}
                        onChange={(e) => setFormData({ ...formData, trailingSL: e.target.checked })}
                        className="rounded border-emerald-900/40 bg-slate-800"
                      />
                      <label htmlFor="trailingSL" className="text-sm text-emerald-300">
                        {isHindi ? 'ट्रेलिंग स्टॉप लॉस' : 'Trailing Stop Loss'}
                      </label>
                    </div>

                    {formData.trailingSL && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-emerald-300/60">{isHindi ? 'दूरी:' : 'Distance:'}</span>
                        <input
                          type="range"
                          min="0.5"
                          max="5"
                          step="0.1"
                          value={formData.trailingSLPercent}
                          onChange={(e) => setFormData({ ...formData, trailingSLPercent: parseFloat(e.target.value) })}
                          className="w-20 h-2 bg-slate-700 rounded"
                        />
                        <span className="text-xs text-white">{formData.trailingSLPercent}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TRADE SUMMARY */}
              <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/10 p-4 rounded-xl border border-emerald-900/40">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white flex items-center space-x-2">
                    <Calculator className="w-4 h-4" />
                    <span>{isHindi ? 'ट्रेड समरी' : 'Trade Summary'}</span>
                  </h3>
                  <Info className="w-4 h-4 text-emerald-400/60" />
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-emerald-300/70">{isHindi ? 'पोजिशन:' : 'Position:'}</span>
                      <span className="font-medium text-white">{positionSize} {isHindi ? 'शेयर' : 'shares'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-300/70">{isHindi ? 'इन्वेस्टमेंट:' : 'Investment:'}</span>
                      <span className="font-medium text-white">₹{(positionSize * formData.entryPrice).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-300/70">{isHindi ? 'रिस्क:' : 'Risk:'}</span>
                      <span className="font-medium text-red-400">
                        ₹{riskData.totalRisk.toFixed(2)} ({riskData.riskPercentage}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-emerald-300/70">{isHindi ? 'रिवार्ड:' : 'Reward:'}</span>
                      <span className="font-medium text-emerald-400">
                        ₹{rewardData.totalReward.toFixed(2)} ({rewardData.rewardPercentage}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-300/70">R/R Ratio:</span>
                      <span className="font-medium text-white">1:{riskRewardRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-300/70">{isHindi ? 'कॉन्फिडेंस:' : 'Confidence:'}</span>
                      <span className="font-medium text-emerald-400">{stock.confidence || '85%'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NOTES */}
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  {isHindi ? 'नोट्स' : 'Notes'}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={isHindi ? 'ट्रेड के बारे में नोट्स...' : 'Notes about the trade...'}
                  rows="2"
                  className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-emerald-900/40 text-emerald-300 py-3 px-4 rounded-xl font-medium hover:bg-emerald-900/20 transition-all"
                  disabled={orderStatus === 'placing'}
                >
                  {isHindi ? 'कैंसल' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={orderStatus === 'placing' || !selectedBroker?.is_active}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    orderStatus === 'placing'
                      ? 'bg-emerald-400 cursor-not-allowed'
                      : !selectedBroker?.is_active
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white'
                  }`}
                >
                  {orderStatus === 'placing' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{isHindi ? 'प्लेस हो रहा...' : 'Placing...'}</span>
                    </>
                  ) : orderStatus === 'success' ? (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      <span>{isHindi ? 'ऑर्डर प्लेस हुआ!' : 'Order Placed!'}</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      <span>{isHindi ? 'ऑर्डर प्लेस करें' : 'Place Order'}</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* DISCLAIMER */}
              <p className="text-xs text-emerald-300/50 text-center pt-2">
                {isHindi ? 'ट्रेडिंग में रिस्क होता है। पास्ट परफॉर्मेंस भविष्य के रिजल्ट्स की गारंटी नहीं है।' : 
                 'Trading involves risk. Past performance is not indicative of future results.'}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EntryPopup;
