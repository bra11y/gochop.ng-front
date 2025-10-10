# Demo Data Setup

This directory contains scripts to populate the Supabase database with demo data for the FoodCart launch.

## Quick Start

### Option 1: Using Node.js Script (Recommended)

```bash
# Install dependencies if not already done
npm install

# Run the demo data seeding script
npm run seed:demo

# Or run directly
node scripts/seed-demo-data.js
```

### Option 2: Using SQL Script

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the content from `demo-data.sql`
4. Run the script

## What Gets Created

### Stores
- **FoodCart Demo Store** (`demo-store`)
- **Test Store Premium** (`test-store-premium`)

### Categories (for each store)
- Food & Drinks 🥤
- Bakery 🥖
- Groceries 🛍️
- Fruits 🍎
- Protein 🥩
- Beverages 🥤
- Snacks 🍿
- Dairy 🥛

### Products (per store)
- 16+ products across all categories
- Real product images from Unsplash
- Varied pricing from ₦450 to ₦15,000
- Stock quantities from 5 to 200 items
- Proper SKUs and descriptions

## Access Demo Stores

After seeding, you can access:

- **Demo Store**: http://localhost:3001/demo-store
- **Premium Store**: http://localhost:3001/test-store-premium

## Environment Requirements

Make sure you have these environment variables set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# For the Node.js script, you may also need:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Data Structure

The demo data follows the exact schema with:
- Proper foreign key relationships
- SEO-friendly slugs
- High-quality product images
- Realistic Nigerian pricing
- Stock management ready
- Multiple product categories

## Troubleshooting

If seeding fails:

1. Check your Supabase connection
2. Ensure all environment variables are set
3. Verify your database permissions
4. Check the console for specific error messages

## Reset Database

To clear all data and reseed:

```bash
npm run db:reset
```

⚠️ **Warning**: This will delete ALL existing data in your database!