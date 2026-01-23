import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await api.auth.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.auth.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.auth.register(userData);
      
      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setError(null);
  };

  const updateProfile = async (userData) => {
    setLoading(true);
    
    try {
      // Note: API में updateProfile method नहीं है, लेकिन आपको बैकेंड में implement करना होगा
      // Temporary: Update local user state
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Save to localStorage
      localStorage.setItem('velox_user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMsg = err.message || 'Profile update failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = () => {
    if (!user) return false;
    
    if (user.subscription === 'trial') {
      const createdAt = new Date(user.createdAt || Date.now());
      const now = new Date();
      const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      
      return daysDiff <= (user.trialDays || 7);
    }
    
    return user.subscription === 'active' || user.subscription === 'pro' || user.isPremium;
  };

  const value = {
    user,
    loading,
    error,
    
    // Methods
    login,
    register,
    logout,
    updateProfile,
    
    // Helpers
    isAuthenticated: !!user,
    hasValidSubscription: checkSubscription(),
    isTrialActive: user?.subscription === 'trial'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
