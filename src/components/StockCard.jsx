import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Info, Target, Clock, Zap, AlertCircle, ExternalLink, Shield } from 'lucide-react';
import EntryPopup from './EntryPopup';
import ExitPopup from './ExitPopup';

const StockCard = ({ stock, onTrade, connectionStatus, isHindi }) => {
  const [showEntryPopup, setShowEntryPopup] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Helper functions
  const getSignalColor = (signal) => {
    if (!signal) return 'bg-gray-500';
    
    const signalStr = String(signal).toLowerCase();
    switch(signalStr) {
      case 'strong_buy': return 'bg-gradient-to-r from-emerald-600 to-emerald-500';
      case 'buy': return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
      case 'neutral': return 'bg-gradient-to-r from-amber-500 to-amber-400';
      case 'sell': return 'bg-gradient-to-r from-red-500 to-red-400';
      case 'strong_sell': return 'bg-gradient-to-r from-red-600 to-red-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-400';
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(Number(price))) {
      return '₹0.00';
    }
    const num = parseFloat(price);
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getRiskBadge = (risk) => {
    if (!risk) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300">N/A</span>;
    }
    
    const riskStr = String(risk).toLowerCase();
    const config = {
      low: { color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', label: isHindi ? 'कम' : 'Low' },
      medium: { color: 'bg-amber-500/20 text-amber-400 border border-amber-500/30', label: isHindi ? 'मध्यम' : 'Medium' },
      high: { color: 'bg-red-500/20 text-red-400 border border-red-500/30', label: isHindi ? 'उच्च' : 'High' }
    };
    const cfg = config[riskStr] || config.medium;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
        {cfg.label}
      </span>
    );
  };

  // Get data with fallbacks
  const getCurrentPrice = () => {
    if (stock.currentPrice !== undefined) return stock.currentPrice;
    if (stock.last_price !== undefined) return stock.last_price;
    if (stock.market_data?.last_price !== undefined) return stock.market_data.last_price;
    return 0;
  };

  const getChangePercent = () => {
    if (stock.changePercent !== undefined) return stock.changePercent;
    if (stock.change_percent !== undefined) return stock.change_percent;
    if (stock.market_data?.change_percent !== undefined) return stock.market_data.change_percent;
    return 0;
  };

  const getSignalText = () => {
    if (!stock.signal) return 'NEUTRAL';
    const signalStr = String(stock.signal);
    return signalStr.replace('_', ' ').toUpperCase();
  };

  const getConfidence = () => {
    if (stock.confidence) return stock.confidence;
    if (stock.ai_signal?.confidence) return stock.ai_signal.confidence;
    return '0%';
  };

  const getEntryPrice = () => {
    if (stock.entryPrice) return stock.entryPrice;
    if (stock.ai_signal?.entry_price) return stock.ai_signal.entry_price;
    if (stock.entry_price) return stock.entry_price;
    return getCurrentPrice() * 0.99;
  };

  const getTargetPrice = () => {
    if (stock.targetPrice) return stock.targetPrice;
    if (stock.ai_signal?.target_price) return stock.ai_signal.target_price;
    if (stock.target_price) return stock.target_price;
    return getCurrentPrice() * 1.05;
  };

  const getStopLoss = () => {
    if (stock.stopLoss) return stock.stopLoss;
    if (stock.ai_signal?.stop_loss) return stock.ai_signal.stop_loss;
    if (stock.stop_loss) return stock.stop_loss;
    return getCurrentPrice() * 0.97;
  };

  const currentPrice = getCurrentPrice();
  const changePercent = getChangePercent();
  const isPositive = changePercent >= 0;
  const confidence = getConfidence();

  return (
    <>
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-2xl border border-emerald-900/40 hover:border-emerald-500/60 transition-all duration-300">
        <div className="p-5">
          {/* HEADER */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-xl font-bold text-white">{stock.symbol || 'N/A'}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSignalColor(stock.signal)} text-white`}>
                  {getSignalText()}
                </span>
              </div>
              <p className="text-sm text-emerald-300/70">
                {stock.name || stock.companyName || stock.symbol || (isHindi ? 'अज्ञात कंपनी' : 'Unknown Company')}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{formatPrice(currentPrice)}</div>
              <div className={`flex items-center justify-end space-x-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-medium">
                  {isPositive ? '+' : ''}{parseFloat(changePercent).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* CONFIDENCE BADGE */}
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-300">
                {isHindi ? 'AI आत्मविश्वास:' : 'AI Confidence:'} {confidence}
              </span>
            </div>
          </div>

          {/* KEY METRICS */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300/80">{isHindi ? 'टारगेट' : 'Target'}</span>
                </div>
                <span className="text-sm font-medium text-white">{formatPrice(getTargetPrice())}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-emerald-300/80">{isHindi ? 'स्टॉप लॉस' : 'Stop Loss'}</span>
                </div>
                <span className="text-sm font-medium text-white">{formatPrice(getStopLoss())}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-300/80">{isHindi ? 'रिस्क' : 'Risk'}</span>
                {getRiskBadge(stock.riskLevel)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-300/80">{isHindi ? 'टाइमफ्रेम' : 'Time Frame'}</span>
                <span className="text-sm font-medium text-white">
                  {stock.timeFrame || (isHindi ? 'इंट्राडे' : 'Intraday')}
                </span>
              </div>
            </div>
          </div>

          {/* VOLUME & SOURCE */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/30 rounded-lg p-2">
                <p className="text-emerald-300/60 mb-1">{isHindi ? 'वॉल्यूम' : 'Volume'}</p>
                <p className="text-white font-medium">
                  {(stock.volume || stock.market_data?.volume || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-2">
                <p className="text-emerald-300/60 mb-1">{isHindi ? 'स्रोत' : 'Source'}</p>
                <p className="text-white font-medium">{stock.source || 'Real-time API'}</p>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEntryPopup(true)}
              disabled={!connectionStatus?.broker}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 ${
                connectionStatus?.broker
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {connectionStatus?.broker 
                ? (isHindi ? 'ट्रेड में एंटर करें' : 'Enter Trade')
                : (isHindi ? 'ब्रोकर कनेक्ट करें' : 'Connect Broker')
              }
            </button>
            
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2.5 border border-emerald-500/30 rounded-xl hover:bg-emerald-900/20 transition-colors duration-200"
            >
              <Info className="w-5 h-5 text-emerald-400" />
            </button>
          </div>

          {/* EXPANDED DETAILS */}
          {expanded && (
            <div className="mt-4 pt-4 border-t border-emerald-900/40">
              <h4 className="font-medium text-white mb-3">{isHindi ? 'विश्लेषण विवरण' : 'Analysis Details'}</h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <p className="text-emerald-300/60">{isHindi ? 'उच्च' : 'High'}</p>
                  <p className="text-white font-medium">{formatPrice(stock.high || stock.market_data?.high)}</p>
                </div>
                <div>
                  <p className="text-emerald-300/60">{isHindi ? 'निम्न' : 'Low'}</p>
                  <p className="text-white font-medium">{formatPrice(stock.low || stock.market_data?.low)}</p>
                </div>
              </div>
              
              <div className="bg-slate-800/30 rounded-lg p-3">
                <p className="text-emerald-300/60 text-xs mb-1">{isHindi ? 'AI कारण' : 'AI Reason'}</p>
                <p className="text-white text-sm">
                  {stock.reason || stock.ai_signal?.reason || (isHindi ? 'उच्च मात्रा पुष्टि' : 'High volume confirmation')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ENTRY POPUP */}
      {showEntryPopup && (
        <EntryPopup
          stock={stock}
          entryPrice={getEntryPrice()}
          targetPrice={getTargetPrice()}
          stopLoss={getStopLoss()}
          currentPrice={currentPrice}
          onClose={() => setShowEntryPopup(false)}
          onSubmit={(data) => {
            if (onTrade) {
              onTrade('BUY', {
                ...data,
                symbol: stock.symbol,
                name: stock.name || stock.companyName || stock.symbol
              });
            }
            setShowEntryPopup(false);
          }}
          isHindi={isHindi}
        />
      )}

      {/* EXIT POPUP */}
      {showExitPopup && (
        <ExitPopup
          stock={stock}
          onClose={() => setShowExitPopup(false)}
          onSubmit={(data) => {
            if (onTrade) {
              onTrade('SELL', {
                ...data,
                symbol: stock.symbol,
                name: stock.name || stock.companyName || stock.symbol
              });
            }
            setShowExitPopup(false);
          }}
          isHindi={isHindi}
        />
      )}
    </>
  );
};

export default StockCard;
