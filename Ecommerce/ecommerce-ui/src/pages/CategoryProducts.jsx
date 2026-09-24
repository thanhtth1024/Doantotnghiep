import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { toast } from 'react-toastify';

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoryData] = await Promise.all([
        productService.getProductsByCategory(categoryId),
        productService.getCategory(categoryId)
      ]);
      
      setProducts(productsData.data || productsData);
      setCategory(categoryData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu');
      
      // Mock data
      const mockProducts = [
        {
          id: 1,
          name: 'iPhone 15 Pro Max',
          description: 'Điện thoại thông minh cao cấp từ Apple',
          price: 30000000,
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
          stock: 10,
          category: { name: 'Điện thoại' },
          rating: 4.8
        }
      ];
      setProducts(mockProducts);
      setCategory({ name: 'Điện thoại' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md">
                  <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link to="/" className="text-blue-600 hover:text-blue-800">Trang chủ</Link></li>
            <li className="text-gray-500">/</li>
            <li><Link to="/categories" className="text-blue-600 hover:text-blue-800">Danh mục</Link></li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900">{category?.name}</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {category?.name || 'Danh mục sản phẩm'}
        </h1>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có sản phẩm nào
            </h3>
            <p className="text-gray-600 mb-4">
              Danh mục này chưa có sản phẩm nào
            </p>
            <Link
              to="/products"
              className="btn-primary inline-block"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts; 