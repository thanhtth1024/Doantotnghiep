import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="text-9xl font-bold text-blue-600 mb-4">404</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Trang không tìm thấy
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại. Có thể nó đã bị di chuyển hoặc xóa.
        </p>
        <div className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4 sm:justify-center">
          <Link
            to="/"
            className="block w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
          >
            Về trang chủ
          </Link>
          <Link
            to="/products"
            className="block w-full sm:w-auto bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
          >
            Xem sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 