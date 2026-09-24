import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import { orderService } from '../services/orderService';
import { toast } from 'react-toastify';
import { getProductImage } from '../utils/productImages';
import { getProductUnitPrice } from '../utils/productImages';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    }
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + getProductUnitPrice(item) * item.quantity,
    0,
  );

  const shippingMethod = watch('shippingMethod', 'standard');
  const shippingFee = shippingMethod === 'express' ? 50000 : 0;
  const vat = subtotal * 0.1;
  const totalAmount = subtotal + shippingFee + vat;

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      const orderData = {
        status: 'pending',
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: Number(item.price),
          discount: Number(item.discount || 0),
        })),
        paymentMethod: data.paymentMethod,
        shippingMethod: data.shippingMethod,
        shippingAddress: `${data.name}, ${data.phone}, ${data.email}, ${data.address}`,
      };

      await orderService.createOrder(orderData);
      clearCart();
      toast.success('Đặt hàng thành công!');
      navigate('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Đặt hàng thất bại, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Vui lòng đăng nhập
          </h1>
          <p className="text-gray-600 mb-8">
            Bạn cần đăng nhập để thanh toán
          </p>
          <a href="/login" className="btn-primary inline-block">
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Giỏ hàng trống
          </h1>
          <p className="text-gray-600 mb-8">
            Không có sản phẩm nào để thanh toán
          </p>
          <a href="/products" className="btn-primary inline-block">
            Mua sắm ngay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Shipping Information */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin giao hàng</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    {...register('name', { required: 'Họ và tên là bắt buộc' })}
                    className="input"
                    placeholder="Nhập họ và tên"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    {...register('phone', { required: 'Số điện thoại là bắt buộc' })}
                    type="tel"
                    className="input"
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    {...register('email', { 
                      required: 'Email là bắt buộc',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Email không hợp lệ'
                      }
                    })}
                    type="email"
                    className="input"
                    placeholder="Nhập địa chỉ email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ giao hàng *
                  </label>
                  <textarea
                    {...register('address', { required: 'Địa chỉ là bắt buộc' })}
                    rows={3}
                    className="input"
                    placeholder="Nhập địa chỉ chi tiết"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    {...register('paymentMethod', { required: 'Vui lòng chọn phương thức thanh toán' })}
                    type="radio"
                    value="cod"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    {...register('paymentMethod')}
                    type="radio"
                    value="bank"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Chuyển khoản ngân hàng
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    {...register('paymentMethod')}
                    type="radio"
                    value="momo"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Ví điện tử MoMo
                  </span>
                </label>
              </div>
              {errors.paymentMethod && (
                <p className="mt-2 text-sm text-red-600">{errors.paymentMethod.message}</p>
              )}
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Phương thức vận chuyển</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                  <div className="flex items-center">
                    <input
                      {...register('shippingMethod', { required: 'Vui lòng chọn phương thức vận chuyển' })}
                      type="radio"
                      value="standard"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Giao hàng tiêu chuẩn</span>
                      <p className="text-sm text-gray-600">3-5 ngày làm việc</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">Miễn phí</span>
                </label>
                
                <label className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                  <div className="flex items-center">
                    <input
                      {...register('shippingMethod')}
                      type="radio"
                      value="express"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">Giao hàng nhanh</span>
                      <p className="text-sm text-gray-600">1-2 ngày làm việc</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">50.000đ</span>
                </label>
              </div>
              {errors.shippingMethod && (
                <p className="mt-2 text-sm text-red-600">{errors.shippingMethod.message}</p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Đơn hàng của bạn</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      className="h-12 w-12 object-cover rounded"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = '/placeholder-product.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(getProductUnitPrice(item) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="text-gray-900">{shippingFee ? formatPrice(shippingFee) : 'Miễn phí'}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thuế VAT (10%)</span>
                  <span className="text-gray-900">{formatPrice(vat)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Tổng cộng</span>
                    <span className="text-gray-900">{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout; 