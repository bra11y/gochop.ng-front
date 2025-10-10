'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { ShoppingBag, ArrowRight, Check, Upload } from 'lucide-react';
import { storeQueries, categoryQueries, productQueries } from '@/lib/supabase/queries';
import { useStoreStore } from '@/store/store';

const storeSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  description: z.string().optional(),
});

type StoreFormData = z.infer<typeof storeSchema>;

const steps = [
  { id: 1, name: 'Business Type', description: 'What do you sell?' },
  { id: 2, name: 'Store Information', description: 'Basic details about your store' },
  { id: 3, name: 'Location & Contact', description: 'Where customers can find you' },
  { id: 4, name: 'Import Products', description: 'Add products to your store' },
  { id: 5, name: 'Setup Complete', description: 'Your store is ready!' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [createdStore, setCreatedStore] = useState<any>(null);
  const [importProgress, setImportProgress] = useState(0);
  const { setCurrentStore } = useStoreStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      description: '',
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const importSampleProducts = async () => {
    if (!createdStore) return;
    
    setIsLoading(true);
    setImportProgress(0);
    
    try {
      // Sample product data based on CSV
      const sampleProducts = [
        { name: 'Coca Cola 35cl', category: 'Beverages', price: 200, description: 'Classic Coca Cola soft drink', stock_quantity: 50, image_url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400' },
        { name: 'Pepsi 50cl', category: 'Beverages', price: 250, description: 'Refreshing Pepsi cola', stock_quantity: 40, image_url: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400' },
        { name: 'Indomie Chicken', category: 'Food', price: 120, description: 'Instant noodles with chicken flavor', stock_quantity: 100, image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400' },
        { name: 'Bread Loaf', category: 'Bakery', price: 450, description: 'Fresh white bread', stock_quantity: 25, image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400' },
        { name: 'Fresh Tomatoes 1kg', category: 'Vegetables', price: 800, description: 'Farm fresh tomatoes', stock_quantity: 30, image_url: 'https://images.unsplash.com/photo-1546470427-e6e5b0c7e0b1?w=400' },
        { name: 'Rice 2kg', category: 'Food', price: 2500, description: 'Premium white rice', stock_quantity: 20, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
        { name: 'Cooking Oil 1L', category: 'Groceries', price: 1200, description: 'Vegetable cooking oil', stock_quantity: 15, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
        { name: 'Banana 1kg', category: 'Fruits', price: 600, description: 'Sweet ripe bananas', stock_quantity: 50, image_url: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400' },
      ];

      const categories = ['Beverages', 'Food', 'Bakery', 'Vegetables', 'Groceries', 'Fruits'];
      
      // Create categories first
      setImportProgress(10);
      const categoryMap: Record<string, string> = {};
      
      for (const categoryName of categories) {
        const category = await categoryQueries.create({
          store_id: createdStore.id,
          name: categoryName,
          slug: generateSlug(categoryName),
          position: categories.indexOf(categoryName) + 1,
          active: true
        });
        categoryMap[categoryName] = (category as any).id;
      }
      
      setImportProgress(30);
      
      // Import products
      for (let i = 0; i < sampleProducts.length; i++) {
        const product = sampleProducts[i];
        await productQueries.create({
          store_id: createdStore.id,
          category_id: categoryMap[product.category],
          name: product.name,
          slug: generateSlug(product.name),
          description: product.description,
          price: product.price,
          stock_quantity: product.stock_quantity,
          image_url: product.image_url,
          active: true
        });
        
        setImportProgress(30 + (i + 1) / sampleProducts.length * 70);
      }
      
      toast.success('Products imported successfully!');
      setCurrentStep(4);
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Failed to import products: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const skipProductImport = () => {
    setCurrentStep(4);
  };

  const onSubmit = async (data: StoreFormData) => {
    setIsLoading(true);
    try {
      const slug = generateSlug(data.name);
      
      // Check if slug already exists
      try {
        await storeQueries.getBySlug(slug);
        toast.error('A store with this name already exists. Please choose a different name.');
        setIsLoading(false);
        return;
      } catch (error) {
        // Slug doesn't exist, which is good - continue with creation
      }

      // Only include fields that exist in the database
      const storeData = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        slug,
      };

      const store = await storeQueries.create(storeData);
      
      // Update global store state and save for next step
      setCurrentStore(store);
      setCreatedStore(store);
      
      toast.success('Store created successfully!');
      setCurrentStep(3);
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create store. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const watchedName = watch('name');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto pt-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ShoppingBag className="h-12 w-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">GochopNg</h1>
          </div>
          <p className="text-lg text-gray-600">
            Set up your online store in minutes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-gray-900">{step.name}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="h-5 w-5 text-gray-400 mx-6" />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Store Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#112e40]">
                    Store Name *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Campus Mart"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                  {watchedName && (
                    <p className="text-green-600 text-sm mt-1">
                      Your store URL will be: gochop.ng/{generateSlug(watchedName)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#112e40]">
                    Email Address *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="store@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#112e40]">
                    Store Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tell customers about your store..."
                  />
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!watchedName || !watch('email')}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center"
                >
                  Continue
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <h2 className="text-2xl font-bold mb-6 text-center">Location & Contact</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#112e40]">
                    Phone Number *
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+234 800 123 4567"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#112e40]">
                    Store Address *
                  </label>
                  <input
                    {...register('address')}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="123 University Road"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#112e40]">
                      City *
                    </label>
                    <input
                      {...register('city')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Lagos"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#112e40]">
                      State *
                    </label>
                    <select
                      {...register('state')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja">Abuja</option>
                      <option value="Ogun">Ogun</option>
                      <option value="Rivers">Rivers</option>
                      <option value="Kano">Kano</option>
                      <option value="Kaduna">Kaduna</option>
                      <option value="Oyo">Oyo</option>
                      <option value="Delta">Delta</option>
                      <option value="Imo">Imo</option>
                      <option value="Edo">Edo</option>
                    </select>
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Store...
                    </>
                  ) : (
                    <>
                      Create Store
                      <Check className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6 text-center">Import Products</h2>
              
              <div className="mb-8">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Add Products to Your Store
                </h3>
                <p className="text-gray-600 mb-6">
                  Choose to import sample products or skip this step and add products later.
                </p>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Importing products...</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">{Math.round(importProgress)}% complete</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-medium text-blue-900 mb-2">Import Sample Products</h4>
                    <p className="text-blue-700 text-sm mb-4">
                      We'll add 8 sample products across different categories to get you started quickly.
                    </p>
                    <button
                      onClick={importSampleProducts}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Upload className="h-5 w-5" />
                      Import Sample Products
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  <button
                    onClick={skipProductImport}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold transition"
                  >
                    Skip for Now
                  </button>

                  <p className="text-xs text-gray-500 mt-4">
                    You can always add products later from your store dashboard
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">
                  Store Created Successfully!
                </h2>
                <p className="text-gray-600">
                  Your online store is ready. You can now start taking orders from customers.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium mb-3">
                  🎉 Welcome to GochopNg! Your store is now live.
                </p>
                <div className="bg-white rounded-lg p-4 border">
                  <p className="text-sm text-gray-600 mb-2">Share your store with customers:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/${createdStore?.slug || 'your-store'}`}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm border rounded-lg bg-gray-50 text-[#112e40]"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/${createdStore?.slug || 'your-store'}`);
                        toast.success('Link copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/${createdStore?.slug}`)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition"
                >
                  View Your Store
                </button>
                <button
                  onClick={() => router.push(`/${createdStore?.slug}/manage`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition"
                >
                  Manage Store
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Need help? Contact support at support@gochop.ng</p>
        </div>
      </div>
    </div>
  );
}