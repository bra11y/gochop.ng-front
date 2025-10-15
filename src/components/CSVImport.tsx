'use client';

import { useState, useRef } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productQueries, categoryQueries } from '@/lib/supabase/queries';

interface CSVImportProps {
  storeId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

interface ProductRow {
  name: string;
  category: string;
  price: string;
  description?: string;
  stock_quantity?: string;
  sku?: string;
  image_url?: string;
}

export default function CSVImport({ storeId, onSuccess, onClose }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    errors: Array<{ row: number; error: string; data: any }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent = [
      'name,category,price,description,stock_quantity,sku,image_url',
      'Coca Cola 35cl,Beverages,200,Classic Coca Cola drink,50,CC35,https://example.com/coca-cola.jpg',
      'Fresh Bananas,Fruits,800,Sweet and ripe bananas,30,BAN1KG,https://example.com/bananas.jpg',
      'Bread Loaf,Bakery,450,Fresh white bread,20,BR450,https://example.com/bread.jpg'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (content: string): ProductRow[] => {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row as ProductRow;
    });
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    const results = { success: 0, errors: [] as any[] };

    try {
      const content = await file.text();
      const rows = parseCSV(content);
      
      // Get existing categories
      const categories = await categoryQueries.getByStore(storeId);
      const categoryMap = new Map(categories.map((cat: any) => [cat.name.toLowerCase(), cat.id]));

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // +2 because of header and 0-based index

        try {
          // Validate required fields
          if (!row.name || !row.category || !row.price) {
            results.errors.push({
              row: rowNumber,
              error: 'Missing required fields (name, category, price)',
              data: row
            });
            continue;
          }

          // Find or create category
          let categoryId = categoryMap.get(row.category.toLowerCase());
          if (!categoryId) {
            // Create new category
            try {
              const newCategory = await categoryQueries.create({
                store_id: storeId,
                name: row.category,
                slug: generateSlug(row.category),
                position: categories.length + categoryMap.size + 1,
                active: true
              });
              categoryId = (newCategory as any).id;
              categoryMap.set(row.category.toLowerCase(), categoryId);
              console.log('Created new category:', newCategory);
            } catch (categoryError: any) {
              console.error('Error creating category:', categoryError);
              throw new Error(`Failed to create category "${row.category}": ${categoryError.message}`);
            }
          }

          // Create product (handle optional sku column)
          const productData: any = {
            store_id: storeId,
            category_id: categoryId || null, // Fix: Use null instead of empty string
            name: row.name,
            slug: generateSlug(row.name),
            description: row.description || null,
            price: parseFloat(row.price),
            stock_quantity: row.stock_quantity ? parseInt(row.stock_quantity) : 0,
            image_url: row.image_url || null,
            active: true
          };

          // Only add sku if it exists in the row and is not empty
          if (row.sku && row.sku.trim()) {
            productData.sku = row.sku;
          }

          await productQueries.create(productData);
          results.success++;

        } catch (error: any) {
          results.errors.push({
            row: rowNumber,
            error: error.message || 'Failed to create product',
            data: row
          });
        }
      }

      setResults(results);
      
      if (results.success > 0) {
        toast.success(`Successfully imported ${results.success} products`);
        onSuccess?.();
      }
      
      if (results.errors.length > 0) {
        toast.error(`${results.errors.length} products failed to import`);
      }

    } catch (error: any) {
      toast.error('Failed to process CSV file');
      console.error('CSV processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResults(null);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Import Products from CSV</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Download Template */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Need a template?</h3>
              <p className="text-sm text-blue-700">Download our CSV template to get started</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Download className="h-4 w-4" />
              Template
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          
          {!file ? (
            <>
              <p className="text-lg font-medium text-gray-900 mb-2">Choose CSV file</p>
              <p className="text-sm text-gray-500 mb-4">
                Upload a CSV file with your product data
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
              >
                Select CSV File
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">{file.name}</span>
              </div>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setFile(null);
                    setResults(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Choose Different File
                </button>
                
                <button
                  onClick={processFile}
                  disabled={isProcessing}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    'Import Products'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            {results.success > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">
                    Successfully imported {results.success} products
                  </span>
                </div>
              </div>
            )}

            {results.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800 mb-3">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">
                    {results.errors.length} products failed to import
                  </span>
                </div>
                
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {results.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                      <strong>Row {error.row}:</strong> {error.error}
                      {error.data.name && <span> ({error.data.name})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">CSV Format Requirements:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Required columns: name, category, price</li>
            <li>• Optional columns: description, stock_quantity, sku, image_url</li>
            <li>• Price should be in smallest currency unit (e.g., 200 for ₦2.00)</li>
            <li>• Categories will be created automatically if they don't exist</li>
            <li>• Product names must be unique within your store</li>
          </ul>
        </div>
      </div>
    </div>
  );
}