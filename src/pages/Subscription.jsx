import React, { useState } from 'react';
import { Check, Star, Zap, Shield, Clock, Users, TrendingUp, Calendar, Gift, Award } from 'lucide-react';

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState('pro_monthly');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [selectedDuration, setSelectedDuration] = useState('monthly');

  const durations = [
    { id: 'trial', name: '7-Day Trial', price: 0, discount: 0, popular: false, duration: '7 days' },
    { id: 'monthly', name: 'Monthly', price: 1999, discount: 0, popular: true, duration: '1 month' },
    { id: 'quarterly', name: '3 Months', price: 4999, discount: 17, duration: '3 months' },
    { id: 'half_yearly', name: '6 Months', price: 8999, discount: 25, duration: '6 months' },
    { id: 'yearly', name: 'Yearly', price: 15999, discount: 33, duration: '1 year' },
  ];

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      icon: <Star className="w-6 h-6" />,
      color: 'border-blue-200 bg-blue-50',
      features: [
        { text: 'Daily 3 Stock Recommendations', included: true },
        { text: 'Basic Technical Analysis', included: true },
        { text: 'Email Alerts', included: true },
        { text: 'Single Broker Support', included: true },
        { text: 'Real-time Data', included: false },
        { text: 'Advanced AI Signals', included: false },
        { text: 'Portfolio Analytics', included: false },
        { text: 'Priority Support', included: false }
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      popular: true,
      icon: <Zap className="w-6 h-6" />,
      color: 'border-purple-200 bg-purple-50',
      features: [
        { text: 'Daily 8 Stock Recommendations', included: true },
        { text: 'Advanced Technical Analysis', included: true },
        { text: 'SMS + Email Alerts', included: true },
        { text: 'Multiple Broker Support', included: true },
        { text: 'Real-time Data', included: true },
        { text: 'Advanced AI Signals', included: true },
        { text: 'Portfolio Analytics', included: true },
        { text: 'Priority Support', included: true }
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: <Shield className="w-6 h-6" />,
      color: 'border-orange-200 bg-orange-50',
      features: [
        { text: 'Unlimited Stock Recommendations', included: true },
        { text: 'AI + ML Algorithm Signals', included: true },
        { text: 'WhatsApp + SMS + Email Alerts', included: true },
        { text: 'All Broker Support', included: true },
        { text: 'Real-time Data + Alerts', included: true },
        { text: 'Advanced AI Signals', included: true },
        { text: 'Portfolio Analytics + Insights', included: true },
        { text: 'Priority 24/7 Support', included: true },
        { text: 'Personal Trading Coach', included: true },
        { text: 'Custom Strategy Builder', included: true }
      ]
    }
  ];

  const calculatePlanPrice = (planId, durationId) => {
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
  };

  const selectedPlanData = plans.find(p => selectedPlan.includes(p.id));
  const selectedDurationData = durations.find(d => selectedDuration === d.id);
  const finalPrice = calculatePlanPrice(selectedPlan.split('_')[0], selectedDuration);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600">Choose the plan that fits your trading needs</p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-1 text-green-600">
            <Gift className="w-4 h-4" />
            <span>7-Day Free Trial Available</span>
          </div>
        </div>
      </div>

      {/* Duration Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Select Duration</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {durations.map((duration) => (
            <button
              key={duration.id}
              onClick={() => {
                setSelectedDuration(duration.id);
                setSelectedPlan(`${selectedPlan.split('_')[0]}_${duration.id}`);
              }}
              className={`border rounded-xl p-4 text-center transition-all duration-200 ${
                selectedDuration === duration.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              } ${duration.popular ? 'ring-2 ring-purple-200' : ''}`}
            >
              <div className="flex flex-col items-center">
                <Calendar className="w-6 h-6 mb-2 text-gray-600" />
                <h3 className="font-medium mb-1">{duration.name}</h3>
                <div className="mb-2">
                  {duration.id === 'trial' ? (
                    <span className="text-2xl font-bold text-green-600">FREE</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold">₹{duration.price}</span>
                      {duration.discount > 0 && (
                        <div className="text-sm">
                          <span className="text-gray-500 line-through">
                            ₹{Math.round(duration.price / (1 - duration.discount/100))}
                          </span>
                          <span className="ml-2 text-green-600 font-medium">
                            Save {duration.discount}%
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500">{duration.duration}</p>
                {duration.popular && (
                  <span className="mt-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative border-2 rounded-xl p-6 transition-all duration-200 ${
              selectedPlan.includes(plan.id)
                ? 'border-blue-500 shadow-lg transform scale-105'
                : plan.popular
                ? 'border-purple-300 shadow-md'
                : 'border-gray-200'
            } ${plan.color}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-full bg-white mb-4">
                <div className="text-blue-600">{plan.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  ₹{calculatePlanPrice(plan.id, selectedDuration)}
                </span>
                <span className="text-gray-600">/{selectedDurationData.duration}</span>
              </div>
              <button
                onClick={() => setSelectedPlan(`${plan.id}_${selectedDuration}`)}
                className={`w-full py-2 rounded-lg font-medium ${
                  selectedPlan.includes(plan.id)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {selectedPlan.includes(plan.id) ? 'Selected' : 'Select Plan'}
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <div className="w-5 h-5 text-gray-300 mr-2">×</div>
                  )}
                  <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {plan.popular && (
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">2,500+</span> active traders
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">92%</span> satisfaction rate
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Section - Updated */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-6">Payment Details</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Summary */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-medium">{selectedPlanData.name} Plan</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{selectedDurationData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium">₹{finalPrice}</span>
                </div>
                {selectedDurationData.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({selectedDurationData.discount}%):</span>
                    <span className="font-medium">
                      -₹{Math.round((selectedDurationData.price * selectedDurationData.discount) / 100)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span className="font-medium">₹{(finalPrice * 0.18).toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>₹{(finalPrice * 1.18).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="font-medium mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['razorpay', 'upi', 'card', 'netbanking'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`border rounded-lg p-4 text-center flex flex-col items-center justify-center ${
                      paymentMethod === method
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium capitalize mb-1">{method}</div>
                    {method === 'razorpay' && (
                      <img 
                        src="https://razorpay.com/assets/razorpay-logo.svg" 
                        alt="Razorpay" 
                        className="h-4 mt-1"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-3">Benefits</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Instant activation</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Cancel anytime</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>7-day money back guarantee</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  <span>Priority customer support</span>
                </li>
                {selectedDuration === 'yearly' && (
                  <li className="flex items-center text-green-600">
                    <Gift className="w-4 h-4 mr-2" />
                    <span>Free 1 month extra</span>
                  </li>
                )}
              </ul>
            </div>

            {selectedDuration === 'trial' ? (
              <button
                onClick={() => {
                  // Start free trial logic
                  console.log('Starting 7-day free trial');
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-medium text-lg transition-all duration-200 shadow-md"
              >
                Start Free Trial
              </button>
            ) : (
              <button
                onClick={() => {
                  // Subscribe logic
                  console.log('Subscribing to:', selectedPlan, 'Price:', finalPrice);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium text-lg transition-all duration-200 shadow-md"
              >
                Subscribe Now
              </button>
            )}

            <p className="text-xs text-gray-500 text-center">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
              {selectedDuration !== 'trial' && ' Your subscription will auto-renew unless cancelled.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;