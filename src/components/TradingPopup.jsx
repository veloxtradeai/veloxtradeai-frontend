import React, { useState, useEffect } from 'react';
import { tradingAPI } from '../services/api';
import './TradingPopup.css';

const TradingPopup = () => {
  const [signals, setSignals] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentSignal, setCurrentSignal] = useState(null);
  const [customQuantity, setCustomQuantity] = useState(10);

  // Fetch signals every 30 seconds
  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const response = await tradingAPI.getSignals();
        if (response.success && response.signals.length > 0) {
          setSignals(response.signals);
          
          // Show popup for high confidence signals (90%+)
          const highConfidenceSignal = response.signals.find(
            signal => parseFloat(signal.confidence) >= 90
          );
          
          if (highConfidenceSignal) {
            setCurrentSignal(highConfidenceSignal);
            setShowPopup(true);
            setCustomQuantity(highConfidenceSignal.quantity || 10);
          }
        }
      } catch (error) {
        console.error('Error fetching signals:', error);
      }
    };

    fetchSignals();
    const intervalId = setInterval(fetchSignals, 30000); // Every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  const handleBuy = async () => {
    if (!currentSignal) return;

    try {
      const orderData = {
        symbol: currentSignal.symbol,
        quantity: customQuantity,
        price: currentSignal.entry_price,
        order_type: 'MARKET',
        action: 'BUY'
      };

      // Place order through broker or save trade
      const response = await tradingAPI.placeOrder(orderData);
      
      if (response.success) {
        alert(`Order placed successfully! Order ID: ${response.order_id}`);
        
        // Start auto-adjust monitoring
        startAutoAdjust(response.order_id, currentSignal);
      }
    } catch (error) {
      alert(`Order failed: ${error.message}`);
    }
    
    setShowPopup(false);
  };

  const handleSkip = () => {
    setShowPopup(false);
  };

  const handleCustomize = () => {
    // Show customization modal
    const newQuantity = prompt('Enter quantity:', customQuantity);
    if (newQuantity && !isNaN(newQuantity)) {
      setCustomQuantity(parseInt(newQuantity));
    }
  };

  const startAutoAdjust = (tradeId, signal) => {
    // Start monitoring price and auto-adjust SL/TGT
    const monitorInterval = setInterval(async () => {
      try {
        // Get current price (in real app, use WebSocket)
        const marketResponse = await marketAPI.getLiveData(signal.symbol);
        if (marketResponse.success && marketResponse.data[0]) {
          const currentPrice = marketResponse.data[0].last_price;
          
          // Auto-adjust trade
          await tradeAPI.autoAdjust(tradeId, currentPrice);
          
          console.log(`Auto-adjusted ${signal.symbol} at ₹${currentPrice}`);
        }
      } catch (error) {
        console.error('Auto-adjust error:', error);
      }
    }, 60000); // Every minute

    // Stop monitoring after 4 hours (market close)
    setTimeout(() => {
      clearInterval(monitorInterval);
    }, 4 * 60 * 60 * 1000);
  };

  if (!showPopup || !currentSignal) return null;

  return (
    <div className="trading-popup-overlay">
      <div className="trading-popup">
        <div className="popup-header">
          <h3>🎯 HIGH CONFIDENCE TRADING SIGNAL</h3>
          <button className="close-btn" onClick={() => setShowPopup(false)}>✕</button>
        </div>
        
        <div className="signal-details">
          <div className="stock-info">
            <span className="stock-symbol">{currentSignal.symbol}</span>
            <span className="confidence-badge" style={{
              backgroundColor: parseFloat(currentSignal.confidence) >= 90 ? '#10b981' : 
                              parseFloat(currentSignal.confidence) >= 80 ? '#3b82f6' : '#f59e0b'
            }}>
              {currentSignal.confidence}% Confidence
            </span>
          </div>
          
          <div className="price-levels">
            <div className="level">
              <span className="label">Entry Price:</span>
              <span className="value">₹{currentSignal.entry_price}</span>
            </div>
            <div className="level">
              <span className="label">Stop Loss:</span>
              <span className="value">₹{currentSignal.stop_loss}</span>
            </div>
            <div className="level">
              <span className="label">Target:</span>
              <span className="value">₹{currentSignal.target_price}</span>
            </div>
            <div className="level">
              <span className="label">Risk/Reward:</span>
              <span className="value">1:2.5</span>
            </div>
          </div>
          
          <div className="quantity-selector">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button onClick={() => setCustomQuantity(Math.max(1, customQuantity - 1))}>-</button>
              <input 
                type="number" 
                value={customQuantity} 
                onChange={(e) => setCustomQuantity(parseInt(e.target.value) || 1)}
                min="1"
              />
              <button onClick={() => setCustomQuantity(customQuantity + 1)}>+</button>
            </div>
            <div className="investment-amount">
              Investment: ₹{(currentSignal.entry_price * customQuantity).toFixed(2)}
            </div>
          </div>
          
          <div className="signal-reason">
            <strong>Reason:</strong> {currentSignal.reason}
          </div>
        </div>
        
        <div className="action-buttons">
          <button className="buy-btn" onClick={handleBuy}>
            ✅ BUY NOW (₹{currentSignal.entry_price})
          </button>
          <button className="skip-btn" onClick={handleSkip}>
            ❌ SKIP SIGNAL
          </button>
          <button className="customize-btn" onClick={handleCustomize}>
            ⚙️ CUSTOMIZE TRADE
          </button>
        </div>
        
        <div className="popup-footer">
          <small>Signal expires in 15 minutes • Auto-adjust feature enabled</small>
        </div>
      </div>
    </div>
  );
};

export default TradingPopup;
