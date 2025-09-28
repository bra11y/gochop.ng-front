import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '@/components/ProductCard';
import { useCartStore } from '@/store/cart';

jest.mock('@/store/cart');

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 1000,
    currency: 'NGN',
    images: ['/test.jpg'],
    category: { id: '1', name: 'Test', slug: 'test' },
  };
  
  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₦1,000')).toBeInTheDocument();
  });
  
  it('adds product to cart on button click', () => {
    const addItem = jest.fn();
    (useCartStore as jest.Mock).mockReturnValue({ addItem });
    
    render(<ProductCard product={mockProduct} />);
    
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    
    expect(addItem).toHaveBeenCalledWith(mockProduct);
  });
});