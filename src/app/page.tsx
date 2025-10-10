'use client';

import { useState } from 'react';
import { ShoppingBag, ArrowRight, Check, Star } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '@/config/subscriptionTiers';
import { useRouter } from 'next/navigation';

export default function SaaSLandingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const router = useRouter();

  const features = [
    {
      icon: '🏪',
      title: 'Instant Store Setup',
      description: 'Create your online store in under 5 minutes. No technical skills required.'
    },
    {
      icon: '📱',
      title: 'Mobile-First Design',
      description: 'Perfect for Nigeria\'s mobile market. Your customers shop seamlessly on any device.'
    },
    {
      icon: '💳',
      title: 'Direct Bank Payments',
      description: 'No transaction fees. Customers pay directly to your bank account.'
    },
    {
      icon: '📊',
      title: 'Smart Analytics',
      description: 'Track sales, customers, and inventory with easy-to-understand reports.'
    },
    {
      icon: '💬',
      title: 'WhatsApp Integration',
      description: 'Connect with customers through WhatsApp Business for orders and support.'
    },
    {
      icon: '🌍',
      title: 'Custom Domain',
      description: 'Use your own domain name to build your brand and look professional.'
    }
  ];

  const testimonials = [
    {
      name: 'Adanna Okafor',
      business: 'Mama Adanna Kitchen',
      image: '👩🏾‍🍳',
      quote: 'I went from selling just to neighbors to having customers across Lagos. My sales tripled in 3 months!'
    },
    {
      name: 'Emeka James',
      business: 'Campus Store NG',
      image: '👨🏾‍💼',
      quote: 'As a student, I needed something affordable. Started free and now I\'m on the Growth plan making ₦200k monthly.'
    },
    {
      name: 'Fatima Hassan',
      business: 'Hijab Boutique',
      image: '👩🏾',
      quote: 'The WhatsApp integration is perfect for my customers. They order through WhatsApp and pay to my account directly.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">GochopNg</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#examples" className="text-gray-600 hover:text-gray-900">Examples</a>
            </nav>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/login')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </button>
              <button 
                onClick={() => router.push('/onboarding')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Start Free
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
        {/* Floating Elements for Visual Interest */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-green-200 rounded-full px-6 py-2 mb-8 animate-fade-in-up">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">2,000+ Nigerian businesses trust GochopNg</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight animate-fade-in-up animation-delay-200">
              The <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">Future</span> of
              <br />Nigerian E-commerce
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
              From university students selling jollof rice to supermarkets serving thousands - 
              GochopNg grows with your business. Start free, scale infinitely.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animation-delay-600">
              <button 
                onClick={() => router.push('/onboarding')}
                className="group bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 transform"
              >
                Start Your Store Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group border-2 border-gray-300 hover:border-green-500 text-gray-700 hover:text-green-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-green-50">
                <span className="flex items-center gap-2">
                  Watch Demo
                  <span className="w-0 group-hover:w-4 transition-all duration-300 overflow-hidden">▶️</span>
                </span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-800">
              <div className="text-center group">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">2,000+</div>
                <div className="text-sm sm:text-base text-gray-600">Active Stores</div>
              </div>
              <div className="text-center group">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">₦50M+</div>
                <div className="text-sm sm:text-base text-gray-600">Sales Generated</div>
              </div>
              <div className="text-center group">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">99.9%</div>
                <div className="text-sm sm:text-base text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for Nigerian businesses, with features that understand your market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-transparent hover:border-green-100"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="text-3xl sm:text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pricing That Grows With You
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start free, upgrade when you\'re ready. No surprises, no hidden fees.
            </p>
            
            {/* Pricing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isYearly ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className={`font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly <span className="text-green-600">(Save 17%)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {SUBSCRIPTION_TIERS.map((tier, index) => (
              <div
                key={tier.id}
                className={`bg-white rounded-xl border-2 p-6 lg:p-8 relative transform transition-all duration-300 hover:-translate-y-2 ${
                  tier.popular
                    ? 'border-green-500 shadow-xl scale-105'
                    : 'border-gray-200 hover:border-green-300 hover:shadow-lg'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6 lg:mb-8">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    ₦{(isYearly ? tier.price_yearly / 12 : tier.price_monthly).toLocaleString()}
                    <span className="text-xs sm:text-sm lg:text-base text-gray-500">/month</span>
                  </div>
                  {isYearly && tier.price_yearly > 0 ? (
                    <p className="text-green-600 text-xs lg:text-sm font-medium">Billed yearly (₦{tier.price_yearly.toLocaleString()})</p>
                  ) : (
                    <div className="h-4"></div>
                  )}
                  <p className="text-gray-600 mt-3 lg:mt-4 text-sm lg:text-base leading-relaxed">{tier.description}</p>
                </div>

                <ul className="space-y-2 lg:space-y-3 mb-6 lg:mb-8">
                  {tier.features.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 lg:h-5 lg:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs lg:text-sm text-gray-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                  {tier.features.length > 5 && (
                    <li className="text-xs text-gray-500 italic">+ {tier.features.length - 5} more features</li>
                  )}
                </ul>

                <button
                  onClick={() => router.push('/onboarding')}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    tier.popular
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tier.price_monthly === 0 ? 'Start Free' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Nigerian Entrepreneurs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border border-gray-100 hover:border-green-200"
                style={{
                  animationDelay: `${index * 200}ms`
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-2xl lg:text-3xl group-hover:scale-110 transition-transform duration-300">{testimonial.image}</div>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.business}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-300" style={{animationDelay: `${i * 50}ms`}} />
                    ))}
                  </div>
                  <p className="text-sm lg:text-base text-gray-700 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Ticker */}
      <section className="py-12 bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-8 animate-scroll-x">
            {['Mama Blessing made ₦50k in her first week', 'Campus Store NG hit 1000 orders', 'Aba Fashion Store expanded to 3 states', 'Fresh Market doubled sales with GochopNg'].map((story, index) => (
              <div key={index} className="flex items-center gap-3 text-white whitespace-nowrap">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{story}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 lg:mb-6">
              Ready to Start Your Business?
            </h2>
            <p className="text-lg lg:text-xl text-green-100 mb-6 lg:mb-8 leading-relaxed">
              Join thousands of Nigerian entrepreneurs building their future with GochopNg.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => router.push('/onboarding')}
                className="group bg-white hover:bg-gray-100 text-green-600 px-6 lg:px-8 py-3 lg:py-4 rounded-lg font-semibold text-base lg:text-lg transition-all duration-300 inline-flex items-center gap-2 hover:shadow-xl hover:scale-105 transform"
              >
                Start Your Free Store
                <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center gap-2 text-green-100 text-sm">
                <div className="flex -space-x-2">
                  {['👩🏾‍💼', '👨🏾‍💼', '👩🏽‍💼'].map((avatar, i) => (
                    <div key={i} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg border-2 border-white/30">
                      {avatar}
                    </div>
                  ))}
                </div>
                <span>2,000+ entrepreneurs joined this month</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="h-6 w-6 text-green-500" />
                <span className="text-xl font-bold">GochopNg</span>
              </div>
              <p className="text-gray-400">
                The future of Nigerian e-commerce.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="/onboarding" className="hover:text-white">Get Started</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="mailto:support@gochop.ng" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Twitter</a></li>
                <li><a href="#" className="hover:text-white">Instagram</a></li>
                <li><a href="#" className="hover:text-white">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GochopNg. Built with ❤️ for Nigerian entrepreneurs.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
