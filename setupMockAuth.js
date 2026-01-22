// Copy and paste this in browser console at http://localhost:5173

// Auto login script
function autoLogin() {
  const userData = {
    id: '1',
    name: 'Admin User',
    email: 'admin@velox.com',
    subscriptionStatus: 'active',
    trialDaysRemaining: 365,
    isPremium: true,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token.123'
  };
  
  localStorage.setItem('velox_auth_token', userData.token);
  localStorage.setItem('velox_user', JSON.stringify(userData));
  localStorage.setItem('velox_mock_mode', 'true');
  
  console.log('✅ Mock authentication setup complete!');
  console.log('📧 Email: admin@velox.com');
  console.log('🔑 Token saved to localStorage');
  
  // Auto redirect to dashboard
  setTimeout(() => {
    window.location.href = '/dashboard';
  }, 1000);
}

// Create login button on page
function addLoginButton() {
  const btn = document.createElement('button');
  btn.textContent = '🚀 Auto Login (Mock Mode)';
  btn.style.position = 'fixed';
  btn.style.top = '10px';
  btn.style.right = '10px';
  btn.style.zIndex = '9999';
  btn.style.padding = '10px 15px';
  btn.style.background = '#4F46E5';
  btn.style.color = 'white';
  btn.style.border = 'none';
  btn.style.borderRadius = '5px';
  btn.style.cursor = 'pointer';
  btn.onclick = autoLogin;
  
  document.body.appendChild(btn);
}

// Run setup
addLoginButton();
autoLogin();