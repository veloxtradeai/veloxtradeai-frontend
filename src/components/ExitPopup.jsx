import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, TrendingUp, TrendingDown, Target, DollarSign, Clock, BarChart3, Percent, Check, Shield } from 'lucide-react';
import { brokerAPI } from '../services/api';

const ExitPopup = ({ stock, onClose, onSubmit, isHindi }) => {
  const [formData, setFormData] = useState({
    exitPrice: stock.currentPrice || 0,
    exitReason: 'manual_exit',
    exitQuantity: stock.quantity || 1,
    partialExit: false,
    notes: ''
  });

  const [realTimePrice, setRealTimePrice] = useState(stock.currentPrice || 0);
  const [orderStatus, setOrderStatus] = useState('ready');
  const [exitSuggestions, setExitSuggestions] = useState([]);

  // Real-time price simulation
  useEffect(() => {
    if (!stock.currentPrice) return;
    
    const interval = setInterval(() => {
      const randomChange = (Math.random() - 0.5) * 0.08;
      const newPrice = stock.currentPrice * (1 + randomChange);
      setRealTimePrice(parseFloat(newPrice.toFixed(2)));
      
      // Auto-update exit price
      if (formData.exitPrice === stock.currentPrice) {
        setFormData(prev => ({ ...prev, exitPrice: parseFloat(newPrice.toFixed(2)) }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [stock.currentPrice, formData.exitPrice]);

  // Auto-suggest exit strategies
  useEffect(() => {
    if (!stock.entryPrice || !realTimePrice) return;

    const suggestions = [];
    const currentProfitPercent = ((realTimePrice - stock.entryPrice) / stock.entryPrice * 100);

    if (currentProfitPercent >= 5) {
      suggestions.push({
        type: 'take_profit',
        title: isHindi ? 'प्रॉफिट लें (5%+)' : 'Take Profit (5%+)',
        description: isHindi ? 'अच्छा प्रॉफिट हुआ। आंशिक प्रॉफिट बुक करें।' : 'Good profit achieved. Consider booking partial profit.',
        exitPercent: 50,
        reason: 'achieved_target'
      });
    }

    if (currentProfitPercent <= -2) {
      suggestions.push({
        type: 'cut_loss',
        title: isHindi ? 'लॉस काटें (-2%)' : 'Cut Loss (-2%)',
        description: isHindi ? 'स्टॉप लॉस ट्रिगर हुआ। आगे के नुकसान को कम करने के लिए एक्ज़िट करें।' : 'Stop loss triggered. Exit to minimize further loss.',
        exitPercent: 100,
        reason: 'stop_loss_hit'
      });
    }

    if (Math.abs(currentProfitPercent) > 8) {
      suggestions.push({
        type: 'volatility',
        title: isHindi ? 'हाई वोलैटिलिटी' : 'High Volatility',
        description: isHindi ? 'हाई प्राइस मूवमेंट डिटेक्ट हुई। प्रॉफिट सिक्योर करें।' : 'High price movement detected. Secure profits.',
        exitPercent: 75,
        reason: 'market_volatility'
      });
    }

    setExitSuggestions(suggestions);
  }, [realTimePrice, stock.entryPrice, isHindi]);

  const handleAutoExit = async (suggestion) => {
    setOrderStatus('placing');
    
    const exitData = {
      ...formData,
      exitPrice: realTimePrice,
      exitReason: suggestion.reason,
      exitQuantity: Math.floor((suggestion.exitPercent / 100) * (stock.quantity || 1))
    };

    try {
      const orderData = {
        brokerId: stock.brokerId || 'default',
        symbol: stock.symbol,
        action: 'SELL',
        orderType: 'MARKET',
        quantity: exitData.exitQuantity,
        price: realTimePrice,
        notes: `Auto exit: ${suggestion.title}`
      };

      const result = await brokerAPI.placeOrder(orderData);
      
      if (result?.success) {
        handleSubmit(exitData, result.orderId);
      } else {
        setOrderStatus('failed');
        alert(isHindi ? `एग्ज़िट फेल: ${result?.message}` : `Exit failed: ${result?.message}`);
      }
    } catch (error) {
      console.error('Exit order failed:', error);
      setOrderStatus('failed');
    }
  };

  const handleSubmit = async (customData = null, orderId = null) => {
    const data = customData || formData;
    setOrderStatus('placing');
    
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
      entryPrice: stock.entryPrice
    };

    try {
      // Call backend to execute exit
      const result = await brokerAPI.placeOrder({
        brokerId: stock.brokerId || 'default',
        symbol: stock.symbol,
        action: 'SELL',
        orderType: 'MARKET',
        quantity: data.exitQuantity,
        price: data.exitPrice,
        notes: `Exit: ${data.exitReason}`
      });

      if (result?.success) {
        onSubmit(exitData);
        setOrderStatus('success');
        
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setOrderStatus('failed');
        alert(isHindi ? `एग्ज़िट फेल: ${result?.message}` : `Exit failed: ${result?.message}`);
      }
    } catch (error) {
      console.error('Exit error:', error);
      setOrderStatus('failed');
    }
  };

  const getExitRecommendation = () => {
    const profitPercent = ((realTimePrice - stock.entryPrice) / stock.entryPrice * 100);
    
    if (profitPercent >= 4) return {
      type: 'strong_exit',
      text: isHindi ? 'स्ट्रॉन्ग प्रॉफिट - बुक करें' : 'Strong Profit - Consider Booking',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      icon: <TrendingUp className="w-4 h-4" />
    };
    if (profitPercent >= 2) return {
      type: 'hold',
      text: isHindi ? 'मॉडरेट प्रॉफिट - होल्ड या आंशिक बुक' : 'Moderate Profit - Hold or Book Partial',
      color: 'text-amber-400',
      bg: 'bg-amber-500/20',
      icon: <Clock className="w-4 h-4" />
    };
    if (profitPercent <= -2) return {
      type: 'exit',
      text: isHindi ? 'स्टॉप लॉस हिट - अभी एक्ज़िट करें' : 'Stop Loss Hit - Exit Now',
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      icon: <AlertTriangle className="w-4 h-4" />
    };
    
    return {
      type: 'neutral',
      text: isHindi ? 'न्यूट्रल - क्लोज़ली मॉनिटर करें' : 'Neutral - Monitor Closely',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/20',
      icon: <BarChart3 className="w-4 h-4" />
    };
  };

  const recommendation = getExitRecommendation();
  const profitPercent = ((realTimePrice - stock.entryPrice) / stock.entryPrice * 100).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-emerald-900/40 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-red-500/20">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isHindi ? 'ट्रेड से एक्ज़िट करें' : 'Exit Trade'} - {stock.symbol}
                </h2>
                <p className="text-sm text-emerald-300/60">
                  {isHindi ? 'अपनी पोजिशन मैनेज करें' : 'Manage your position'}
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

          {/* RECOMMENDATION */}
          <div className={`p-3 rounded-xl mb-4 border ${recommendation.bg} ${recommendation.color}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {recommendation.icon}
                <span className="font-medium">
                  {recommendation.text}
                </span>
              </div>
              <div className={`text-lg font-bold ${profitPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {profitPercent >= 0 ? '+' : ''}{profitPercent}%
              </div>
            </div>
          </div>

          {/* QUICK EXIT SUGGESTIONS */}
          {exitSuggestions.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-white mb-2 flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>{isHindi ? 'क्विक एक्ज़िट सजेशन' : 'Quick Exit Suggestions'}</span>
              </h3>
              <div className="space-y-2">
                {exitSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleAutoExit(suggestion)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      suggestion.type === 'take_profit' 
                        ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                        : suggestion.type === 'cut_loss'
                        ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20'
                        : 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{suggestion.title}</p>
                        <p className="text-xs text-emerald-300/60">{suggestion.description}</p>
                      </div>
                      <div className="text-sm font-medium text-white">
                        {suggestion.exitPercent}% {isHindi ? 'एग्ज़िट' : 'Exit'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="space-y-4">
              {/* TRADE SUMMARY */}
              <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/30 rounded-xl p-4 border border-emerald-900/40">
                <h3 className="font-medium text-white mb-3">{isHindi ? 'ट्रेड डिटेल्स' : 'Trade Details'}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-emerald-300/60">{isHindi ? 'एंट्री प्राइस:' : 'Entry Price:'}</p>
                    <p className="font-medium text-white">₹{parseFloat(stock.entryPrice || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-emerald-300/60">{isHindi ? 'करंट प्राइस:' : 'Current Price:'}</p>
                    <p className="font-medium text-white">₹{realTimePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-emerald-300/60">{isHindi ? 'क्वांटिटी:' : 'Quantity:'}</p>
                    <p className="font-medium text-white">{stock.quantity || 1} {isHindi ? 'शेयर' : 'shares'}</p>
                  </div>
                  <div>
                    <p className="text-emerald-300/60">{isHindi ? 'पी/एल:' : 'P/L:'}</p>
                    <p className={`font-medium ${profitPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {profitPercent >= 0 ? '+' : ''}{profitPercent}%
                    </p>
                  </div>
                </div>
              </div>

              {/* EXIT CONFIGURATION */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">
                    {isHindi ? 'एग्ज़िट प्राइस (₹)' : 'Exit Price (₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.exitPrice}
                    onChange={(e) => setFormData({ ...formData, exitPrice: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                  <div className="flex justify-between mt-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, exitPrice: realTimePrice })}
                      className="text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      {isHindi ? 'करंट यूज़ करें' : 'Use Current'} (₹{realTimePrice.toFixed(2)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, exitPrice: stock.targetPrice || (stock.entryPrice * 1.04) })}
                      className="text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      {isHindi ? 'टारगेट यूज़ करें' : 'Use Target'} (₹{(stock.targetPrice || (stock.entryPrice * 1.04)).toFixed(2)})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-300 mb-2">
                      {isHindi ? 'एग्ज़िट क्वांटिटी' : 'Exit Quantity'}
                    </label>
                    <select
                      value={formData.exitQuantity}
                      onChange={(e) => setFormData({ ...formData, exitQuantity: parseInt(e.target.value) })}
                      className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    >
                      <option value={stock.quantity || 1}>
                        {isHindi ? 'फुल' : 'Full'} ({stock.quantity || 1} {isHindi ? 'शेयर' : 'shares'})
                      </option>
                      <option value={Math.floor((stock.quantity || 1) * 0.5)}>
                        {isHindi ? 'आधा' : 'Half'} ({Math.floor((stock.quantity || 1) * 0.5)} {isHindi ? 'शेयर' : 'shares'})
                      </option>
                      <option value={Math.floor((stock.quantity || 1) * 0.25)}>
                        {isHindi ? 'चौथाई' : 'Quarter'} ({Math.floor((stock.quantity || 1) * 0.25)} {isHindi ? 'शेयर' : 'shares'})
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-300 mb-2">
                      {isHindi ? 'एग्ज़िट टाइप' : 'Exit Type'}
                    </label>
                    <select
                      value={formData.exitReason}
                      onChange={(e) => setFormData({ ...formData, exitReason: e.target.value })}
                      className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    >
                      <option value="target_hit">{isHindi ? 'टारगेट हिट' : 'Target Hit'}</option>
                      <option value="stop_loss_hit">{isHindi ? 'स्टॉप लॉस हिट' : 'Stop Loss Hit'}</option>
                      <option value="partial_profit">{isHindi ? 'आंशिक प्रॉफिट' : 'Partial Profit'}</option>
                      <option value="market_condition">{isHindi ? 'मार्केट कंडीशन' : 'Market Condition'}</option>
                      <option value="manual_exit">{isHindi ? 'मैनुअल एक्ज़िट' : 'Manual Exit'}</option>
                    </select>
                  </div>
                </div>

                {/* NOTES */}
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-2">
                    {isHindi ? 'एग्ज़िट कारण' : 'Exit Reason'}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={isHindi ? 'इस ट्रेड से एक्ज़िट क्यों कर रहे हैं?' : 'Why are you exiting this trade?'}
                    rows="2"
                    className="w-full bg-slate-800/50 border border-emerald-900/40 text-white rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* P&L SUMMARY */}
              <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/10 p-4 rounded-xl border border-emerald-900/40">
                <h3 className="font-medium text-white mb-3">{isHindi ? 'एग्ज़िट समरी' : 'Exit Summary'}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-300/70">{isHindi ? 'प्रॉफिट/लॉस:' : 'Profit/Loss:'}</span>
                    <span className={`text-lg font-bold ${profitPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ₹{(formData.exitPrice - stock.entryPrice).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-300/70">{isHindi ? 'प्रॉफिट/लॉस %:' : 'Profit/Loss %:'}</span>
                    <span className={`text-lg font-bold ${profitPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(((formData.exitPrice - stock.entryPrice) / stock.entryPrice) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-300/70">{isHindi ? 'टोटल पी/एल:' : 'Total P&L:'}</span>
                    <span className={`text-xl font-bold ${
                      (formData.exitPrice - stock.entryPrice) * formData.exitQuantity >= 0 
                        ? 'text-emerald-400' 
                        : 'text-red-400'
                    }`}>
                      ₹{((formData.exitPrice - stock.entryPrice) * formData.exitQuantity).toFixed(2)}
                    </span>
                  </div>
                </div>
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
                  disabled={orderStatus === 'placing'}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    orderStatus === 'placing'
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white'
                  }`}
                >
                  {orderStatus === 'placing' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{isHindi ? 'एग्ज़िट हो रहा...' : 'Exiting...'}</span>
                    </>
                  ) : orderStatus === 'success' ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>{isHindi ? 'एग्ज़िट सक्सेस!' : 'Exit Success!'}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-5 h-5" />
                      <span>{isHindi ? 'एग्ज़िट ट्रेड' : 'Exit Trade'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExitPopup;
