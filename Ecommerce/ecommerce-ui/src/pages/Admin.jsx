import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowPathIcon,
  ChartBarIcon,
  CheckIcon,
  CubeIcon,
  PencilSquareIcon,
  PlusIcon,
  ShoppingBagIcon,
  TrashIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/auth';
import { adminService } from '../services/adminService';

const blankProduct = { name: '', description: '', price: '', discount: '', stock: '', categoryId: '', images: '' };
const blankCategory = { name: '', description: '', parentId: '' };
const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100';
const listOf = (value) => (Array.isArray(value) ? value : value?.data || []);
const money = (value) => `${Number(value || 0).toLocaleString('vi-VN')} đ`;

const Admin = () => {
  const { user, isAuthenticated } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [productForm, setProductForm] = useState(blankProduct);
  const [categoryForm, setCategoryForm] = useState(blankCategory);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        adminService.getProducts(), adminService.getCategories(), adminService.getOrders(), adminService.getUsers(), adminService.getReviews(),
      ]);
      const [productResult, categoryResult, orderResult, userResult, reviewResult] = results;
      if (productResult.status === 'fulfilled') setProducts(listOf(productResult.value));
      if (categoryResult.status === 'fulfilled') setCategories(listOf(categoryResult.value));
      if (orderResult.status === 'fulfilled') setOrders(listOf(orderResult.value));
      if (userResult.status === 'fulfilled') setUsers(listOf(userResult.value));
      if (reviewResult.status === 'fulfilled') setReviews(listOf(reviewResult.value));
      if (results.some((result) => result.status === 'rejected')) toast.warning('Một số dữ liệu quản trị chưa tải được.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') loadData();
  }, [isAuthenticated, user?.role]);

  const filteredProducts = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? products.filter((product) => [product.name, product.description, product.category?.name].filter(Boolean).some((text) => text.toLowerCase().includes(value))) : products;
  }, [products, query]);

  const filteredCategories = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? categories.filter((category) => [category.name, category.description].filter(Boolean).some((text) => text.toLowerCase().includes(value))) : categories;
  }, [categories, query]);

  const closeModal = () => { setModal(null); setProductForm(blankProduct); setCategoryForm(blankCategory); };
  const editProduct = (product) => {
    setProductForm({ name: product.name || '', description: product.description || '', price: product.price ?? '', discount: product.discount ?? '', stock: product.stock ?? '', categoryId: product.categoryId ?? product.category?.id ?? '', images: product.images || '' });
    setModal({ type: 'product', item: product });
  };
  const editCategory = (category) => {
    setCategoryForm({ name: category.name || '', description: category.description || '', parentId: category.parentId ?? '' });
    setModal({ type: 'category', item: category });
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    const payload = {
      name: productForm.name.trim(), description: productForm.description.trim() || undefined,
      price: Number(productForm.price), discount: productForm.discount === '' ? undefined : Number(productForm.discount),
      stock: Number(productForm.stock), categoryId: productForm.categoryId === '' ? undefined : Number(productForm.categoryId),
      images: productForm.images.trim() || undefined,
    };
    if (!payload.name || !Number.isFinite(payload.price) || payload.price <= 0 || !Number.isInteger(payload.stock) || payload.stock < 0) {
      toast.error('Vui lòng nhập tên, giá hợp lệ và tồn kho là số nguyên không âm.'); return;
    }
    setSaving(true);
    try {
      if (modal.item) await adminService.updateProduct(modal.item.id, payload);
      else await adminService.createProduct(payload);
      toast.success(modal.item ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm.');
      closeModal(); await loadData();
    } catch (error) { toast.error(error.response?.data?.message || 'Không thể lưu sản phẩm.'); } finally { setSaving(false); }
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    const payload = { name: categoryForm.name.trim(), description: categoryForm.description.trim() || undefined, parentId: categoryForm.parentId === '' ? undefined : Number(categoryForm.parentId) };
    if (!payload.name) { toast.error('Tên danh mục không được để trống.'); return; }
    setSaving(true);
    try {
      if (modal.item) await adminService.updateCategory(modal.item.id, payload);
      else await adminService.createCategory(payload);
      toast.success(modal.item ? 'Đã cập nhật danh mục.' : 'Đã thêm danh mục.');
      closeModal(); await loadData();
    } catch (error) { toast.error(error.response?.data?.message || 'Không thể lưu danh mục.'); } finally { setSaving(false); }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return;
    try { await adminService.deleteProduct(product.id); setProducts((items) => items.filter((item) => item.id !== product.id)); toast.success('Đã xóa sản phẩm.'); }
    catch (error) { toast.error(error.response?.data?.message || 'Không thể xóa sản phẩm.'); }
  };
  const deleteCategory = async (category) => {
    if (!window.confirm(`Xóa danh mục "${category.name}"?`)) return;
    try { await adminService.deleteCategory(category.id); setCategories((items) => items.filter((item) => item.id !== category.id)); toast.success('Đã xóa danh mục.'); }
    catch (error) { toast.error(error.response?.data?.message || 'Không thể xóa danh mục.'); }
  };
  const updateOrder = async (order, status) => {
    try {
      const updated = await adminService.updateOrder(order.id, { status });
      setOrders((items) => items.map((item) => item.id === order.id ? updated : item));
      toast.success('Đã cập nhật trạng thái đơn hàng.');
    } catch (error) { toast.error(error.response?.data?.message || 'Không thể cập nhật đơn hàng.'); }
  };

  if (!isAuthenticated || user?.role !== 'admin') return <div className="min-h-screen bg-slate-950 px-6 py-24 text-center text-white"><h1 className="text-3xl font-bold">Khu vực quản trị</h1><p className="mx-auto mt-3 max-w-md text-slate-300">Bạn cần đăng nhập bằng tài khoản quản trị để tiếp tục.</p><Link to="/admin/login" className="mt-8 inline-flex rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950">Đăng nhập quản trị</Link></div>;

  const stats = [
    ['Sản phẩm', products.length, CubeIcon, 'text-cyan-700 bg-cyan-50'],
    ['Danh mục', categories.length, ChartBarIcon, 'text-amber-700 bg-amber-50'],
    ['Đơn hàng', orders.length, ShoppingBagIcon, 'text-emerald-700 bg-emerald-50'],
    ['Khách hàng', users.length, UserGroupIcon, 'text-violet-700 bg-violet-50'],
  ];
  const tabs = [['overview', 'Tổng quan'], ['products', 'Sản phẩm'], ['categories', 'Danh mục'], ['orders', 'Đơn hàng'], ['users', 'Khách hàng'], ['reviews', 'Đánh giá']];

  return <div className="min-h-screen bg-slate-100">
    <header className="bg-slate-950 text-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">E-commerce control room</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">Quản trị cửa hàng</h1></div><div className="flex items-center gap-2"><button onClick={loadData} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-cyan-300" title="Tải lại dữ liệu"><ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Làm mới</span></button><button onClick={() => { logout(); navigate('/'); }} className="rounded-lg border border-rose-400/60 px-3 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-500/20">Đăng xuất</button></div></div></header>
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value, Icon, tone]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{loading ? '—' : value}</p></div><span className={`rounded-lg p-3 ${tone}`}><Icon className="h-6 w-6" /></span></div></div>)}</div>
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"><nav className="flex gap-1 overflow-x-auto">{tabs.map(([id, label]) => <button key={id} onClick={() => { setTab(id); setQuery(''); }} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${tab === id ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>)}</nav>{['products', 'categories'].includes(tab) && <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm..." className={inputClass} />}</div>
      {tab === 'overview' && <Overview products={products} orders={orders} onProduct={() => { setTab('products'); setProductForm(blankProduct); setModal({ type: 'product' }); }} onCategory={() => { setTab('categories'); setCategoryForm(blankCategory); setModal({ type: 'category' }); }} />}
      {tab === 'products' && <Table title="Sản phẩm" count={filteredProducts.length} addLabel="Thêm sản phẩm" onAdd={() => { setProductForm(blankProduct); setModal({ type: 'product' }); }} headers={['Sản phẩm', 'Danh mục', 'Giá', 'Tồn kho', 'Thao tác']} rows={filteredProducts.map((product) => [<><b>{product.name}</b><small className="mt-1 block max-w-xs truncate text-slate-500">#{product.id} {product.description}</small></>, product.category?.name || 'Chưa phân loại', money(product.price), <span className={Number(product.stock) <= 5 ? 'font-semibold text-rose-600' : 'font-semibold text-emerald-700'}>{product.stock}</span>, <Actions onEdit={() => editProduct(product)} onDelete={() => deleteProduct(product)} />])} empty="Chưa có sản phẩm phù hợp." />}
      {tab === 'categories' && <Table title="Danh mục sản phẩm" count={filteredCategories.length} addLabel="Thêm danh mục" onAdd={() => { setCategoryForm(blankCategory); setModal({ type: 'category' }); }} headers={['Tên danh mục', 'Mô tả', 'Số sản phẩm', 'Thao tác']} rows={filteredCategories.map((category) => [<b>{category.name}</b>, category.description || 'Chưa có mô tả', category.products?.length ?? products.filter((product) => product.categoryId === category.id).length, <Actions onEdit={() => editCategory(category)} onDelete={() => deleteCategory(category)} />])} empty="Chưa có danh mục phù hợp." />}
      {tab === 'orders' && <Table title="Đơn hàng" count={orders.length} headers={['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái']} rows={orders.map((order) => [<b>#{order.id}</b>, order.user?.name || order.user?.email || `Khách #${order.userId}`, money(order.totalAmount), <div className="flex items-center gap-3"><select value={order.status} onChange={(event) => updateOrder(order, event.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"><option value="pending">Chờ xử lý</option><option value="processing">Đang xử lý</option><option value="shipped">Đang giao</option><option value="delivered">Đã giao</option><option value="cancelled">Đã hủy</option></select><Link to={`/orders/${order.id}`} className="whitespace-nowrap text-sm font-semibold text-cyan-700 hover:text-cyan-900">Chi tiết</Link></div>])} empty="Chưa có đơn hàng." />}
      {tab === 'users' && <Table title="Khách hàng" count={users.length} headers={['Khách hàng', 'Email', 'Điện thoại', 'Ngày tham gia']} rows={users.map((customer) => [<b>{customer.name || `Khách #${customer.id}`}</b>, customer.email, customer.phone || '—', customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : '—'])} empty="Chưa có khách hàng." />}
      {tab === 'reviews' && <ReviewManagement reviews={reviews} onDeleted={(id) => setReviews((items) => items.filter((review) => review.id !== id))} />}
    </main>
    {modal?.type === 'product' && <ProductModal form={productForm} setForm={setProductForm} categories={categories} editing={Boolean(modal.item)} saving={saving} onClose={closeModal} onSubmit={saveProduct} />}
    {modal?.type === 'category' && <CategoryModal form={categoryForm} setForm={setCategoryForm} categories={categories} editing={Boolean(modal.item)} saving={saving} onClose={closeModal} onSubmit={saveCategory} />}
  </div>;
};

const Overview = ({ products, orders, onProduct, onCategory }) => <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]"><Panel><div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-wider text-cyan-700">Vận hành</p><h2 className="mt-1 text-xl font-bold text-slate-900">Tình hình cửa hàng</h2></div><ChartBarIcon className="h-8 w-8 text-slate-300" /></div><div className="mt-6 space-y-4 text-sm"><Metric label="Đơn hàng chờ xử lý" value={orders.filter((order) => ['pending', 'processing'].includes(order.status)).length} /><Metric label="Sản phẩm sắp hết hàng" value={products.filter((product) => Number(product.stock) <= 5).length} danger /><Metric label="Doanh thu đơn đã giao" value={money(orders.filter((order) => order.status === 'delivered').reduce((total, order) => total + Number(order.totalAmount || 0), 0))} /></div></Panel><Panel><h2 className="text-xl font-bold text-slate-900">Thao tác nhanh</h2><div className="mt-5 grid gap-3"><button onClick={onProduct} className="flex items-center gap-3 rounded-lg bg-cyan-50 p-4 text-left text-cyan-900 hover:bg-cyan-100"><PlusIcon className="h-5 w-5" />Thêm sản phẩm</button><button onClick={onCategory} className="flex items-center gap-3 rounded-lg bg-amber-50 p-4 text-left text-amber-900 hover:bg-amber-100"><PlusIcon className="h-5 w-5" />Thêm danh mục</button></div></Panel></div>;
const Metric = ({ label, value, danger }) => <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"><span className="text-slate-500">{label}</span><strong className={danger ? 'text-rose-600' : 'text-slate-900'}>{value}</strong></div>;
const Panel = ({ children }) => <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">{children}</section>;
const Table = ({ title, count, addLabel, onAdd, headers, rows, empty }) => <Panel><div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{count} bản ghi</p></div>{onAdd && <button onClick={onAdd} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700"><PlusIcon className="h-5 w-5" />{addLabel}</button>}</div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row, index) => <tr key={index} className="hover:bg-slate-50">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-4 text-slate-600">{cell}</td>)}</tr>)}{rows.length === 0 && <tr><td colSpan={headers.length} className="px-6 py-12 text-center text-slate-500">{empty}</td></tr>}</tbody></table></div></Panel>;
const Actions = ({ onEdit, onDelete }) => <div className="flex gap-2"><button onClick={onEdit} className="rounded-lg p-2 text-slate-500 hover:bg-cyan-50 hover:text-cyan-700" title="Chỉnh sửa"><PencilSquareIcon className="h-5 w-5" /></button><button onClick={onDelete} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700" title="Xóa"><TrashIcon className="h-5 w-5" /></button></div>;
const ReviewManagement = ({ reviews, onDeleted }) => {
  const average = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length : 0;
  const positive = reviews.filter((review) => Number(review.rating) >= 4).length;
  const negative = reviews.filter((review) => Number(review.rating) <= 2).length;
  const deleteReview = async (review) => {
    if (!window.confirm('Xóa đánh giá này khỏi hệ thống?')) return;
    try {
      await adminService.deleteReview(review.id);
      onDeleted(review.id);
      toast.success('Đã xóa đánh giá.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa đánh giá.');
    }
  };

  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Tổng đánh giá</p><p className="mt-2 text-3xl font-bold text-slate-900">{reviews.length}</p></div><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Điểm trung bình</p><p className="mt-2 text-3xl font-bold text-amber-600">{average.toFixed(1)} <span className="text-xl">★</span></p></div><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">4-5 sao / 1-2 sao</p><p className="mt-2 text-xl font-bold text-emerald-700">{positive} <span className="text-slate-300">/</span> <span className="text-rose-600">{negative}</span></p></div></div><Panel><div className="mb-5 border-b border-slate-100 pb-5"><h2 className="text-xl font-bold text-slate-900">Kho dữ liệu đánh giá</h2><p className="mt-1 text-sm text-slate-500">Nội dung gốc được lưu để tích hợp mô hình phân tích cảm xúc sau này.</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Sản phẩm</th><th className="px-4 py-3">Khách hàng</th><th className="px-4 py-3">Đánh giá</th><th className="px-4 py-3">Nội dung</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{reviews.map((review) => <tr key={review.id} className="hover:bg-slate-50"><td className="px-4 py-4 font-semibold text-slate-900">{review.product?.name || `Sản phẩm #${review.productId}`}</td><td className="px-4 py-4 text-slate-600">{review.user?.name || review.user?.email || `Khách #${review.userId}`}</td><td className="px-4 py-4 whitespace-nowrap text-amber-500">{'★'.repeat(Number(review.rating))}{'☆'.repeat(5 - Number(review.rating))}</td><td className="max-w-sm px-4 py-4 text-slate-600">{review.comment || 'Không có nhận xét'}</td><td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Chờ phân tích</span></td><td className="px-4 py-4"><button onClick={() => deleteReview(review)} className="text-sm font-semibold text-rose-600 hover:text-rose-800">Xóa</button></td></tr>)}{reviews.length === 0 && <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">Chưa có đánh giá nào.</td></tr>}</tbody></table></div></Panel></div>;
};
const Field = ({ label, children }) => <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
const Modal = ({ title, children, onClose }) => <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><h2 className="text-xl font-bold text-slate-900">{title}</h2><button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Đóng"><XMarkIcon className="h-5 w-5" /></button></div>{children}</div></div>;
const ModalButtons = ({ saving, onClose }) => <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Hủy</button><button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <CheckIcon className="h-5 w-5" />}Lưu thay đổi</button></div>;
const ProductModal = ({ form, setForm, categories, editing, saving, onClose, onSubmit }) => <Modal title={editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'} onClose={onClose}><form onSubmit={onSubmit} className="space-y-5 p-6"><Field label="Tên sản phẩm *"><input required className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field><Field label="Mô tả"><textarea rows="3" className={inputClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Giá bán *"><input required type="number" min="1" step="0.01" className={inputClass} value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></Field><Field label="Giảm giá"><input type="number" min="0" step="0.01" className={inputClass} value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} /></Field><Field label="Tồn kho *"><input required type="number" min="0" step="1" className={inputClass} value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} /></Field><Field label="Danh mục"><select className={inputClass} value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}><option value="">Chưa phân loại</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field></div><Field label="Ảnh sản phẩm"><input className={inputClass} placeholder="URL hoặc chuỗi JSON ảnh" value={form.images} onChange={(event) => setForm({ ...form, images: event.target.value })} /></Field><ModalButtons saving={saving} onClose={onClose} /></form></Modal>;
const CategoryModal = ({ form, setForm, categories, editing, saving, onClose, onSubmit }) => <Modal title={editing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'} onClose={onClose}><form onSubmit={onSubmit} className="space-y-5 p-6"><Field label="Tên danh mục *"><input required className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field><Field label="Mô tả"><textarea rows="4" className={inputClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field><Field label="Danh mục cha"><select className={inputClass} value={form.parentId} onChange={(event) => setForm({ ...form, parentId: event.target.value })}><option value="">Không có</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field><ModalButtons saving={saving} onClose={onClose} /></form></Modal>;

export default Admin;
