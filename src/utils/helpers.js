// Utility helper functions

// Format currency
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value, decimals = 2) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

// Format date
export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return d.toLocaleDateString();
};

// Calculate profit/loss
export const calculatePnL = (entryPrice, exitPrice, quantity) => {
  const pnl = (exitPrice - entryPrice) * quantity;
  const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
  
  return {
    absolute: pnl,
    percentage: pnlPercent,
    isProfit: pnl >= 0
  };
};

// Calculate risk percentage
export const calculateRisk = (entryPrice, stopLoss) => {
  return ((entryPrice - stopLoss) / entryPrice) * 100;
};

// Calculate reward percentage
export const calculateReward = (entryPrice, target) => {
  return ((target - entryPrice) / entryPrice) * 100;
};

// Calculate position size
export const calculatePositionSize = (capital, riskPercent, entryPrice, stopLoss) => {
  const riskAmount = (riskPercent / 100) * capital;
  const riskPerShare = entryPrice - stopLoss;
  
  if (riskPerShare <= 0) return 0;
  
  return Math.floor(riskAmount / riskPerShare);
};

// Generate random color
export const getRandomColor = () => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Validate email
export const isValidEmail = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  const pattern = /^[0-9]{10}$/;
  return pattern.test(phone);
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// Download file
export const downloadFile = (content, fileName, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Format large numbers
export const formatLargeNumber = (num) => {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(1) + 'Cr';
  }
  if (num >= 100000) {
    return (num / 100000).toFixed(1) + 'L';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Sleep function
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Check if mobile device
export const isMobile = () => {
  return window.innerWidth <= 768;
};

// Check if tablet device
export const isTablet = () => {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

// Check if desktop device
export const isDesktop = () => {
  return window.innerWidth > 1024;
};

export default {
  formatCurrency,
  formatPercentage,
  formatDate,
  calculatePnL,
  calculateRisk,
  calculateReward,
  calculatePositionSize,
  getRandomColor,
  debounce,
  throttle,
  isValidEmail,
  isValidPhone,
  copyToClipboard,
  downloadFile,
  getInitials,
  formatLargeNumber,
  sleep,
  generateId,
  isMobile,
  isTablet,
  isDesktop
};