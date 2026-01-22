import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Shield, 
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [shakeError, setShakeError] = useState(false);
  const [particles, setParticles] = useState([]);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Create background particles
  useEffect(() => {
    const particlesArray = [];
    for (let i = 0; i < 30; i++) {
      particlesArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.2,
        delay: Math.random() * 5
      });
    }
    setParticles(particlesArray);
  }, []);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setShakeError(false);
    setIsLoading(true);

    // Validate credentials
    const validCredentials = {
      'admin@velox.com': 'admin@123',
      'demo@velox.com': 'demo@123'
    };

    if (!validCredentials[email] || validCredentials[email] !== password) {
      setTimeout(() => {
        setLoginError('Invalid email or password');
        setShakeError(true);
        setIsLoading(false);
        setTimeout(() => setShakeError(false), 500);
      }, 800);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const result = await login(email, password);
      
      if (result.success) {
        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem('velox_remember_email', email);
        } else {
          localStorage.removeItem('velox_remember_email');
        }
        
        // Success animation before redirect
        setTimeout(() => {
          navigate('/dashboard');
        }, 600);
      }
    } catch (err) {
      setLoginError('An error occurred. Please try again.');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fill remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('velox_remember_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8 relative overflow-hidden">
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-white/10"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animation: `float ${10 / particle.speed}s ease-in-out infinite ${particle.delay}s`
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-transparent" />
        </div>

        <div className={`relative w-full max-w-md transform transition-all duration-500 ${
          shakeError ? 'animate-shake' : ''
        }`}>
          {/* Logo Header */}
          <div className="text-center mb-10 animate-fade-in-down">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-pulse-slow">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              VeloxTrade<span className="text-blue-400">AI</span>
            </h1>
            <p className="text-blue-200/70 text-lg">AI-Powered Trading Platform</p>
          </div>

          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-black/20 p-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-green-300">Secure Login</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {loginError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-300" />
                    <p className="text-red-200">{loginError}</p>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="group">
                <label className="block text-sm font-medium text-blue-200 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 transition-colors ${
                      email ? 'text-blue-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 group-hover:border-white/20"
                    placeholder="Enter your email"
                    required
                  />
                  {email && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-400 animate-scale-in" />
                    </div>
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-blue-200 ml-1">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors ${
                      password ? 'text-blue-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 group-hover:border-white/20"
                    placeholder="Enter your password"
                    required
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
              </div>

              {/* Remember Me & Submit */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all duration-300 ${
                      rememberMe 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-white/30 group-hover:border-white/50'
                    }`}>
                      {rememberMe && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-sm animate-scale-in" />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-blue-200 text-sm select-none">
                    Remember me
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`relative px-8 py-3 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    isLoading 
                      ? 'bg-blue-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="my-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-blue-200/50">Don't have an account?</span>
              </div>
            </div>

            {/* Register Link */}
            <Link
              to="/register"
              className="block w-full py-3 px-4 text-center border-2 border-white/10 text-white hover:border-white/20 hover:bg-white/5 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-95 group"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>Create New Account</span>
                <Zap className="w-4 h-4 group-hover:text-yellow-400 transition-colors" />
              </span>
            </Link>

            {/* Security Note */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-200 font-medium">Secure Login</p>
                  <p className="text-xs text-blue-300/70 mt-1">
                    Your credentials are encrypted and never stored on our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-blue-300/50 text-sm">
              © 2024 VeloxTradeAI. All rights reserved.
            </p>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <a href="#" className="text-blue-300/50 hover:text-blue-300 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-blue-300/50 hover:text-blue-300 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-blue-300/50 hover:text-blue-300 text-sm transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-800 to-gray-900 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
        
        <div className="relative z-10 max-w-lg mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">
            Smart Trading <span className="text-blue-400">Powered by AI</span>
          </h2>
          
          <div className="space-y-8">
            {[
              {
                icon: '🤖',
                title: 'AI-Powered Analysis',
                desc: 'Advanced algorithms analyze market trends in real-time'
              },
              {
                icon: '⚡',
                title: 'Real-time Execution',
                desc: 'Instant trade execution with minimal latency'
              },
              {
                icon: '📈',
                title: 'Portfolio Insights',
                desc: 'Get detailed analytics of your investment portfolio'
              },
              {
                icon: '🔒',
                title: 'Bank-level Security',
                desc: 'Military-grade encryption for all your transactions'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-start space-x-4 group cursor-pointer transform transition-all duration-300 hover:translate-x-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-sm text-gray-300">Active Traders</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">₹2.1Cr</div>
              <div className="text-sm text-gray-300">Daily Volume</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">99.8%</div>
              <div className="text-sm text-gray-300">Uptime</div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Mobile Features */}
      <div className="lg:hidden absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-900 to-transparent">
        <div className="text-center">
          <p className="text-blue-300 text-sm mb-2">Trusted by thousands of traders</p>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-300">Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-300">Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-300">Reliable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(0) translateX(10px); }
          75% { transform: translateY(10px) translateX(5px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
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
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-fade-in {
          animation: fadeInUp 0.4s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;