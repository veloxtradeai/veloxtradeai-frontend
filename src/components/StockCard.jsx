import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Zap, 
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

const StockCard = ({ stock, onTrade, connectionStatus, isHindi }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // CRITICAL: Check if stock data is valid
  if (!stock || typeof stock !== 'object') {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-xl border border-red-500/30 p-4">
        <div className="text-center py-4">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">
            {isHindi ? 'अमान्य स्टॉक डेटा' : 'Invalid stock data'}
          </p>
        </div>
      </div>
    );
  }
  
  // Safely extract values with defaults
  const symbol = stock.symbol || 'N/A';
  const name = stock.name || symbol;
  const currentPrice = parseFloat(stock.currentPrice) || 0;
  const change = parseFloat(stock.change) || 0;
  const changePercent = parseFloat(stock.changePercent) || 0;
  const signal = stock.signal || 'HOLD';
  const confidence = parseFloat(stock.confidence) || 0;
  const targetPrice = parseFloat(stock.targetPrice) || 0;
  const stopLoss = parseFloat(stock.stopLoss) || 0;
  const entryPrice = parseFloat(stock.entryPrice) || currentPrice;
  const riskLevel = stock.riskLevel || 'medium';
  const timeFrame = stock.timeFrame || 'intraday';
  const reason = stock.reason || 'AI Analysis';
  const volume = stock.volume || 0;
  const quantity = stock.quantity || Math.floor(10000 / (currentPrice || 1));
  
  // Calculate derived values
  const isPositive = changePercent >= 0;
  const isHighConfidence = confidence >= 85;
  const isVeryHighConfidence = confidence >= 90;
  
  const getRiskColor = (level) => {
    switch(level) {
      case 'low': return 'text-emerald-400';
      case 'medium': return 'text-amber-400';
      case 'high': return 'text-red-400';
      default: return 'text-emerald-400';
    }
  };
  
  const getRiskBg = (level) => {
    switch(level) {
      case 'low': return 'bg-emerald-500/20';
      case 'medium': return 'bg-amber-500/20';
      case 'high': return 'bg-red-500/20';
      default: return 'bg-emerald-500/20';
    }
  };
  
  const handleQuickTrade = () => {
    if (!connectionStatus.broker) {
      alert(isHindi ? 'पहले ब्रोकर कनेक्ट करें!' : 'Please connect broker first!');
      return;
    }
    
    if (onTrade) {
      onTrade(signal, {
        stock,
        entry: entryPrice,
        target: targetPrice,
        stoploss: stopLoss,
        quantity: quantity
      });
    }
  };
  
  return (
    <div className={`bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-xl border ${
      isHighConfidence 
        ? 'border-emerald-500/40 hover:border-emerald-400/60' 
        : 'border-emerald-900/40 hover:border-emerald-500/30'
    } transition-all duration-300 p-4 h-full flex flex-col`}>
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <div className={`p-1.5 rounded-lg ${
              isHighConfidence ? 'bg-emerald-500/20' : 'bg-slate-700/50'
            }`}>
              <Zap className={`w-4 h-4 ${
                isHighConfidence ? 'text-emerald-400' : 'text-slate-400'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg leading-tight">{symbol}</h3>
              <p className="text-xs text-emerald-300/60 truncate">{name}</p>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            ₹{currentPrice.toFixed(2)}
          </div>
          <div className={`text-xs flex items-center justify-end ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(changePercent).toFixed(2)}% ({isPositive ? '+' : ''}{change.toFixed(2)})
          </div>
        </div>
      </div>
      
      {/* CONFIDENCE & SIGNAL */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            signal === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' :
            signal === 'SELL' ? 'bg-red-500/20 text-red-400' :
            'bg-slate-500/20 text-slate-400'
          }`}>
            {signal}
          </span>
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBg(riskLevel)} ${getRiskColor(riskLevel)}`}>
            {riskLevel.toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Target className="w-3 h-3 text-emerald-400" />
          <span className={`text-sm font-bold ${
            isVeryHighConfidence ? 'text-emerald-400' :
            isHighConfidence ? 'text-amber-400' : 'text-slate-400'
          }`}>
            {confidence.toFixed(1)}%
          </span>
        </div>
      </div>
      
      {/* KEY METRICS */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2 rounded-lg bg-slate-800/30">
          <div className="text-xs text-emerald-300/60">{isHindi ? 'लक्ष्य:' : 'Target:'}</div>
          <div className="text-sm font-medium text-white">₹{targetPrice.toFixed(2)}</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-800/30">
          <div className="text-xs text-emerald-300/60">{isHindi ? 'स्टॉप लॉस:' : 'Stop Loss:'}</div>
          <div className="text-sm font-medium text-white">₹{stopLoss.toFixed(2)}</div>
        </div>
      </div>
      
      {/* REASON */}
      <div className="mb-4 flex-1">
        <p className="text-xs text-emerald-300/70 line-clamp-2">{reason}</p>
        {volume > 0 && (
          <div className="mt-1 text-xs text-slate-400">
            {isHindi ? 'वॉल्यूम:' : 'Volume:'} {(volume / 1000).toFixed(1)}K
          </div>
        )}
      </div>
      
      {/* ACTION BUTTONS */}
      <div className="flex space-x-2 mt-auto">
        <button
          onClick={handleQuickTrade}
          disabled={!connectionStatus.broker}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            signal === 'BUY' 
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800' 
              : signal === 'SELL'
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
              : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800'
          } ${!connectionStatus.broker ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {!connectionStatus.broker 
            ? (isHindi ? 'ब्रोकर जोड़ें' : 'Connect Broker')
            : (signal === 'BUY' ? (isHindi ? 'खरीदें' : 'BUY') : 
               signal === 'SELL' ? (isHindi ? 'बेचें' : 'SELL') : 
               (isHindi ? 'निगरानी' : 'MONITOR'))
          }
        </button>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-3 py-2.5 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition-all cursor-pointer"
        >
          <Info className="w-4 h-4 text-emerald-300" />
        </button>
      </div>
      
      {/* DETAILS PANEL */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-emerald-900/30">
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <span className="text-emerald-300/60">{isHindi ? 'प्रवेश मूल्य:' : 'Entry Price:'}</span>
              <span className="text-white ml-2">₹{entryPrice.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-emerald-300/60">{isHindi ? 'समय:' : 'Timeframe:'}</span>
              <span className="text-white ml-2">{timeFrame.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-emerald-300/60">{isHindi ? 'जोखिम/लाभ:' : 'Risk/Reward:'}</span>
              <span className="text-white ml-2">1:3</span>
            </div>
            <div>
              <span className="text-emerald-300/60">{isHindi ? 'मात्रा:' : 'Quantity:'}</span>
              <span className="text-white ml-2">{quantity}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="text-emerald-300/60">
              {isHindi ? 'सिफ़ारिश:' : 'Recommendation:'} <span className="text-white">{signal}</span>
            </div>
            <div className="text-emerald-300/40">
              AI Powered
            </div>
          </div>
        </div>
      )} 
    </div>
  );
};

export default StockCard;
