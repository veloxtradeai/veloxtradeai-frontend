// Frontend-only auth service
const authService = {
  login: async (email, password) => {
    try {
      // Check if user exists in localStorage
      const users = JSON.parse(localStorage.getItem('velox_users') || '[]');
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        if (existingUser.password === password) {
          const token = 'velox_token_' + Date.now();
          const userData = { ...existingUser };
          delete userData.password;
          
          localStorage.setItem('velox_auth_token', token);
          localStorage.setItem('velox_user', JSON.stringify(userData));
          localStorage.setItem('velox_last_login', new Date().toISOString());
          
          return {
            success: true,
            token,
            user: userData
          };
        } else {
          throw new Error('Invalid password');
        }
      }
      
      // Create new user with trial
      const newUser = {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email,
        password,
        subscriptionStatus: 'trial',
        trialDays: 7,
        createdAt: new Date().toISOString(),
        isPremium: false
      };
      
      users.push(newUser);
      localStorage.setItem('velox_users', JSON.stringify(users));
      
      const token = 'velox_token_' + Date.now();
      const userData = { ...newUser };
      delete userData.password;
      
      localStorage.setItem('velox_auth_token', token);
      localStorage.setItem('velox_user', JSON.stringify(userData));
      
      return {
        success: true,
        token,
        user: userData
      };
      
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  register: async (userData) => {
    try {
      const users = JSON.parse(localStorage.getItem('velox_users') || '[]');
      
      // Check if user already exists
      if (users.find(u => u.email === userData.email)) {
        throw new Error('Email already registered');
      }
      
      const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        broker: userData.broker || '',
        tradingExperience: userData.tradingExperience || 'beginner',
        subscriptionStatus: 'trial',
        trialDays: 7,
        createdAt: new Date().toISOString(),
        isPremium: false
      };
      
      users.push(newUser);
      localStorage.setItem('velox_users', JSON.stringify(users));
      
      // Auto login after registration
      const token = 'velox_token_' + Date.now();
      const userResponse = { ...newUser };
      delete userResponse.password;
      
      localStorage.setItem('velox_auth_token', token);
      localStorage.setItem('velox_user', JSON.stringify(userResponse));
      
      return {
        success: true,
        token,
        user: userResponse
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  logout: () => {
    localStorage.removeItem('velox_auth_token');
    localStorage.removeItem('velox_user');
    return { success: true };
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('velox_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('velox_auth_token');
  },

  updateProfile: async (userData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      const users = JSON.parse(localStorage.getItem('velox_users') || '[]');
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...userData };
        localStorage.setItem('velox_users', JSON.stringify(users));
        
        const updatedUser = { ...users[userIndex] };
        delete updatedUser.password;
        localStorage.setItem('velox_user', JSON.stringify(updatedUser));
        
        return {
          success: true,
          user: updatedUser
        };
      }
      
      throw new Error('User not found');
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default authService;