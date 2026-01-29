import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar, 
  Gift, 
  Award,
  Crown,
  Sparkles,
  ShieldCheck,
  Target,
  BarChart3,
  Bell,
  MessageSquare,
  Smartphone,
  CreditCard,
  Wallet,
  Lock,
  RefreshCw,
  HelpCircle,
  X,
  ChevronRight,
  Rocket,
  Trophy,
  Gem,
  CheckCircle,
  AlertCircle,
  DollarSign,
  IndianRupee,
  Globe,
  Cpu,
  Brain,
  Zap as Lightning,
  PieChart,
  LineChart,
  Activity,
  Users as UserGroup,
  Clock as Timer,
  Calendar as CalendarIcon,
  TrendingUp as ChartUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Subscription = () => {
  const { t, isHindi, language } = useLanguage();
  
  const [selectedPlan, setSelectedPlan] = useState('pro_monthly');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [selectedDuration, setSelectedDuration] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [remainingDays, setRemainingDays] = useState(7);

  // Load user's current subscription
  useEffect(() => {
    const loadUserSubscription = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const subscription = userData.subscription || null;
        
        if (subscription) {
          setCurrentPlan(subscription.plan);
          setRemainingDays(subscription.remaining_days || 0);
        } else {
          // Default to trial
          setCurrentPlan('trial');
          setRemainingDays(7);
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
        setCurrentPlan('trial');
        setRemainingDays(7);
      }
    };
    
    loadUserSubscription();
  }, []);

  const durations = [
    { 
      id: 'trial', 
      name: isHindi ? '7-दिन ट्रायल' : '7-Day Trial', 
      price: 0, 
      discount: 0, 
      popular: false, 
      duration: isHindi ? '7 दिन' : '7 days',
      icon: <Gift className="w-5 h-5" />,
      color: 'from-emerald-500 to-cyan-500',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      features: [isHindi ? 'सभी फीचर्स' : 'All Features', isHindi ? '7 दिन फ्री' : '7 Days Free']
    },
    { 
      id: 'monthly', 
      name: isHindi ? 'मासिक' : 'Monthly', 
      price: 1999, 
      discount: 0, 
      popular: true, 
      duration: isHindi ? '1 महीना' : '1 month',
      icon: <Calendar className="w-5 h-5" />,
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-500/20',
      borderColor: 'border-cyan-500/30',
      textColor: 'text-cyan-400',
      features: [isHindi ? 'लचीलापन' : 'Flexibility', isHindi ? 'कभी भी कैंसिल' : 'Cancel Anytime']
    },
    { 
      id: 'quarterly', 
      name: isHindi ? '3 महीने' : '3 Months', 
      price: 4999, 
      discount: 17, 
      duration: isHindi ? '3 महीने' : '3 months',
      icon: <Timer className="w-5 h-5" />,
      color: 'from-blue-500 to-purple-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      features: [isHindi ? '17% सेव' : '17% Save', isHindi ? 'बेहतर वैल्यू' : 'Better Value']
    },
    { 
      id: 'half_yearly', 
      name: isHindi ? '6 महीने' : '6 Months', 
      price: 8999, 
      discount: 25, 
      duration: isHindi ? '6 महीने' : '6 months',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      features: [isHindi ? '25% सेव' : '25% Save', isHindi ? 'सर्वश्रेष्ठ डील' : 'Best Deal']
    },
    { 
      id: 'yearly', 
      name: isHindi ? 'वार्षिक' : 'Yearly', 
      price: 15999, 
      discount: 33, 
      duration: isHindi ? '1 साल' : '1 year',
      icon: <Crown className="w-5 h-5" />,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      features: [isHindi ? '33% सेव' : '33% Save', isHindi ? '1 महीना फ्री' : '1 Month Free']
    },
  ];

  const plans = [
    {
      id: 'basic',
      name: isHindi ? 'बेसिक' : 'Basic',
      icon: <Star className="w-6 h-6" />,
      color: 'border-blue-500/30',
      bgColor: 'from-blue-900/30 to-cyan-900/10',
      iconColor: 'text-blue-400',
      popular: false,
      tagline: isHindi ? 'शुरुआती ट्रेडर्स के लिए' : 'For beginner traders',
      features: [
        { text: isHindi ? 'दैनिक 3 स्टॉक सिफ़ारिशें' : 'Daily 3 Stock Recommendations', included: true },
        { text: isHindi ? 'बेसिक तकनीकी विश्लेषण' : 'Basic Technical Analysis', included: true },
        { text: isHindi ? 'ईमेल अलर्ट्स' : 'Email Alerts', included: true },
        { text: isHindi ? 'सिंगल ब्रोकर सपोर्ट' : 'Single Broker Support', included: true },
        { text: isHindi ? 'रियल-टाइम डेटा' : 'Real-time Data', included: false },
        { text: isHindi ? 'एडवांस्ड AI सिग्नल्स' : 'Advanced AI Signals', included: false },
        { text: isHindi ? 'पोर्टफोलियो एनालिटिक्स' : 'Portfolio Analytics', included: false },
        { text: isHindi ? 'प्रायोरिटी सपोर्ट' : 'Priority Support', included: false }
      ],
      cta: isHindi ? 'शुरू करें' : 'Get Started'
    },
    {
      id: 'pro',
      name: isHindi ? 'प्रो' : 'Pro',
      popular: true,
      icon: <Zap className="w-6 h-6" />,
      color: 'border-emerald-500/30',
      bgColor: 'from-emerald-900/30 to-green-900/10',
      iconColor: 'text-emerald-400',
      tagline: isHindi ? 'सक्रिय ट्रेडर्स के लिए' : 'For active traders',
      features: [
        { text: isHindi ? 'दैनिक 8 स्टॉक सिफ़ारिशें' : 'Daily 8 Stock Recommendations', included: true },
        { text: isHindi ? 'एडवांस्ड तकनीकी विश्लेषण' : 'Advanced Technical Analysis', included: true },
        { text: isHindi ? 'SMS + ईमेल अलर्ट्स' : 'SMS + Email Alerts', included: true },
        { text: isHindi ? 'मल्टीपल ब्रोकर सपोर्ट' : 'Multiple Broker Support', included: true },
        { text: isHindi ? 'रियल-टाइम डेटा' : 'Real-time Data', included: true },
        { text: isHindi ? 'एडवांस्ड AI सिग्नल्स' : 'Advanced AI Signals', included: true },
        { text: isHindi ? 'पोर्टफोलियो एनालिटिक्स' : 'Portfolio Analytics', included: true },
        { text: isHindi ? 'प्रायोरिटी सपोर्ट' : 'Priority Support', included: true }
      ],
      cta: isHindi ? 'सबसे लोकप्रिय' : 'Most Popular'
    },
    {
      id: 'premium',
      name: isHindi ? 'प्रीमियम' : 'Premium',
      icon: <Crown className="w-6 h-6" />,
      color: 'border-amber-500/30',
      bgColor: 'from-amber-900/30 to-orange-900/10',
      iconColor: 'text-amber-400',
      popular: false,
      tagline: isHindi ? 'पेशेवर ट्रेडर्स के लिए' : 'For professional traders',
      features: [
        { text: isHindi ? 'असीमित स्टॉक सिफ़ारिशें' : 'Unlimited Stock Recommendations', included: true },
        { text: isHindi ? 'AI + ML एल्गोरिदम सिग्नल्स' : 'AI + ML Algorithm Signals', included: true },
        { text: isHindi ? 'WhatsApp + SMS + ईमेल अलर्ट्स' : 'WhatsApp + SMS + Email Alerts', included: true },
        { text: isHindi ? 'सभी ब्रोकर सपोर्ट' : 'All Broker Support', included: true },
        { text: isHindi ? 'रियल-टाइम डेटा + अलर्ट्स' : 'Real-time Data + Alerts', included: true },
        { text: isHindi ? 'एडवांस्ड AI सिग्नल्स' : 'Advanced AI Signals', included: true },
        { text: isHindi ? 'पोर्टफोलियो एनालिटिक्स + इनसाइट्स' : 'Portfolio Analytics + Insights', included: true },
        { text: isHindi ? '24/7 प्रायोरिटी सपोर्ट' : 'Priority 24/7 Support', included: true },
        { text: isHindi ? 'पर्सनल ट्रेडिंग कोच' : 'Personal Trading Coach', included: true },
        { text: isHindi ? 'कस्टम स्ट्रैटेजी बिल्डर' : 'Custom Strategy Builder', included: true }
      ],
      cta: isHindi ? 'एलीट चुनें' : 'Go Elite'
    }
  ];

  const calculatePlanPrice = useCallback((planId, durationId) => {
    const plan = plans.find(p => p.id === planId);
    const duration = durations.find(d => d.id === durationId);
    
    if (!plan || !duration) return 0;
    
    let basePrice = 0;
    if (planId === 'basic') basePrice = 999;
    else if (planId === 'pro') basePrice = 1999;
    else if (planId === 'premium') basePrice = 4999;
    
    if (durationId === 'trial') return 0;
    if (durationId === 'monthly') return basePrice;
    if (durationId === 'quarterly') return Math.round(basePrice * 3 * (1 - duration.discount/100));
    if (durationId === 'half_yearly') return Math.round(basePrice * 6 * (1 - duration.discount/100));
    if (durationId === 'yearly') return Math.round(basePrice * 12 * (1 - duration.discount/100));
    
    return basePrice;
  }, [plans, durations]);

  const selectedPlanData = useMemo(() => 
    plans.find(p => selectedPlan.includes(p.id)), [selectedPlan, plans]);
  
  const selectedDurationData = useMemo(() => 
    durations.find(d => selectedDuration === d.id), [selectedDuration, durations]);
  
  const finalPrice = useMemo(() => 
    calculatePlanPrice(selectedPlan.split('_')[0], selectedDuration), 
    [selectedPlan, selectedDuration, calculatePlanPrice]);

  const handleSubscribe = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call for subscription
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      userData.subscription = {
        plan: selectedPlan.split('_')[0],
        duration: selectedDuration,
        subscribed_at: new Date().toISOString(),
        expires_at: calculateExpiryDate(selectedDuration),
        remaining_days: selectedDuration === 'trial' ? 7 : 
                       selectedDuration === 'monthly' ? 30 :
                       selectedDuration === 'quarterly' ? 90 :
                       selectedDuration === 'half_yearly' ? 180 : 365,
        price_paid: finalPrice
      };
      
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      setCurrentPlan(selectedPlan.split('_')[0]);
      setRemainingDays(userData.subscription.remaining_days);
      setShowSuccess(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
      
    } catch (error) {
      console.error('Subscription failed:', error);
      alert(isHindi ? 'सब्सक्रिप्शन में समस्या! कृपया बाद में प्रयास करें।' : 'Subscription failed! Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedPlan, selectedDuration, finalPrice, isHindi]);

  const calculateExpiryDate = (duration) => {
    const now = new Date();
    switch(duration) {
      case 'trial': now.setDate(now.getDate() + 7); break;
      case 'monthly': now.setMonth(now.getMonth() + 1); break;
      case 'quarterly': now.setMonth(now.getMonth() + 3); break;
      case 'half_yearly': now.setMonth(now.getMonth() + 6); break;
      case 'yearly': now.setFullYear(now.getFullYear() + 1); break;
      default: now.setDate(now.getDate() + 7);
    }
    return now.toISOString();
  };

  // FIXED: Safer formatCurrency
  const formatCurrency = useCallback((amount) => {
    if (amount === undefined || amount === null || amount === '') {
      return '₹0';
    }
    try {
      const num = parseFloat(amount);
      if (isNaN(num)) return '₹0';
      
      return `₹${num.toLocaleString('en-IN', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      })}`;
    } catch (error) {
      console.error('formatCurrency error:', error);
      return '₹0';
    }
  }, []);

  // Current plan display
  const currentPlanDisplay = useMemo(() => {
    if (!currentPlan) return null;
    
    const plan = plans.find(p => p.id === currentPlan);
    if (!plan) return null;
    
    return {
      name: plan.name,
      color: plan.iconColor,
      remaining: remainingDays,
      isTrial: currentPlan === 'trial'
    };
  }, [currentPlan, remainingDays, plans]);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
        <div className="flex items-center justify-center h-screen">
          <div className="bg-gradient-to-br from-emerald-900/30 to-cyan-900/10 rounded-2xl border border-emerald-900/40 p-8 md:p-12 text-center max-w-lg">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {isHindi ? 'सब्सक्रिप्शन सफल!' : 'Subscription Successful!'}
            </h2>
            
            <p className="text-emerald-300/80 mb-4">
              {isHindi ? 
                `आपने ${selectedPlanData?.name} प्लान सब्सक्राइब किया है।` :
                `You have subscribed to ${selectedPlanData?.name} plan.`
              }
            </p>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-emerald-900/40 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-emerald-300/70">{isHindi ? 'प्लान:' : 'Plan:'}</span>
                <span className="font-medium text-white">{selectedPlanData?.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-emerald-300/70">{isHindi ? 'अवधि:' : 'Duration:'}</span>
                <span className="font-medium text-white">{selectedDurationData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300/70">{isHindi ? 'कीमत:' : 'Price:'}</span>
                <span className="font-bold text-emerald-400">{formatCurrency(finalPrice)}</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30 text-emerald-300 rounded-xl hover:border-emerald-400/50 transition-all font-medium"
            >
              {isHindi ? 'डैशबोर्ड पर जाएं' : 'Go to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {isHindi ? 'सब्सक्रिप्शन प्लान' : 'Subscription Plans'}
            </h1>
            <p className="text-sm text-emerald-300/80 mt-1">
              {isHindi ? 'अपनी ट्रेडिंग जरूरतों के अनुसार प्लान चुनें' : 'Choose the plan that fits your trading needs'}
            </p>
          </div>
          
          {/* Current Plan Badge */}
          {currentPlanDisplay && (
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className="bg-gradient-to-r from-slate-800/40 to-slate-900/30 rounded-xl border border-emerald-900/40 p-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${currentPlanDisplay.color.replace('text-', 'bg-')}/20`}>
                    <Crown className={`w-4 h-4 ${currentPlanDisplay.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-300/70">
                      {isHindi ? 'वर्तमान प्लान' : 'Current Plan'}
                    </p>
                    <p className={`text-sm font-medium ${currentPlanDisplay.color}`}>
                      {currentPlanDisplay.name}
                    </p>
                  </div>
                </div>
              </div>
              
              {currentPlanDisplay.isTrial && (
                <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/10 rounded-xl border border-amber-900/40 p-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-xs text-amber-300/70">
                        {isHindi ? 'शेष दिन' : 'Days Left'}
                      </p>
                      <p className="text-sm font-medium text-amber-400">
                        {currentPlanDisplay.remaining}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/10 rounded-2xl border border-emerald-900/40 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <UserGroup className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-emerald-300/70">
                {isHindi ? 'सक्रिय ट्रेडर्स' : 'Active Traders'}
              </p>
              <p className="text-xl font-bold text-white">2,500+</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-cyan-500/20">
              <Trophy className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-cyan-300/70">
                {isHindi ? 'संतुष्टि दर' : 'Satisfaction Rate'}
              </p>
              <p className="text-xl font-bold text-white">92%</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Rocket className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-purple-300/70">
                {isHindi ? 'ट्रेडिंग सफलता' : 'Trading Success'}
              </p>
              <p className="text-xl font-bold text-white">85.6%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Duration Selection */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">
              {isHindi ? 'अवधि चुनें' : 'Select Duration'}
            </h2>
            <p className="text-sm text-emerald-300/70">
              {isHindi ? 'अपने प्लान की अवधि चुनें' : 'Choose the duration for your plan'}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-emerald-400">
            <Gift className="w-4 h-4" />
            <span>{isHindi ? '7-दिन फ्री ट्रायल उपलब्ध' : '7-Day Free Trial Available'}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {durations.map((duration) => (
            <button
              key={duration.id}
              onClick={() => {
                setSelectedDuration(duration.id);
                setSelectedPlan(`${selectedPlan.split('_')[0]}_${duration.id}`);
              }}
              className={`relative border rounded-2xl p-4 text-center transition-all duration-200 group ${
                selectedDuration === duration.id
                  ? `border-emerald-500/60 bg-gradient-to-br ${duration.bgColor} ring-2 ring-emerald-500/30 scale-[1.02]`
                  : 'border-emerald-900/40 hover:border-emerald-500/40 hover:bg-emerald-900/10'
              } ${duration.popular ? 'ring-2 ring-cyan-500/30' : ''}`}
            >
              {duration.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {isHindi ? 'लोकप्रिय' : 'Popular'}
                  </span>
                </div>
              )}
              
              <div className="flex flex-col items-center">
                <div className={`p-3 rounded-xl mb-3 ${duration.bgColor} border ${duration.borderColor}`}>
                  <div className={duration.textColor}>{duration.icon}</div>
                </div>
                <h3 className="font-bold text-white mb-2">{duration.name}</h3>
                
                <div className="mb-3">
                  {duration.id === 'trial' ? (
                    <span className="text-2xl font-bold text-emerald-400">FREE</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-white">{formatCurrency(duration.price)}</span>
                      {duration.discount > 0 && (
                        <div className="text-sm mt-1">
                          <span className="text-emerald-300/60 line-through">
                            {formatCurrency(Math.round(duration.price / (1 - duration.discount/100)))}
                          </span>
                          <span className="ml-2 text-emerald-400 font-medium">
                            {isHindi ? `${duration.discount}% बचत` : `Save ${duration.discount}%`}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <p className="text-xs text-emerald-300/70 mb-3">{duration.duration}</p>
                
                <div className="space-y-1">
                  {duration.features.map((feature, idx) => (
                    <div key={idx} className="text-xs text-emerald-300/60">
                      • {feature}
                    </div>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl p-6 transition-all duration-200 border ${
              selectedPlan.includes(plan.id)
                ? 'border-emerald-500/60 bg-gradient-to-br from-slate-800/60 to-slate-900/40 ring-2 ring-emerald-500/30 scale-[1.02]'
                : `border-emerald-900/40 bg-gradient-to-br ${plan.bgColor}`
            } ${plan.popular ? 'ring-2 ring-emerald-500/30' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {isHindi ? 'सबसे लोकप्रिय' : 'Most Popular'}
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <div className={`inline-flex p-4 rounded-2xl mb-4 ${plan.iconColor.replace('text-', 'bg-')}/20 border ${plan.color}`}>
                <div className={plan.iconColor}>{plan.icon}</div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-emerald-300/70 mb-4">{plan.tagline}</p>
              
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">
                  {formatCurrency(calculatePlanPrice(plan.id, selectedDuration))}
                </span>
                <span className="text-emerald-300/70">/{selectedDurationData.duration}</span>
              </div>
              
              <button
                onClick={() => setSelectedPlan(`${plan.id}_${selectedDuration}`)}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  selectedPlan.includes(plan.id)
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white hover:from-emerald-700 hover:to-cyan-700'
                    : 'bg-gradient-to-r from-slate-800/50 to-slate-900/30 border border-emerald-900/40 text-emerald-300 hover:border-emerald-500/60'
                }`}
              >
                {selectedPlan.includes(plan.id) ? 
                  (isHindi ? 'चुना गया' : 'Selected') : 
                  plan.cta
                }
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  {feature.included ? (
                    <div className="p-1 rounded-full bg-emerald-500/20 mr-3">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 text-emerald-300/30 mr-3">×</div>
                  )}
                  <span className={`text-sm ${feature.included ? 'text-emerald-300/90' : 'text-emerald-300/40'}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {plan.popular && (
              <div className="pt-6 border-t border-emerald-900/40">
                <div className="flex items-center justify-center space-x-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <p className="text-sm text-emerald-300/70">
                      <span className="font-medium text-white">2,500+</span> {isHindi ? 'सक्रिय ट्रेडर्स' : 'active traders'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <p className="text-sm text-emerald-300/70">
                      <span className="font-medium text-white">92%</span> {isHindi ? 'संतुष्टि दर' : 'satisfaction'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Section */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-6">
        <h2 className="text-lg font-bold text-white mb-6">
          {isHindi ? 'भुगतान विवरण' : 'Payment Details'}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Summary */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-xl border border-emerald-900/40 p-5">
              <h3 className="font-bold text-white mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-emerald-400" />
                {isHindi ? 'ऑर्डर सारांश' : 'Order Summary'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-emerald-300/70">{isHindi ? 'प्लान:' : 'Plan:'}</span>
                  <span className="font-medium text-white">{selectedPlanData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-300/70">{isHindi ? 'अवधि:' : 'Duration:'}</span>
                  <span className="font-medium text-white">{selectedDurationData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-300/70">{isHindi ? 'कीमत:' : 'Price:'}</span>
                  <span className="font-medium text-white">{formatCurrency(finalPrice)}</span>
                </div>
                {selectedDurationData.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>{isHindi ? `छूट (${selectedDurationData.discount}%):` : `Discount (${selectedDurationData.discount}%):`}</span>
                    <span className="font-medium">
                      -{formatCurrency(Math.round((selectedDurationData.price * selectedDurationData.discount) / 100))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-emerald-300/70">{isHindi ? 'GST (18%):' : 'GST (18%):'}</span>
                  <span className="font-medium text-white">₹{(finalPrice * 0.18).toFixed(0)}</span>
                </div>
                <div className="pt-3 border-t border-emerald-900/40">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">{isHindi ? 'कुल:' : 'Total:'}</span>
                    <span className="text-emerald-400">₹{(finalPrice * 1.18).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="font-bold text-white mb-4 flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-cyan-400" />
                {isHindi ? 'भुगतान विधि' : 'Payment Method'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'razorpay', name: 'Razorpay', icon: '💳' },
                  { id: 'upi', name: 'UPI', icon: '📱' },
                  { id: 'card', name: 'Card', icon: '💳' },
                  { id: 'netbanking', name: 'Net Banking', icon: '🏦' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`border rounded-xl p-4 text-center flex flex-col items-center justify-center transition-all ${
                      paymentMethod === method.id
                        ? 'border-emerald-500/60 bg-emerald-900/20'
                        : 'border-emerald-900/40 hover:border-emerald-500/40 hover:bg-emerald-900/10'
                    }`}
                  >
                    <span className="text-2xl mb-2">{method.icon}</span>
                    <div className="text-sm font-medium text-white">{method.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/40 rounded-xl border border-emerald-900/40 p-5">
              <h3 className="font-bold text-white mb-3 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-green-400" />
                {isHindi ? 'लाभ' : 'Benefits'}
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-emerald-400 mr-2" />
                  <span className="text-emerald-300/90">{isHindi ? 'तुरंत एक्टिवेशन' : 'Instant activation'}</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-emerald-400 mr-2" />
                  <span className="text-emerald-300/90">{isHindi ? 'कभी भी कैंसिल करें' : 'Cancel anytime'}</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-emerald-400 mr-2" />
                  <span className="text-emerald-300/90">{isHindi ? '7-दिन पैसे वापसी गारंटी' : '7-day money back guarantee'}</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-emerald-400 mr-2" />
                  <span className="text-emerald-300/90">{isHindi ? 'प्रायोरिटी सपोर्ट' : 'Priority customer support'}</span>
                </li>
                {selectedDuration === 'yearly' && (
                  <li className="flex items-center text-amber-400">
                    <Gift className="w-4 h-4 mr-2" />
                    <span>{isHindi ? '1 महीना फ्री' : 'Free 1 month extra'}</span>
                  </li>
                )}
              </ul>
            </div>

            {selectedDuration === 'trial' ? (
              <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    {isHindi ? 'प्रोसेस हो रहा है...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 mr-2" />
                    {isHindi ? 'फ्री ट्रायल शुरू करें' : 'Start Free Trial'}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    {isHindi ? 'प्रोसेस हो रहा है...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    {isHindi ? 'अभी सब्सक्राइब करें' : 'Subscribe Now'}
                  </>
                )}
              </button>
            )}

            <p className="text-xs text-emerald-300/60 text-center">
              {isHindi ? 
                'सब्सक्राइब करके, आप हमारी सेवा की शर्तें और गोपनीयता नीति से सहमत होते हैं।' :
                'By subscribing, you agree to our Terms of Service and Privacy Policy.'
              }
              {selectedDuration !== 'trial' && (isHindi ? 
                ' कैंसिल नहीं करने पर आपका सब्सक्रिप्शन ऑटो-रिन्यू होगा।' :
                ' Your subscription will auto-renew unless cancelled.'
              )}
            </p>
            
            {/* Security Badge */}
            <div className="flex items-center justify-center space-x-2 text-xs text-emerald-300/60">
              <Lock className="w-3 h-3" />
              <span>256-bit SSL Encryption</span>
              <Shield className="w-3 h-3" />
              <span>PCI DSS Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/30 rounded-2xl border border-emerald-900/40 p-6 mt-8">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center">
          <HelpCircle className="w-5 h-5 mr-2 text-cyan-400" />
          {isHindi ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              q: isHindi ? 'क्या मैं प्लान अपग्रेड या डाउनग्रेड कर सकता हूँ?' : 'Can I upgrade or downgrade my plan?',
              a: isHindi ? 'हाँ, आप कभी भी अपना प्लान अपग्रेड या डाउनग्रेड कर सकते हैं।' : 'Yes, you can upgrade or downgrade your plan anytime.'
            },
            {
              q: isHindi ? 'फ्री ट्रायल के बाद क्या होता है?' : 'What happens after the free trial?',
              a: isHindi ? 'फ्री ट्रायल के बाद, आपका अकाउंट बेसिक प्लान पर स्विच हो जाएगा जब तक आप अपग्रेड नहीं करते।' : 'After the free trial, your account will switch to the Basic plan until you upgrade.'
            },
            {
              q: isHindi ? 'क्या मुझे पैसे वापस मिल सकते हैं?' : 'Can I get a refund?',
              a: isHindi ? 'हम 7-दिन की पैसे वापसी गारंटी देते हैं। किसी भी समस्या के लिए सपोर्ट से संपर्क करें।' : 'We offer a 7-day money-back guarantee. Contact support for any issues.'
            },
            {
              q: isHindi ? 'क्या मेरा डेटा सुरक्षित है?' : 'Is my data secure?',
              a: isHindi ? 'हाँ, हम 256-bit SSL एन्क्रिप्शन और PCI DSS कंप्लायंट सिस्टम का उपयोग करते हैं।' : 'Yes, we use 256-bit SSL encryption and PCI DSS compliant systems.'
            }
          ].map((faq, index) => (
            <div key={index} className="p-4 bg-slate-800/50 rounded-xl border border-emerald-900/40">
              <div className="font-medium text-emerald-300 mb-2">{faq.q}</div>
              <div className="text-sm text-emerald-300/70">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
