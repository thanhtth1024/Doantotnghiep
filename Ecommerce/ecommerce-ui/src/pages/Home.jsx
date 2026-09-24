import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { toast } from 'react-toastify';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products and categories in parallel
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts({ limit: 8 }),
          productService.getCategories()
        ]);

        setProducts(productsData.data || productsData);
        setFeaturedProducts(productsData.data?.slice(0, 4) || productsData.slice(0, 4));
        setCategories(categoriesData.data || categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải dữ liệu');
        
        // Mock data for demonstration
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
          },
          {
            id: 2,
            name: 'MacBook Pro M3',
            description: 'Laptop chuyên nghiệp cho designer và developer',
            price: 45000000,
            image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300',
            stock: 5,
            category: { name: 'Laptop' },
            rating: 4.9
          },
          {
            id: 3,
            name: 'AirPods Pro 2',
            description: 'Tai nghe không dây chống ồn',
            price: 6000000,
            image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300',
            stock: 15,
            category: { name: 'Phụ kiện' },
            rating: 4.7
          },
          {
            id: 4,
            name: 'iPad Air M2',
            description: 'Máy tính bảng đa năng cho công việc và giải trí',
            price: 18000000,
            image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300',
            stock: 8,
            category: { name: 'Tablet' },
            rating: 4.6
          }
        ];
        
        setProducts(mockProducts);
        setFeaturedProducts(mockProducts);
        setCategories([
          { id: 1, name: 'Điện thoại', slug: 'dien-thoai' },
          { id: 2, name: 'Laptop', slug: 'laptop' },
          { id: 3, name: 'Phụ kiện', slug: 'phu-kien' },
          { id: 4, name: 'Tablet', slug: 'tablet' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Chào mừng đến ECommerce
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Khám phá hàng nghìn sản phẩm chất lượng cao với giá tốt nhất
            </p>
            <Link
              to="/products"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Mua sắm ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Danh mục nổi bật</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.slug || category.id}`}
                className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">📱</div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Sản phẩm nổi bật</h2>
            <Link
              to="/products"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Xem tất cả →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn chúng tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Giao hàng nhanh</h3>
              <p className="text-gray-600">Giao hàng trong 24h trong nội thành</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Thanh toán an toàn</h3>
              <p className="text-gray-600">Đa dạng phương thức thanh toán</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Bảo hành chính hãng</h3>
              <p className="text-gray-600">Sản phẩm chính hãng, bảo hành tận nơi</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 