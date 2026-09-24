# React E-commerce Frontend - AI Agent Instruction

## Mục tiêu
Xây dựng giao diện người dùng bằng React cho hệ thống bán hàng online. Agent cần thực hiện tự động toàn bộ:

- Khởi tạo project React với Vite + Tailwind CSS + React Router + Axios
- Cấu trúc thư mục chuẩn: `pages`, `components`, `services`, `layouts`, `hooks`, `contexts`
- Tích hợp API từ backend NestJS (http://localhost:3000)
- Giao diện responsive và dễ dùng
- Xử lý form bằng React Hook Form
- Hiển thị thông báo (Toast) bằng react-toastify

## Các trang cần có
- Trang chủ (danh sách sản phẩm)
- Trang chi tiết sản phẩm
- Trang danh mục sản phẩm
- Trang giỏ hàng
- Trang thanh toán
- Đăng nhập / Đăng ký
- Trang đơn hàng (của người dùng)
- Trang admin (quản lý sản phẩm, đơn hàng)

## Luồng hoạt động
1. Tạo project React bằng Vite
2. Cài các package:
   - tailwindcss
   - react-router-dom
   - axios
   - react-hook-form
   - react-toastify
   - zustand (hoặc context)
3. Cấu hình Tailwind và Router
4. Tạo layout chính (Header, Footer, Container)
5. Tạo `AuthContext` hoặc `useAuth` hook để quản lý đăng nhập
6. Tạo service gọi API từ NestJS
7. Tạo các component: ProductCard, CartItem, OrderRow, etc.
8. Giao tiếp đầy đủ với API backend
9. Tự động sửa lỗi nếu gặp khi `npm run dev`
10. Khi hoàn tất hiện thông báo ✅ Giao diện đã sẵn sàng

## UI
- Ưu tiên Tailwind đơn giản, responsive
- Nếu có thể, tạo thêm file `theme.js` để quản lý style

## Swagger API backend
- API có sẵn tại: http://localhost:3000/api

## Hoàn thành khi
- Có thể truy cập từng trang và xem dữ liệu từ API
- Không có lỗi khi chạy
- Giao diện đẹp, gọn, dễ mở rộng
