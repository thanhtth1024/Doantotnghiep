import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/auth';

const AdminLogin = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await authService.adminLogin(form.username, form.password);
      login(response.user, response.access_token);
      toast.success('Đăng nhập quản trị thành công.');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Thông tin quản trị không hợp lệ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">E-commerce control room</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Đăng nhập quản trị</h1>
        <p className="mt-2 text-sm text-slate-500">Sử dụng tài khoản quản trị để truy cập dữ liệu cửa hàng.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Tên đăng nhập</span><input required autoComplete="username" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Mật khẩu</span><input required type="password" autoComplete="current-password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          <button disabled={submitting} className="w-full rounded-lg bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-cyan-700 disabled:opacity-60">{submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        </form>
        <Link to="/login" className="mt-6 block text-center text-sm font-semibold text-cyan-700 hover:text-cyan-900">Quay lại đăng nhập khách hàng</Link>
      </div>
    </main>
  );
};

export default AdminLogin;
