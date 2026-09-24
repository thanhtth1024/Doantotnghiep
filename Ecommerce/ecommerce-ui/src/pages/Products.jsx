import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { MagnifyingGlassIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') || '',
    max: searchParams.get('maxPrice') || ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchData();
  }, [searchParams, currentPage]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'name') params.set('sort', sortBy);
    if (priceRange.min) params.set('minPrice', priceRange.min);
    if (priceRange.max) params.set('maxPrice', priceRange.max);
    
    setSearchParams(params);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedCategory, sortBy, priceRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: selectedCategory,
        sort: sortBy,
        minPrice: priceRange.min,
        maxPrice: priceRange.max
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(params),
        productService.getCategories()
      ]);

      setProducts(productsData.data || productsData);
      setTotalPages(Math.ceil((productsData.total || productsData.length) / itemsPerPage));
      setCategories(categoriesData.data || categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu sản phẩm');
      
      // Mock data for demonstration
      const mockProducts = [
        {
          id: 1,
          name: 'iPhone 15 Pro Max',
          description: 'Điện thoại thông minh cao cấp từ Apple',
          price: 30000000,
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300',
          stock: 10,
          category: { name: 'Điện thoại', id: 1 },
          rating: 4.8
        },
        {
          id: 2,
          name: 'MacBook Pro M3',
          description: 'Laptop chuyên nghiệp cho designer và developer',
          price: 45000000,
          image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300',
          stock: 5,
          category: { name: 'Laptop', id: 2 },
          rating: 4.9
        },
        {
          id: 3,
          name: 'AirPods Pro 2',
          description: 'Tai nghe không dây chống ồn',
          price: 6000000,
          image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300',
          stock: 15,
          category: { name: 'Phụ kiện', id: 3 },
          rating: 4.7
        },
        {
          id: 4,
          name: 'iPad Air M2',
          description: 'Máy tính bảng đa năng cho công việc và giải trí',
          price: 18000000,
          image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300',
          stock: 8,
          category: { name: 'Tablet', id: 4 },
          rating: 4.6
        },
        {
          id: 5,
          name: 'Samsung Galaxy S24 Ultra',
          description: 'Flagship Android với camera tuyệt vời',
          price: 28000000,
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
          stock: 12,
          category: { name: 'Điện thoại', id: 1 },
          rating: 4.5
        },
        {
          id: 6,
          name: 'Dell XPS 13',
          description: 'Laptop mỏng nhẹ cho doanh nhân',
          price: 35000000,
          image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300',
          stock: 7,
          category: { name: 'Laptop', id: 2 },
          rating: 4.4
        }
      ];
      
      setProducts(mockProducts);
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search will be triggered by useEffect
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('name');
    setPriceRange({ min: '', max: '' });
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sản phẩm</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-6 w-6 text-gray-400" />
            </div>
          </form>

          {/* Filter Toggle Button (Mobile) */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-3 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">Bộ lọc</h2>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Xóa bộ lọc
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Danh mục</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-600">Tất cả</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        value={category.id}
                        checked={selectedCategory === category.id.toString()}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-600">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Khoảng giá</h3>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Giá tối thiểu"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Giá tối đa"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Sắp xếp theo</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Tên A-Z</option>
                  <option value="name_desc">Tên Z-A</option>
                  <option value="price">Giá thấp đến cao</option>
                  <option value="price_desc">Giá cao đến thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md animate-pulse">
                    <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Results Info */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-gray-600">
                    Hiển thị {products.length} sản phẩm
                    {searchTerm && ` cho "${searchTerm}"`}
                  </p>
                  <div className="flex items-center space-x-2">
                    <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Sắp xếp: {sortBy === 'name' ? 'Tên A-Z' : 
                               sortBy === 'price' ? 'Giá thấp đến cao' : 
                               sortBy === 'rating' ? 'Đánh giá cao' : 'Mới nhất'}
                    </span>
                  </div>
                </div>

                {/* Products Grid */}
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Không tìm thấy sản phẩm
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="btn-primary"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <nav className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Trước
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sau
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products; 