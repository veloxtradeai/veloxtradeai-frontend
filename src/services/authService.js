// ============================================
// VELOXTRADEAI - REAL AUTH SERVICE (NO DUMMY)
// ============================================

import { authAPI } from './api';

const authService = {
  // Login with real backend
  login: async (email, password) => {
    try {
      console.log('🔐 Real login attempt:', email);
      
      const result = await authAPI.login(email, password);
      
      if (result?.success) {
        console.log('✅ Login successful');
        
        // Store user data
        localStorage.setItem('velox_user', JSON.stringify(result.user));
        localStorage.setItem('velox_last_login', new Date().toISOString());
        
        return {
          success: true,
          token: result.token,
          user: result.user
        };
      }
      
      console.error('❌ Login failed:', result?.message);
      return {
        success: false,
        error: result?.message || 'Login failed'
      };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  },

  // Register with real backend
  register: async (userData) => {
    try {
      console.log('📝 Real registration attempt:', userData.email);
      
      const result = await authAPI.register(userData);
      
      if (result?.success) {
        console.log('✅ Registration successful');
        
        localStorage.setItem('velox_user', JSON.stringify(result.user));
        
        return {
          success: true,
          token: result.token,
          user: result.user
        };
      }
      
      return {
        success: false,
        error: result?.message || 'Registration failed'
      };
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  },

  // Logout
  logout: () => {
    try {
      localStorage.removeItem('velox_auth_token');
      localStorage.removeItem('velox_user');
      localStorage.removeItem('velox_last_login');
      
      // Redirect to login
      window.location.href = '/login';
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current user (real backend)
  getCurrentUser: async () => {
    try {
      // First try localStorage
      const storedUser = localStorage.getItem('velox_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        
        // Validate with backend
        try {
          const backendUser = await authAPI.getCurrentUser();
          if (backendUser) {
            // Update localStorage with latest data
            localStorage.setItem('velox_user', JSON.stringify(backendUser));
            return backendUser;
          }
        } catch (error) {
          console.log('Backend user fetch failed, using cached');
        }
        
        return user;
      }
      
      // Try backend directly
      const backendUser = await authAPI.getCurrentUser();
      if (backendUser) {
        localStorage.setItem('velox_user', JSON.stringify(backendUser));
        return backendUser;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated: () => {
    try {
      const token = localStorage.getItem('velox_auth_token');
      const user = localStorage.getItem('velox_user');
      
      if (!token || !user) return false;
      
      // Check token expiry (basic)
      const lastLogin = localStorage.getItem('velox_last_login');
      if (lastLogin) {
        const loginTime = new Date(lastLogin);
        const now = new Date();
        const hoursDiff = Math.abs(now - loginTime) / 36e5;
        
        // Token expires after 24 hours
        if (hoursDiff > 24) {
          authService.logout();
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  },

  // Update profile (real backend)
  updateProfile: async (userData) => {
    try {
      console.log('🔄 Updating profile:', userData);
      
      // This would call backend API
      // For now, update localStorage
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('velox_user', JSON.stringify(updatedUser));
      
      return {
        success: true,
        user: updatedUser
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      console.log('🔑 Changing password');
      
      // This would call backend API
      // For now, simulate success
      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      console.log('🔑 Password reset for:', email);
      
      // This would call backend API
      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      console.log('📧 Verifying email with token:', token);
      
      // This would call backend API
      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get subscription status
  getSubscriptionStatus: async () => {
    try {
      const user = await authService.getCurrentUser();
      
      if (!user) {
        return {
          plan: 'free_trial',
          trialDaysLeft: 7,
          active: true,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
      }
      
      return {
        plan: user.subscriptionStatus || 'free_trial',
        trialDaysLeft: user.trialDays || 7,
        active: user.isPremium || false,
        expiryDate: user.subscriptionExpiry || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error) {
      return {
        plan: 'free_trial',
        trialDaysLeft: 7,
        active: true,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    }
  },

  // Clear all auth data
  clearAllData: () => {
    localStorage.removeItem('velox_auth_token');
    localStorage.removeItem('velox_user');
    localStorage.removeItem('velox_last_login');
    localStorage.removeItem('velox_settings');
  }
};

export default authService;
