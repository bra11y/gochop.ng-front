-- Demo Data for FoodCart Launch
-- Run this script in your Supabase SQL Editor

-- Clear existing data (be careful in production!)
DELETE FROM order_item;
DELETE FROM "order";
DELETE FROM product;
DELETE FROM category;
DELETE FROM store;

-- Insert Demo Stores
INSERT INTO store (name, slug, email, phone, address, city, state, status, settings, theme) VALUES
('FoodCart Demo Store', 'demo-store', 'demo@foodcart.com', '+234-800-FOODCART', '123 Demo Street', 'Lagos', 'Lagos State', 'active', 
 '{"currency": "NGN", "delivery_fee": 500, "min_order": 1000}', 
 '{"primary_color": "#112e40", "accent_color": "#ef4444"}'),
('Test Store Premium', 'test-store-premium', 'premium@foodcart.com', '+234-800-PREMIUM', '456 Premium Avenue', 'Abuja', 'FCT', 'active',
 '{"currency": "NGN", "delivery_fee": 750, "min_order": 1500}',
 '{"primary_color": "#112e40", "accent_color": "#10b981"}');

-- Get store IDs for foreign key references
-- Note: You'll need to replace these UUIDs with actual ones after insertion
WITH store_ids AS (
  SELECT id, slug FROM store WHERE slug IN ('demo-store', 'test-store-premium')
)

-- Insert Categories for each store
INSERT INTO category (store_id, name, slug, icon, position, active) 
SELECT 
  s.id,
  c.name,
  LOWER(REPLACE(REPLACE(c.name, ' ', '-'), '&', 'and')) as slug,
  c.icon,
  c.position,
  true
FROM store_ids s
CROSS JOIN (
  VALUES 
    ('Food & Drinks', '🥤', 1),
    ('Bakery', '🥖', 2),
    ('Groceries', '🛍️', 3),
    ('Fruits', '🍎', 4),
    ('Protein', '🥩', 5),
    ('Beverages', '🥤', 6),
    ('Snacks', '🍿', 7),
    ('Dairy', '🥛', 8)
) AS c(name, icon, position);

-- Insert Products (this will need to be done with proper category_id references)
-- Due to UUID complexity, here's a simplified version for the demo-store only:

-- First, let's create a more manageable approach:
DO $$
DECLARE
    demo_store_id UUID;
    food_drinks_id UUID;
    bakery_id UUID;
    groceries_id UUID;
    fruits_id UUID;
    protein_id UUID;
    beverages_id UUID;
    snacks_id UUID;
    dairy_id UUID;
BEGIN
    -- Get the demo store ID
    SELECT id INTO demo_store_id FROM store WHERE slug = 'demo-store';
    
    -- Get category IDs
    SELECT id INTO food_drinks_id FROM category WHERE store_id = demo_store_id AND name = 'Food & Drinks';
    SELECT id INTO bakery_id FROM category WHERE store_id = demo_store_id AND name = 'Bakery';
    SELECT id INTO groceries_id FROM category WHERE store_id = demo_store_id AND name = 'Groceries';
    SELECT id INTO fruits_id FROM category WHERE store_id = demo_store_id AND name = 'Fruits';
    SELECT id INTO protein_id FROM category WHERE store_id = demo_store_id AND name = 'Protein';
    SELECT id INTO beverages_id FROM category WHERE store_id = demo_store_id AND name = 'Beverages';
    SELECT id INTO snacks_id FROM category WHERE store_id = demo_store_id AND name = 'Snacks';
    SELECT id INTO dairy_id FROM category WHERE store_id = demo_store_id AND name = 'Dairy';
    
    -- Insert Products
    INSERT INTO product (store_id, category_id, name, slug, description, price, stock_quantity, image_url, sku, active) VALUES
    -- Food & Drinks
    (demo_store_id, food_drinks_id, '2KG Chinese rice', '2kg-chinese-rice', 'Premium quality Chinese rice perfect for any meal', 2830.90, 122, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop', 'RICE2KG001', true),
    (demo_store_id, food_drinks_id, '8KG Big size pizza', '8kg-big-size-pizza', 'Large family-sized pizza with premium toppings', 8000, 45, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', 'PIZZA8KG001', true),
    
    -- Beverages
    (demo_store_id, beverages_id, '75CL Coca Cola', '75cl-coca-cola', 'Refreshing Coca Cola in 75cl bottle', 1000, 200, 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop', 'COKE75CL001', true),
    (demo_store_id, beverages_id, 'Orange Juice 1L', 'orange-juice-1l', 'Freshly squeezed orange juice', 1500, 75, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop', 'ORANGE1L001', true),
    
    -- Bakery
    (demo_store_id, bakery_id, 'Fresh Bread Loaf', 'fresh-bread-loaf', 'Freshly baked white bread loaf', 450, 80, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop', 'BREAD001', true),
    (demo_store_id, bakery_id, 'Chocolate Croissant', 'chocolate-croissant', 'Buttery croissant filled with rich chocolate', 800, 25, 'https://images.unsplash.com/photo-1555507036-ab794f4c39a7?w=400&h=300&fit=crop', 'CROIS001', true),
    (demo_store_id, bakery_id, 'Birthday Cake', 'birthday-cake', 'Custom birthday cake with vanilla frosting', 15000, 5, 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&h=300&fit=crop', 'CAKE001', true),
    
    -- Groceries
    (demo_store_id, groceries_id, 'Organic Honey 1kg', 'organic-honey-1kg', 'Pure organic honey from local farms', 5000, 30, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop', 'HONEY1KG001', true),
    (demo_store_id, groceries_id, 'Olive Oil 500ml', 'olive-oil-500ml', 'Extra virgin olive oil for cooking', 2500, 60, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop', 'OLIVE500ML001', true),
    
    -- Fruits
    (demo_store_id, fruits_id, 'Fresh Bananas 1kg', 'fresh-bananas-1kg', 'Sweet and ripe bananas', 800, 150, 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=300&fit=crop', 'BANANA1KG001', true),
    (demo_store_id, fruits_id, 'Red Apples 1kg', 'red-apples-1kg', 'Crispy red apples imported from South Africa', 1200, 100, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop', 'APPLE1KG001', true),
    
    -- Protein
    (demo_store_id, protein_id, 'Chicken Breast 1kg', 'chicken-breast-1kg', 'Fresh boneless chicken breast', 3500, 40, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop', 'CHICKEN1KG001', true),
    (demo_store_id, protein_id, 'Fresh Fish 1kg', 'fresh-fish-1kg', 'Daily catch fresh fish', 4000, 25, 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop', 'FISH1KG001', true),
    
    -- Snacks
    (demo_store_id, snacks_id, 'Potato Chips', 'potato-chips', 'Crispy potato chips with sea salt', 600, 120, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=300&fit=crop', 'CHIPS001', true),
    (demo_store_id, snacks_id, 'Mixed Nuts 250g', 'mixed-nuts-250g', 'Premium mixed nuts for healthy snacking', 1800, 50, 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=300&fit=crop', 'NUTS250G001', true),
    
    -- Dairy
    (demo_store_id, dairy_id, 'Fresh Milk 1L', 'fresh-milk-1l', 'Farm fresh whole milk', 800, 90, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop', 'MILK1L001', true),
    (demo_store_id, dairy_id, 'Greek Yogurt 500g', 'greek-yogurt-500g', 'Creamy Greek yogurt with probiotics', 1200, 35, 'https://images.unsplash.com/photo-1571212515416-d9aba4ee5e2e?w=400&h=300&fit=crop', 'YOGURT500G001', true);
    
END $$;