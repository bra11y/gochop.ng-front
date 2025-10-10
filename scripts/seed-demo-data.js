#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Demo data
const demoStores = [
  {
    name: 'FoodCart Demo Store',
    slug: 'demo-store',
    email: 'demo@foodcart.com',
    phone: '+234-800-FOODCART',
    address: '123 Demo Street',
    city: 'Lagos',
    state: 'Lagos State',
    settings: {
      currency: 'NGN',
      delivery_fee: 500,
      min_order: 1000
    },
    theme: {
      primary_color: '#112e40',
      accent_color: '#ef4444'
    }
  },
  {
    name: 'Test Store Premium',
    slug: 'test-store-premium',
    email: 'premium@foodcart.com',
    phone: '+234-800-PREMIUM',
    address: '456 Premium Avenue',
    city: 'Abuja',
    state: 'FCT',
    settings: {
      currency: 'NGN',
      delivery_fee: 750,
      min_order: 1500
    },
    theme: {
      primary_color: '#112e40',
      accent_color: '#10b981'
    }
  }
];

const demoCategories = [
  { name: 'Food & Drinks', icon: '🥤', position: 1 },
  { name: 'Bakery', icon: '🥖', position: 2 },
  { name: 'Groceries', icon: '🛍️', position: 3 },
  { name: 'Fruits', icon: '🍎', position: 4 },
  { name: 'Protein', icon: '🥩', position: 5 },
  { name: 'Beverages', icon: '🥤', position: 6 },
  { name: 'Snacks', icon: '🍿', position: 7 },
  { name: 'Dairy', icon: '🥛', position: 8 }
];

const demoProducts = [
  // Food & Drinks
  {
    name: '2KG Chinese rice',
    description: 'Premium quality Chinese rice perfect for any meal',
    price: 2830.90,
    stock_quantity: 122,
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
    category_name: 'Food & Drinks',
    sku: 'RICE2KG001'
  },
  {
    name: '8KG Big size pizza',
    description: 'Large family-sized pizza with premium toppings',
    price: 8000,
    stock_quantity: 45,
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    category_name: 'Food & Drinks',
    sku: 'PIZZA8KG001'
  },
  {
    name: '75CL Coca Cola',
    description: 'Refreshing Coca Cola in 75cl bottle',
    price: 1000,
    stock_quantity: 200,
    image_url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop',
    category_name: 'Beverages',
    sku: 'COKE75CL001'
  },
  // Bakery
  {
    name: 'Fresh Bread Loaf',
    description: 'Freshly baked white bread loaf',
    price: 450,
    stock_quantity: 80,
    image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop',
    category_name: 'Bakery',
    sku: 'BREAD001'
  },
  {
    name: 'Chocolate Croissant',
    description: 'Buttery croissant filled with rich chocolate',
    price: 800,
    stock_quantity: 25,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab794f4c39a7?w=400&h=300&fit=crop',
    category_name: 'Bakery',
    sku: 'CROIS001'
  },
  {
    name: 'Birthday Cake',
    description: 'Custom birthday cake with vanilla frosting',
    price: 15000,
    stock_quantity: 5,
    image_url: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&h=300&fit=crop',
    category_name: 'Bakery',
    sku: 'CAKE001'
  },
  // Groceries
  {
    name: 'Organic Honey 1kg',
    description: 'Pure organic honey from local farms',
    price: 5000,
    stock_quantity: 30,
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
    category_name: 'Groceries',
    sku: 'HONEY1KG001'
  },
  {
    name: 'Olive Oil 500ml',
    description: 'Extra virgin olive oil for cooking',
    price: 2500,
    stock_quantity: 60,
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop',
    category_name: 'Groceries',
    sku: 'OLIVE500ML001'
  },
  // Fruits
  {
    name: 'Fresh Bananas 1kg',
    description: 'Sweet and ripe bananas',
    price: 800,
    stock_quantity: 150,
    image_url: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=300&fit=crop',
    category_name: 'Fruits',
    sku: 'BANANA1KG001'
  },
  {
    name: 'Red Apples 1kg',
    description: 'Crispy red apples imported from South Africa',
    price: 1200,
    stock_quantity: 100,
    image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop',
    category_name: 'Fruits',
    sku: 'APPLE1KG001'
  },
  {
    name: 'Orange Juice 1L',
    description: 'Freshly squeezed orange juice',
    price: 1500,
    stock_quantity: 75,
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop',
    category_name: 'Beverages',
    sku: 'ORANGE1L001'
  },
  // Protein
  {
    name: 'Chicken Breast 1kg',
    description: 'Fresh boneless chicken breast',
    price: 3500,
    stock_quantity: 40,
    image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
    category_name: 'Protein',
    sku: 'CHICKEN1KG001'
  },
  {
    name: 'Fresh Fish 1kg',
    description: 'Daily catch fresh fish',
    price: 4000,
    stock_quantity: 25,
    image_url: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop',
    category_name: 'Protein',
    sku: 'FISH1KG001'
  },
  // Snacks
  {
    name: 'Potato Chips',
    description: 'Crispy potato chips with sea salt',
    price: 600,
    stock_quantity: 120,
    image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop',
    category_name: 'Snacks',
    sku: 'CHIPS001'
  },
  {
    name: 'Mixed Nuts 250g',
    description: 'Premium mixed nuts for healthy snacking',
    price: 1800,
    stock_quantity: 50,
    image_url: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=300&fit=crop',
    category_name: 'Snacks',
    sku: 'NUTS250G001'
  },
  // Dairy
  {
    name: 'Fresh Milk 1L',
    description: 'Farm fresh whole milk',
    price: 800,
    stock_quantity: 90,
    image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
    category_name: 'Dairy',
    sku: 'MILK1L001'
  },
  {
    name: 'Greek Yogurt 500g',
    description: 'Creamy Greek yogurt with probiotics',
    price: 1200,
    stock_quantity: 35,
    image_url: 'https://images.unsplash.com/photo-1571212515416-d9aba4ee5e2e?w=400&h=300&fit=crop',
    category_name: 'Dairy',
    sku: 'YOGURT500G001'
  }
];

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function seedData() {
  try {
    console.log('🌱 Starting demo data seeding...');

    // Clear existing data
    console.log('🧹 Cleaning existing data...');
    await supabase.from('order_item').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('order').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('product').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('category').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('store').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Seed stores
    console.log('🏪 Seeding stores...');
    const { data: stores, error: storeError } = await supabase
      .from('store')
      .insert(demoStores)
      .select();

    if (storeError) {
      console.error('Error seeding stores:', storeError);
      return;
    }

    console.log(`✅ Created ${stores.length} stores`);

    // Seed categories for each store
    console.log('📂 Seeding categories...');
    for (const store of stores) {
      const categoriesWithStore = demoCategories.map(cat => ({
        ...cat,
        store_id: store.id,
        slug: generateSlug(cat.name),
        active: true
      }));

      const { data: categories, error: categoryError } = await supabase
        .from('category')
        .insert(categoriesWithStore)
        .select();

      if (categoryError) {
        console.error(`Error seeding categories for store ${store.name}:`, categoryError);
        continue;
      }

      console.log(`✅ Created ${categories.length} categories for ${store.name}`);

      // Create category mapping
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
      });

      // Seed products for this store
      console.log(`🛍️ Seeding products for ${store.name}...`);
      const productsWithStore = demoProducts.map(product => {
        const productData = {
          store_id: store.id,
          category_id: categoryMap[product.category_name],
          name: product.name,
          slug: generateSlug(product.name),
          description: product.description,
          price: product.price,
          stock_quantity: product.stock_quantity,
          image_url: product.image_url,
          active: true
        };
        
        // SKU field not available in current schema
        
        return productData;
      });

      const { data: products, error: productError } = await supabase
        .from('product')
        .insert(productsWithStore)
        .select();

      if (productError) {
        console.error(`Error seeding products for store ${store.name}:`, productError);
        continue;
      }

      console.log(`✅ Created ${products.length} products for ${store.name}`);
    }

    console.log('🎉 Demo data seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Stores: ${stores.length}`);
    console.log(`- Categories per store: ${demoCategories.length}`);
    console.log(`- Products per store: ${demoProducts.length}`);
    console.log('\n🔗 Demo store URLs:');
    stores.forEach(store => {
      console.log(`- ${store.name}: http://localhost:3001/${store.slug}`);
    });

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

// Run the seeding
seedData().then(() => {
  console.log('\n✨ Seeding complete!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});