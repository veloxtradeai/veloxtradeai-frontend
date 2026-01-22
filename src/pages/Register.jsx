import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Building, 
  Eye, 
  EyeOff,
  TrendingUp,
  Shield,
  Check,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  Award
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    broker: '',
    tradingExperience: 'beginner',
    agreeTerms: false,
    agreeMarketing: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [progressWidth, setProgressWidth] = useState('33%');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();
  const { register } = useAuth();

  const brokers = [
    { id: 'zerodha', name: 'Zerodha', icon: 'Z', color: 'bg-orange-100 text-orange-600' },
    { id: 'upstox', name: 'Upstox', icon: 'U', color: 'bg-blue-100 text-blue-600' },
    { id: 'groww', name: 'Groww', icon: 'G', color: 'bg-green-100 text-green-600' },
    { id: 'angel', name: 'Angel One', icon: 'A', color: 'bg-red-100 text-red-600' },
    { id: 'choice', name: 'Choice', icon: 'C', color: 'bg-purple-100 text-purple-600' },
    { id: 'none', name: 'No Broker Yet', icon: '?', color: 'bg-gray-100 text-gray-600' }
  ];

  const experienceLevels = [
    { 
      id: 'beginner', 
      label: 'Beginner', 
      desc: '0-1 years experience',
      icon: '🟢',
      color: 'from-emerald-400 to-green-500'
    },
    { 
      id: 'intermediate', 
      label: 'Intermediate', 
      desc: '1-3 years experience',
      icon: '🟡',
      color: 'from-amber-400 to-yellow-500'
    },
    { 
      id: 'advanced', 
      label: 'Advanced', 
      desc: '3+ years experience',
      icon: '🔴',
      color: 'from-red-400 to-rose-500'
    }
  ];

  // Update progress bar
  useEffect(() => {
    const width = currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%';
    setProgressWidth(width);
  }, [currentStep]);

  // Check password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (formData.password.length >= 8) strength += 25;
    if (/[A-Z]/.test(formData.password)) strength += 25;
    if (/[0-9]/.test(formData.password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;

    setPasswordStrength(strength);
  }, [formData.password]);

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone must be 10 digits';
    
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const validateForm = () => {
    const step1Errors = validateStep1();
    const step2Errors = validateStep2();
    
    if (!formData.agreeTerms) {
      return { ...step1Errors, ...step2Errors, agreeTerms: 'You must agree to the terms' };
    }
    
    return { ...step1Errors, ...step2Errors };
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      const errors = validateStep1();
      if (Object.keys(errors).length === 0) {
        setCurrentStep(2);
      } else {
        setErrors(errors);
      }
    } else if (currentStep === 2) {
      const errors = validateStep2();
      if (Object.keys(errors).length === 0) {
        setCurrentStep(3);
      } else {
        setErrors(errors);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ submit: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Join <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">VeloxTradeAI</span>
          </h1>
          <p className="text-blue-200/70 text-lg">Start your smart trading journey today</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-black/20 overflow-hidden">
          {/* Progress Bar */}
          <div className="h-2 bg-white/5">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: progressWidth }}
            />
          </div>

          <div className="p-8">
            {/* Steps Indicator */}
            <div className="flex justify-between mb-10 relative">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-2 transition-all duration-300 ${
                    step < currentStep 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                      : step === currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 animate-pulse'
                      : 'bg-white/10 text-white/50 border border-white/20'
                  }`}>
                    {step < currentStep ? <Check className="w-5 h-5" /> : step}
                  </div>
                  <span className={`text-sm font-medium ${
                    step <= currentStep ? 'text-white' : 'text-white/50'
                  }`}>
                    {step === 1 ? 'Personal Info' : step === 2 ? 'Security' : 'Preferences'}
                  </span>
                </div>
              ))}
              <div className="absolute top-6 left-16 right-16 h-0.5 bg-white/10 -z-10" />
            </div>

            {errors.submit && (
              <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 animate-shake">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-red-200">{errors.submit}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="group">
                      <label className="block text-sm font-medium text-blue-200 mb-2 ml-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className={`h-5 w-5 transition-colors ${
                            formData.name ? 'text-blue-400' : 'text-gray-400'
                          }`} />
                        </div>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${
                            errors.name ? 'border-red-500/50' : 'border-white/10 group-hover:border-white/20'
                          }`}
                          placeholder="John Doe"
                        />
                        {formData.name && !errors.name && (
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <Check className="h-5 w-5 text-green-400 animate-scale-in" />
                          </div>
                        )}
                      </div>
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-300 animate-fade-in">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="group">
                      <label className="block text-sm font-medium text-blue-200 mb-2 ml-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className={`h-5 w-5 transition-colors ${
                            formData.email ? 'text-blue-400' : 'text-gray-400'
                          }`} />
                        </div>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${
                            errors.email ? 'border-red-500/50' : 'border-white/10 group-hover:border-white/20'
                          }`}
                          placeholder="you@example.com"
                        />
                        {formData.email && !errors.email && (
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <Check className="h-5 w-5 text-green-400 animate-scale-in" />
                          </div>
                        )}
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-300 animate-fade-in">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="group">
                      <label className="block text-sm font-medium text-blue-200 mb-2 ml-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className={`h-5 w-5 transition-colors ${
                            formData.phone ? 'text-blue-400' : 'text-gray-400'
                          }`} />
                        </div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${
                            errors.phone ? 'border-red-500/50' : 'border-white/10 group-hover:border-white/20'
                          }`}
                          placeholder="9876543210"
                        />
                        {formData.phone && !errors.phone && (
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <Check className="h-5 w-5 text-green-400 animate-scale-in" />
                          </div>
                        )}
                      </div>
                      {errors.phone && (
                        <p className="mt-2 text-sm text-red-300 animate-fade-in">{errors.phone}</p>
                      )}
                    </div>

                    {/* Broker */}
                    <div className="group">
                      <label className="block text-sm font-medium text-blue-200 mb-2 ml-1">
                        Preferred Broker
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Building className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          value={formData.broker}
                          onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-gray-900">Select Broker</option>
                          {brokers.map((broker) => (
                            <option key={broker.id} value={broker.id} className="bg-gray-900">
                              {broker.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <div className="w-2 h-2 border-t-2 border-r-2 border-white/50 transform rotate-45" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Security */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Password */}
                  <div className="group">
                    <label className="block text-sm font-medium text-blue-200 mb-2 ml-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 transition-colors ${
                          formData.password ? 'text-blue-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full pl-12 pr-12 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${
                          errors.password ? 'border-red-500/50' : 'border-white/10 group-hover:border-white/20'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                        )}
                      </button>
                    </div>
                    
                    {/* Password Strength */}
                    {formData.password && (
                      <div className="mt-3 space-y-2 animate-fade-in">
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-200">Password Strength</span>
                          <span className={`font-medium ${
                            passwordStrength < 25 ? 'text-red-400' :
                            passwordStrength < 50 ? 'text-orange-400' :
                            passwordStrength < 75 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {passwordStrength < 25 ? 'Weak' :
                             passwordStrength < 50 ? 'Fair' :
                             passwordStrength < 75 ? 'Good' : 'Strong'}
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${getStrengthColor()}`}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              formData.password.length >= 8 ? 'bg-green-400' : 'bg-white/20'
                            }`} />
                            <span className={formData.password.length >= 8 ? 'text-green-300' : 'text-white/50'}>
                              8+ characters
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              /[A-Z]/.test(formData.password) ? 'bg-green-400' : 'bg-white/20'
                            }`} />
                            <span className={/[A-Z]/.test(formData.password) ? 'text-green-300' : 'text-white/50'}>
                              Uppercase
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              /[0-9]/.test(formData.password) ? 'bg-green-400' : 'bg-white/20'
                            }`} />
                            <span className={/[0-9]/.test(formData.password) ? 'text-green-300' : 'text-white/50'}>
                              Number
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              /[^A-Za-z0-9]/.test(formData.password) ? 'bg-green-400' : 'bg-white/20'
                            }`} />
                            <span className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-300' : 'text-white/50'}>
                              Special
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-300 animate-fade-in">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="group">
                    <label className="block text-sm font-medium text-blue-200 mb-2 ml-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 transition-colors ${
                          formData.confirmPassword ? 'text-blue-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={`w-full pl-12 pr-12 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${
                          errors.confirmPassword ? 'border-red-500/50' : 'border-white/10 group-hover:border-white/20'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-300 animate-fade-in">{errors.confirmPassword}</p>
                    )}
                    
                    {/* Password Match Indicator */}
                    {formData.password && formData.confirmPassword && (
                      <div className="mt-3 flex items-center space-x-2 animate-fade-in">
                        <div className={`w-3 h-3 rounded-full ${
                          formData.password === formData.confirmPassword 
                            ? 'bg-green-400 animate-pulse' 
                            : 'bg-red-400'
                        }`} />
                        <span className={`text-xs ${
                          formData.password === formData.confirmPassword 
                            ? 'text-green-300' 
                            : 'text-red-300'
                        }`}>
                          {formData.password === formData.confirmPassword 
                            ? 'Passwords match' 
                            : 'Passwords do not match'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Security Tips */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-200 font-medium">Security Tips</p>
                        <ul className="mt-2 space-y-1">
                          <li className="text-xs text-blue-300/70 flex items-center space-x-2">
                            <div className="w-1 h-1 bg-blue-400 rounded-full" />
                            <span>Use a unique password for VeloxTradeAI</span>
                          </li>
                          <li className="text-xs text-blue-300/70 flex items-center space-x-2">
                            <div className="w-1 h-1 bg-blue-400 rounded-full" />
                            <span>Enable two-factor authentication after registration</span>
                          </li>
                          <li className="text-xs text-blue-300/70 flex items-center space-x-2">
                            <div className="w-1 h-1 bg-blue-400 rounded-full" />
                            <span>Never share your password with anyone</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Preferences */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Trading Experience */}
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-4 ml-1">
                      Trading Experience Level
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, tradingExperience: level.id })}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                            formData.tradingExperience === level.id
                              ? `border-transparent bg-gradient-to-r ${level.color} text-white shadow-lg`
                              : 'border-white/10 bg-white/5 text-white hover:border-white/20'
                          }`}
                        >
                          <div className="text-2xl mb-2">{level.icon}</div>
                          <div className="font-medium text-lg">{level.label}</div>
                          <div className="text-sm opacity-80 mt-1">{level.desc}</div>
                          {formData.tradingExperience === level.id && (
                            <div className="mt-3 flex justify-center">
                              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center animate-scale-in">
                                <Check className="w-3 h-3 text-gray-900" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="space-y-4">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <div className="relative mt-1">
                        <input
                          type="checkbox"
                          checked={formData.agreeTerms}
                          onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all duration-300 flex items-center justify-center ${
                          formData.agreeTerms 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent' 
                            : 'border-white/30 group-hover:border-white/50'
                        }`}>
                          {formData.agreeTerms && (
                            <Check className="w-3 h-3 text-white animate-scale-in" />
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-200">
                          I agree to the{' '}
                          <a href="#" className="text-blue-300 hover:text-blue-200 underline">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="#" className="text-blue-300 hover:text-blue-200 underline">
                            Privacy Policy
                          </a>
                        </span>
                        {errors.agreeTerms && (
                          <p className="mt-1 text-sm text-red-300">{errors.agreeTerms}</p>
                        )}
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <div className="relative mt-1">
                        <input
                          type="checkbox"
                          checked={formData.agreeMarketing}
                          onChange={(e) => setFormData({ ...formData, agreeMarketing: e.target.checked })}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all duration-300 flex items-center justify-center ${
                          formData.agreeMarketing 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-transparent' 
                            : 'border-white/30 group-hover:border-white/50'
                        }`}>
                          {formData.agreeMarketing && (
                            <Check className="w-3 h-3 text-white animate-scale-in" />
                          )}
                        </div>
                      </div>
                      <span className="text-blue-200">
                        Send me trading insights, market updates, and platform news
                      </span>
                    </label>
                  </div>

                  {/* Benefits */}
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <Award className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-green-200 font-medium">Registration Benefits</p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <Zap className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-green-300">Free 7-day trial</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-green-300">AI trade signals</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-green-300">Portfolio analytics</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Shield className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-green-300">Risk management</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-10">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 border-2 border-white/10 text-white hover:border-white/20 hover:bg-white/5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    ← Back
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="ml-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    Continue → 
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`ml-auto px-8 py-3 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      loading 
                        ? 'bg-blue-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/30'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Registration</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </span>
                  </button>
                )}
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-blue-200">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-300 hover:text-blue-200 font-medium underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-blue-300/50 text-sm">
            By registering, you confirm you're at least 18 years old and agree to our terms.
          </p>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <a href="#" className="text-blue-300/50 hover:text-blue-300 text-sm transition-colors">
              Help Center
            </a>
            <a href="#" className="text-blue-300/50 hover:text-blue-300 text-sm transition-colors">
              Contact Us
            </a>
            <a href="#" className="text-blue-300/50 hover:text-blue-300 text-sm transition-colors">
              API Documentation
            </a>
          </div>
        </div>
      </div>

      {/* Add CSS Animations */}
      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Register;