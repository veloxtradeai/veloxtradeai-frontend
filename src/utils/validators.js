// Form validation functions

// Email validation
export const validateEmail = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  if (!pattern.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  return { valid: true, message: '' };
};

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password must contain lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain number' };
  }
  
  return { valid: true, message: '' };
};

// Phone validation
export const validatePhone = (phone) => {
  const pattern = /^[0-9]{10}$/;
  
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  if (!pattern.test(phone)) {
    return { valid: false, message: 'Phone must be 10 digits' };
  }
  
  return { valid: true, message: '' };
};

// Name validation
export const validateName = (name) => {
  if (!name) {
    return { valid: false, message: 'Name is required' };
  }
  
  if (name.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  
  return { valid: true, message: '' };
};

// Quantity validation
export const validateQuantity = (quantity) => {
  if (!quantity && quantity !== 0) {
    return { valid: false, message: 'Quantity is required' };
  }
  
  const qty = Number(quantity);
  
  if (isNaN(qty)) {
    return { valid: false, message: 'Quantity must be a number' };
  }
  
  if (qty <= 0) {
    return { valid: false, message: 'Quantity must be greater than 0' };
  }
  
  if (!Number.isInteger(qty)) {
    return { valid: false, message: 'Quantity must be a whole number' };
  }
  
  return { valid: true, message: '' };
};

// Price validation
export const validatePrice = (price) => {
  if (!price && price !== 0) {
    return { valid: false, message: 'Price is required' };
  }
  
  const priceNum = Number(price);
  
  if (isNaN(priceNum)) {
    return { valid: false, message: 'Price must be a number' };
  }
  
  if (priceNum <= 0) {
    return { valid: false, message: 'Price must be greater than 0' };
  }
  
  return { valid: true, message: '' };
};

// Stop loss validation
export const validateStopLoss = (stopLoss, entryPrice) => {
  if (!stopLoss && stopLoss !== 0) {
    return { valid: false, message: 'Stop loss is required' };
  }
  
  const stopLossNum = Number(stopLoss);
  const entryPriceNum = Number(entryPrice);
  
  if (isNaN(stopLossNum)) {
    return { valid: false, message: 'Stop loss must be a number' };
  }
  
  if (stopLossNum <= 0) {
    return { valid: false, message: 'Stop loss must be greater than 0' };
  }
  
  if (entryPriceNum && stopLossNum >= entryPriceNum) {
    return { valid: false, message: 'Stop loss must be less than entry price' };
  }
  
  return { valid: true, message: '' };
};

// Target validation
export const validateTarget = (target, entryPrice) => {
  if (!target && target !== 0) {
    return { valid: false, message: 'Target price is required' };
  }
  
  const targetNum = Number(target);
  const entryPriceNum = Number(entryPrice);
  
  if (isNaN(targetNum)) {
    return { valid: false, message: 'Target must be a number' };
  }
  
  if (targetNum <= 0) {
    return { valid: false, message: 'Target must be greater than 0' };
  }
  
  if (entryPriceNum && targetNum <= entryPriceNum) {
    return { valid: false, message: 'Target must be greater than entry price' };
  }
  
  return { valid: true, message: '' };
};

// Capital percentage validation
export const validateCapitalPercent = (percent) => {
  if (!percent && percent !== 0) {
    return { valid: false, message: 'Capital percentage is required' };
  }
  
  const percentNum = Number(percent);
  
  if (isNaN(percentNum)) {
    return { valid: false, message: 'Percentage must be a number' };
  }
  
  if (percentNum < 1) {
    return { valid: false, message: 'Percentage must be at least 1%' };
  }
  
  if (percentNum > 100) {
    return { valid: false, message: 'Percentage cannot exceed 100%' };
  }
  
  return { valid: true, message: '' };
};

// API key validation
export const validateApiKey = (apiKey) => {
  if (!apiKey) {
    return { valid: false, message: 'API key is required' };
  }
  
  if (apiKey.length < 10) {
    return { valid: false, message: 'API key is too short' };
  }
  
  return { valid: true, message: '' };
};

// API secret validation
export const validateApiSecret = (apiSecret) => {
  if (!apiSecret) {
    return { valid: false, message: 'API secret is required' };
  }
  
  if (apiSecret.length < 10) {
    return { valid: false, message: 'API secret is too short' };
  }
  
  return { valid: true, message: '' };
};

// Trade form validation
export const validateTradeForm = (formData) => {
  const errors = {};
  
  // Validate symbol
  if (!formData.symbol) {
    errors.symbol = 'Stock symbol is required';
  }
  
  // Validate quantity
  const quantityResult = validateQuantity(formData.quantity);
  if (!quantityResult.valid) {
    errors.quantity = quantityResult.message;
  }
  
  // Validate entry price
  const priceResult = validatePrice(formData.entryPrice);
  if (!priceResult.valid) {
    errors.entryPrice = priceResult.message;
  }
  
  // Validate stop loss if provided
  if (formData.stopLoss) {
    const stopLossResult = validateStopLoss(formData.stopLoss, formData.entryPrice);
    if (!stopLossResult.valid) {
      errors.stopLoss = stopLossResult.message;
    }
  }
  
  // Validate target if provided
  if (formData.target) {
    const targetResult = validateTarget(formData.target, formData.entryPrice);
    if (!targetResult.valid) {
      errors.target = targetResult.message;
    }
  }
  
  // Validate broker
  if (!formData.broker) {
    errors.broker = 'Broker selection is required';
  }
  
  // Validate order type
  if (!formData.orderType) {
    errors.orderType = 'Order type is required';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Registration form validation
export const validateRegistrationForm = (formData) => {
  const errors = {};
  
  // Validate name
  const nameResult = validateName(formData.name);
  if (!nameResult.valid) {
    errors.name = nameResult.message;
  }
  
  // Validate email
  const emailResult = validateEmail(formData.email);
  if (!emailResult.valid) {
    errors.email = emailResult.message;
  }
  
  // Validate phone
  const phoneResult = validatePhone(formData.phone);
  if (!phoneResult.valid) {
    errors.phone = phoneResult.message;
  }
  
  // Validate password
  const passwordResult = validatePassword(formData.password);
  if (!passwordResult.valid) {
    errors.password = passwordResult.message;
  }
  
  // Validate confirm password
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // Validate terms
  if (!formData.agreeTerms) {
    errors.agreeTerms = 'You must agree to the terms and conditions';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Login form validation
export const validateLoginForm = (formData) => {
  const errors = {};
  
  // Validate email
  const emailResult = validateEmail(formData.email);
  if (!emailResult.valid) {
    errors.email = emailResult.message;
  }
  
  // Validate password
  if (!formData.password) {
    errors.password = 'Password is required';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Broker connection validation
export const validateBrokerConnection = (formData) => {
  const errors = {};
  
  // Validate API key
  const apiKeyResult = validateApiKey(formData.apiKey);
  if (!apiKeyResult.valid) {
    errors.apiKey = apiKeyResult.message;
  }
  
  // Validate API secret
  const apiSecretResult = validateApiSecret(formData.apiSecret);
  if (!apiSecretResult.valid) {
    errors.apiSecret = apiSecretResult.message;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Export all validators
export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateQuantity,
  validatePrice,
  validateStopLoss,
  validateTarget,
  validateCapitalPercent,
  validateApiKey,
  validateApiSecret,
  validateTradeForm,
  validateRegistrationForm,
  validateLoginForm,
  validateBrokerConnection
};