import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/auth';
import { orderService } from '../services/orderService';
import { getProductImage } from '../utils/productImages';

const statusLabels = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-violet-100 text-violet-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
};

const money = (value) => `${Number(value || 0).toLocaleString('vi-VN')} đ`;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadOrder = async () => {
      try {
        setLoading(true);
        setOrder(await orderService.getOrder(id));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể tải chi tiết đơn hàng.');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id, isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 px-4 py-20 text-center"><h1 className="text-2xl font-bold text-gray-900">Vui lòng đăng nhập</h1><Link to="/login" className="mt-6 inline-block btn-primary">Đăng nhập</Link></div>;
  }

  if (loading) return <div className="min-h-screen bg-gray-50 px-4 py-20 text-center text-gray-500">Đang tải chi tiết đơn hàng...</div>;
  if (!order) return null;

  const items = order.orderItems || [];
  const status = order.status || 'pending';

  return <div className="min-h-screen bg-slate-100 py-10"><div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
    <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-cyan-700"><ArrowLeftIcon className="h-5 w-5" />Quay lại</button>
    <div className="mb-6 flex flex-col gap-4 rounded-xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm text-cyan-300">Chi tiết đơn hàng</p><h1 className="mt-1 text-2xl font-bold">Đơn hàng #{order.id}</h1><p className="mt-2 text-sm text-slate-300">Đặt ngày {new Date(order.createdAt).toLocaleString('vi-VN')}</p></div><span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusStyles[status] || 'bg-slate-200 text-slate-800'}`}><ClockIcon className="h-4 w-4" />{statusLabels[status] || status}</span></div>
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Sản phẩm đã đặt</h2><div className="mt-5 divide-y divide-slate-100">{items.map((item) => <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0"><img src={getProductImage(item.product || item)} alt={item.product?.name || `Sản phẩm #${item.productId}`} className="h-20 w-20 rounded-lg object-cover" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/placeholder-product.jpg'; }} /><div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-900">{item.product?.name || `Sản phẩm #${item.productId}`}</h3><p className="mt-1 text-sm text-slate-500">Số lượng: {item.quantity}</p><p className="mt-2 text-sm text-slate-600">{money(Number(item.price) - Number(item.discount || 0))} / sản phẩm</p></div><strong className="text-slate-900">{money((Number(item.price) - Number(item.discount || 0)) * item.quantity)}</strong></div>)}</div></section>
      <div className="space-y-6"><section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Tóm tắt thanh toán</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Tổng đơn</span><strong className="text-slate-900">{money(order.totalAmount)}</strong></div><div className="flex justify-between"><span className="text-slate-500">Thanh toán</span><span className="text-slate-700">{order.paymentMethod}</span></div><div className="flex justify-between"><span className="text-slate-500">Vận chuyển</span><span className="text-slate-700">{order.shippingMethod}</span></div></div></section><section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Địa chỉ giao hàng</h2><p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">{order.shippingAddress}</p></section></div>
    </div>
    {status === 'delivered' && <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircleIcon className="h-6 w-6" />Đơn hàng đã được giao thành công.</div>}
  </div></div>;
};

export default OrderDetail;
