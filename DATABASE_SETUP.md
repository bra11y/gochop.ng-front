# 🗄️ Database Setup Instructions

## ✅ Database Connection Status
- **New Vercel Database**: `https://cssgcqetoiagtemhlfuy.supabase.co`
- **Connection**: ✅ Working
- **Schema**: ❌ Needs Setup

## 🛠️ Setup Steps Required

### 1. Access Supabase Dashboard
Go to: https://supabase.com/dashboard/project/cssgcqetoiagtemhlfuy/sql

### 2. Run Database Schema
Copy and paste the entire content from `supabase-schema.sql` into the SQL editor and run it.

The schema will create:
- **stores** table (your marketplace stores)
- **categories** table (product categories)
- **products** table (store products)
- **orders** table (customer orders)
- **order_items** table (order line items)
- **store_payment_info** table (encrypted payment data)

### 3. Sample Data
After running the schema, you'll have:
- ✅ One sample store: "Campus Mart"
- ✅ Sample categories: Drinks, Snacks, Fruits, etc.
- ✅ Sample products for testing

### 4. Verify Setup
After running the schema, restart your development server:
```bash
npm run dev
```

Then test the application at: http://localhost:3002/campus-mart

## 🔧 Environment Configuration Updated

The application is now configured to use your new Vercel database:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cssgcqetoiagtemhlfuy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 What Works After Setup

1. **Complete Order Management System**
2. **Store Owner Dashboard** (`/campus-mart/manage`)
3. **Customer Order Tracking** (`/campus-mart/delivery-tracking`)
4. **Platform Owner Dashboard** (`/admin`)
5. **Full E-commerce Flow** (cart → checkout → payment → tracking)

## 🔄 Next Steps

1. Run the schema in Supabase dashboard
2. Test the application
3. Deploy to Vercel (will automatically use the new database)

---

**Need Help?** The database connection is working, you just need to set up the tables!