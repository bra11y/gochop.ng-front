#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required:', { supabaseUrl, supabaseServiceKey: !!supabaseServiceKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('🔗 Testing database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('stores')
      .select('count(*)')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('📋 Tables not found. Database schema needs to be set up.');
      return false;
    } else if (error) {
      console.error('❌ Database connection error:', error.message);
      return false;
    } else {
      console.log('✅ Database connection successful!');
      console.log('📊 Found stores table with records');
      return true;
    }
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    return false;
  }
}

async function setupSchema() {
  console.log('📋 Setting up database schema...');
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '../../supabase-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Schema setup failed:', error.message);
      return false;
    }
    
    console.log('✅ Database schema set up successfully!');
    return true;
  } catch (err) {
    console.error('❌ Schema setup error:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Setting up FoodCart database...');
  console.log(`🔗 Connecting to: ${supabaseUrl}`);
  
  const connected = await testConnection();
  
  if (!connected) {
    console.log('📋 Need to set up database schema manually in Supabase dashboard');
    console.log('📝 Please run the SQL script from: supabase-schema.sql');
    console.log('🌐 Go to: ' + supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/') + '/sql');
  } else {
    console.log('🎉 Database is ready to use!');
  }
  
  // Test a simple query
  console.log('🧪 Running test queries...');
  
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('id, name, slug')
      .limit(5);
    
    if (error) {
      console.error('❌ Query test failed:', error.message);
    } else {
      console.log(`✅ Found ${stores.length} stores in database`);
      if (stores.length > 0) {
        console.log('📋 Sample stores:', stores.map(s => s.name).join(', '));
      }
    }
  } catch (err) {
    console.error('❌ Query test error:', err.message);
  }
}

main().catch(console.error);