'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Store, CreditCard, Package, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const steps = [
  { id: 'business', title: 'Business Info', icon: Store },
  { id: 'products', title: 'Import Products', icon: Package },
  { id: 'payment', title: 'Payment Setup', icon: CreditCard },
  { id: 'complete', title: 'Go Live!', icon: CheckCircle },
];

const businessSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
});

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(businessSchema),
  });
  
  const onBusinessSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await api.createStore(data);
      setCurrentStep(1);
      toast.success('Store created successfully!');
    } catch (error) {
      toast.error('Failed to create store');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.importProducts(csvFile);
      setCurrentStep(2);
      toast.success('Products imported successfully!');
    } catch (error) {
      toast.error('Failed to import products');
    } finally {
      setIsLoading(false);
    }
  };
  
  const setupPayment = async () => {
    setIsLoading(true);
    try {
      const { url } = await api.setupStripeConnect();
      window.location.href = url;
    } catch (error) {
      toast.error('Failed to setup payment');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto pt-12 px-4">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center flex-1 ${
                  index <= currentStep ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div className={`rounded-full p-3 ${
                  index <= currentStep ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="text-xs mt-2">{step.title}</span>
                
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-full mt-4 ${
                    index < currentStep ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {currentStep === 0 && (
            <form onSubmit={handleSubmit(onBusinessSubmit)} className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Business Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Store Name *
                  </label>
                  <input
                    {...register('name')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="My Supermarket"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="store@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone *
                  </label>
                  <input
                    {...register('phone')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="+234 800 000 0000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    City *
                  </label>
                  <input
                    {...register('city')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Lagos"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Address *
                </label>
                <textarea
                  {...register('address')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="123 Main Street, Victoria Island"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating Store...' : 'Continue'}
              </button>
            </form>
          )}
          
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Import Your Products</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                
                <p className="text-gray-600 mb-4">
                  Upload a CSV file with your product catalog
                </p>
                
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="csv-upload"
                />
                
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-block"
                >
                  Select CSV File
                </label>
                
                {csvFile && (
                  <p className="mt-4 text-sm text-gray-600">
                    Selected: {csvFile.name}
                  </p>
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>CSV Format:</strong> name, price, category, stock, description
                </p>
                <a href="/sample-products.csv" className="text-blue-600 underline text-sm">
                  Download sample CSV
                </a>
              </div>
              
              <button
                onClick={handleFileUpload}
                disabled={!csvFile || isLoading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Importing...' : 'Import Products'}
              </button>
              
              <button
                onClick={() => setCurrentStep(2)}
                className="w-full text-gray-600 py-3"
              >
                Skip for now
              </button>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-6 text-center">
              <CreditCard className="h-16 w-16 text-green-600 mx-auto" />
              
              <h2 className="text-2xl font-bold">Setup Payment Processing</h2>
              
              <p className="text-gray-600">
                Connect your Stripe account to start accepting payments
              </p>
              
              <button
                onClick={setupPayment}
                disabled={isLoading}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : 'Connect Stripe Account'}
              </button>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              <CheckCircle className="h-20 w-20 text-green-600 mx-auto" />
              
              <h2 className="text-3xl font-bold">You're All Set!</h2>
              
              <p className="text-gray-600 text-lg">
                Your store is ready to start accepting orders
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Your store URL:</p>
                <p className="text-xl font-semibold text-blue-600">
                  https://yourstore.foodcart.ng
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                >
                  Go to Dashboard
                </button>
                
                <button
                  onClick={() => window.open('https://yourstore.foodcart.ng', '_blank')}
                  className="flex-1 border border-green-600 text-green-600 py-3 rounded-lg hover:bg-green-50"
                >
                  View Store
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}