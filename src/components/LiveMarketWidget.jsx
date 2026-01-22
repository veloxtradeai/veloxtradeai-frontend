import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const LiveMarketWidget = ({ data = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="live-market-widget">
        <div className="widget-header">
          <h3 className="widget-title">Live Markets</h3>
          <span className="market-status">Loading...</span>
        </div>
        <div className="widget-content">
          <div className="no-data">
            <p>Market data loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-market-widget">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <div className="live-indicator"></div>
          <h3 className="widget-title">Live Markets</h3>
        </div>
        <span className="market-status open">Market Open</span>
      </div>
      
      <div className="widget-content">
        <div className="stocks-list">
          {data.slice(0, 5).map((stock, index) => {
            const changePercent = stock.change_percent || ((stock.current_price - stock.previous_close) / stock.previous_close * 100);
            const isPositive = changePercent >= 0;
            
            return (
              <div 
                key={stock.symbol || index} 
                className={`stock-item ${activeIndex === index ? 'active' : ''}`}
                onClick={() => setActiveIndex(index)}
              >
                <div className="stock-info">
                  <div className="stock-symbol">{stock.symbol || 'NIFTY'}</div>
                  <div className="stock-price">₹{stock.current_price?.toLocaleString() || '0'}</div>
                </div>
                <div className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{isPositive ? '+' : ''}{changePercent?.toFixed(2)}%</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {data[activeIndex] && (
          <div className="stock-details">
            <div className="detail-row">
              <span>Open</span>
              <span>₹{data[activeIndex].open_price?.toLocaleString() || '0'}</span>
            </div>
            <div className="detail-row">
              <span>High</span>
              <span>₹{data[activeIndex].high_price?.toLocaleString() || '0'}</span>
            </div>
            <div className="detail-row">
              <span>Low</span>
              <span>₹{data[activeIndex].low_price?.toLocaleString() || '0'}</span>
            </div>
            <div className="detail-row">
              <span>Volume</span>
              <span>{(data[activeIndex].volume || 0).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMarketWidget;
