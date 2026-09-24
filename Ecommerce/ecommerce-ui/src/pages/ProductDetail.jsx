import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { StarIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import { getProductImages, getProductUnitPrice } from '../utils/productImages';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingComment, setEditingComment] = useState('');
  const [editingRating, setEditingRating] = useState(5);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const reviewData = await reviewService.getProductReviews(id);
      setReviews(Array.isArray(reviewData) ? reviewData : reviewData?.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProduct(id);
      setProduct(productData);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
      
      // Mock data for demonstration
      const mockProduct = {
        id: parseInt(id),
        name: 'iPhone 15 Pro Max',
        description: 'iPhone 15 Pro Max là điện thoại thông minh cao cấp mới nhất từ Apple với chip A17 Pro, camera 48MP và màn hình Super Retina XDR 6.7 inch.',
        longDescription: `
          iPhone 15 Pro Max mang đến hiệu năng vượt trội với chip A17 Pro được sản xuất trên tiến trình 3nm, 
          cho phép xử lý mọi tác vụ một cách mượt mà. Camera chính 48MP với hệ thống ống kính telephoto 5x 
          giúp bạn chụp ảnh chuyên nghiệp. Thiết kế titanium cao cấp vừa bền vừa nhẹ, cùng với Action Button 
          mới giúp tùy chỉnh nhanh chóng.
        `,
        price: 30000000,
        salePrice: 28000000,
        sale: true,
        salePercent: 7,
        images: [
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600'
        ],
        stock: 10,
        category: { name: 'Điện thoại', id: 1 },
        rating: 4.8,
        reviewCount: 245,
        brand: 'Apple',
        sku: 'IP15PM-256-NTU',
        specifications: {
          'Màn hình': '6.7" Super Retina XDR',
          'Chip': 'A17 Pro',
          'Bộ nhớ': '256GB',
          'Camera': '48MP + 12MP + 12MP',
          'Pin': '4441mAh',
          'Hệ điều hành': 'iOS 17'
        },
        features: [
          'Chip A17 Pro 3nm mạnh mẽ',
          'Camera 48MP với zoom quang 5x',
          'Thiết kế titanium cao cấp',
          'Action Button tùy chỉnh',
          'USB-C với tốc độ cao',
          'Màn hình ProMotion 120Hz'
        ]
      };
      setProduct(mockProduct);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const unitPrice = getProductUnitPrice(product);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Đã bỏ khỏi yêu thích' : 'Đã thêm vào yêu thích');
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để đánh giá sản phẩm.');
      navigate('/login');
      return;
    }

    setReviewSubmitting(true);
    try {
      await reviewService.createReview(Number(id), reviewRating, reviewComment.trim());
      setReviewComment('');
      setReviewRating(5);
      await fetchReviews();
      toast.success('Đánh giá của bạn đã được lưu.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể lưu đánh giá.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const startEditingReview = (review) => {
    setEditingReviewId(review.id);
    setEditingComment(review.comment || '');
    setEditingRating(Number(review.rating));
  };

  const saveEditedReview = async (reviewId) => {
    try {
      await reviewService.updateReview(reviewId, editingRating, editingComment.trim());
      setEditingReviewId(null);
      await fetchReviews();
      toast.success('Đã cập nhật đánh giá.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật đánh giá.');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try {
      await reviewService.deleteReview(reviewId);
      setReviews((current) => current.filter((review) => review.id !== reviewId));
      toast.success('Đã xóa đánh giá.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa đánh giá.');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          className={`h-5 w-5 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
              <div className="h-96 bg-gray-300 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-10 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sản phẩm</h1>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Quay lại danh sách sản phẩm
          </button>
        </div>
      </div>
    );
  }

  const images = getProductImages(product);
  const displayImages = images.length ? images : ['/placeholder-product.jpg'];
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li><a href="/" className="text-blue-600 hover:text-blue-800">Trang chủ</a></li>
            <li className="text-gray-500">/</li>
            <li><a href="/products" className="text-blue-600 hover:text-blue-800">Sản phẩm</a></li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Product Images */}
          <div>
            <div className="mb-4">
              <img
                src={displayImages[selectedImage] || displayImages[0]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = '/placeholder-product.jpg';
                }}
              />
            </div>
            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`border-2 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {renderStars(Math.floor(product.rating))}
                <span className="ml-2 text-sm text-gray-600">
                  {product.rating} ({product.reviewCount} đánh giá)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              {Number(product.discount || 0) > 0 || product.sale ? (
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-red-600">
                    {formatPrice(unitPrice)}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    -{Math.round((Number(product.discount || 0) / Number(product.price || 1)) * 100)}%
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">
                  ✓ Còn {product.stock} sản phẩm
                </span>
              ) : (
                <span className="text-red-600 font-medium">
                  ✗ Hết hàng
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng:
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-2 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    (Tối đa {product.stock} sản phẩm)
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary flex items-center justify-center"
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400"
              >
                Mua ngay
              </button>
              <button
                onClick={handleToggleFavorite}
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {isFavorite ? (
                  <HeartSolidIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-gray-400" />
                )}
              </button>
            </div>

            {/* Product Info */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">SKU:</span>
                  <span className="ml-2 font-medium">{product.sku}</span>
                </div>
                <div>
                  <span className="text-gray-600">Thương hiệu:</span>
                  <span className="ml-2 font-medium">{product.brand}</span>
                </div>
                <div>
                  <span className="text-gray-600">Danh mục:</span>
                  <span className="ml-2 font-medium">{product.category?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12 bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin chi tiết</h2>
            
            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Mô tả sản phẩm</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.longDescription || product.description}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Thông số kỹ thuật</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-300">
                          <td className="px-4 py-3 bg-gray-50 font-medium text-gray-900 w-1/3">
                            {key}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Features */}
            {product.features && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tính năng nổi bật</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="mt-8 rounded-lg bg-white p-6 shadow-md">
        <div className="flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
            <p className="mt-1 text-sm text-gray-500">{reviews.length} đánh giá từ khách hàng</p>
          </div>
          {reviews.length > 0 && <div className="flex items-center gap-2"><span className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</span><span className="text-amber-500">★</span></div>}
        </div>

        <form onSubmit={handleReviewSubmit} className="mt-6 rounded-lg bg-slate-50 p-4">
          <h3 className="font-semibold text-gray-900">Chia sẻ trải nghiệm của bạn</h3>
          <div className="mt-3 flex items-center gap-1" aria-label="Chọn số sao">
            {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" onClick={() => setReviewRating(rating)} className={`text-2xl ${rating <= reviewRating ? 'text-amber-400' : 'text-gray-300'}`} aria-label={`${rating} sao`}>★</button>)}
          </div>
          <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} rows="3" maxLength="2000" placeholder="Nhận xét của bạn..." className="mt-3 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500" />
          <button disabled={reviewSubmitting} type="submit" className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{reviewSubmitting ? 'Đang lưu...' : isAuthenticated ? 'Gửi đánh giá' : 'Đăng nhập để đánh giá'}</button>
        </form>

        <div className="mt-6 divide-y divide-gray-200">
          {reviews.map((review) => <article key={review.id} className="py-5 first:pt-0"><div className="flex items-center justify-between gap-4"><div><p className="font-semibold text-gray-900">{review.user?.name || user?.name || `Khách hàng #${review.userId}`}</p><p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p></div><div className="text-amber-400">{'★'.repeat(Number(review.rating))}{'☆'.repeat(5 - Number(review.rating))}</div></div>{editingReviewId === review.id ? <div className="mt-3 space-y-3"><div className="flex gap-1">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" onClick={() => setEditingRating(rating)} className={`text-xl ${rating <= editingRating ? 'text-amber-400' : 'text-gray-300'}`}>★</button>)}</div><textarea value={editingComment} onChange={(event) => setEditingComment(event.target.value)} rows="3" className="w-full rounded-lg border border-gray-300 p-3 text-sm" /><div className="flex gap-2"><button type="button" onClick={() => saveEditedReview(review.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Lưu</button><button type="button" onClick={() => setEditingReviewId(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700">Hủy</button></div></div> : <>{review.comment && <p className="mt-3 text-sm leading-6 text-gray-600">{review.comment}</p>}{isAuthenticated && review.userId === user?.id && <div className="mt-3 flex gap-3"><button type="button" onClick={() => startEditingReview(review)} className="text-xs font-semibold text-blue-600 hover:text-blue-800">Sửa</button><button type="button" onClick={() => deleteReview(review.id)} className="text-xs font-semibold text-rose-600 hover:text-rose-800">Xóa</button></div>}</>}</article>)}
          {reviews.length === 0 && <p className="py-8 text-center text-sm text-gray-500">Sản phẩm chưa có đánh giá nào.</p>}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail; 