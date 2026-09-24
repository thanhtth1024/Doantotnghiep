import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";

// 404 Page
import NotFound from "./pages/NotFound";
import { useAuthStore } from "./store/auth";

const CustomerRoute = ({ children }) => {
  const { user } = useAuthStore();
  return user?.role === "admin" ? <Navigate to="/admin" replace /> : children;
};

const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  return isAuthenticated && user?.role === "admin"
    ? <Admin />
    : <Navigate to="/admin/login" replace />;
};

const CustomerAuthRoute = ({ children }) => {
  const { user } = useAuthStore();
  return user?.role === "admin" ? <Navigate to="/admin" replace /> : children;
};

const AdminLoginRoute = () => {
  const { user } = useAuthStore();
  return user?.role === "admin" ? <Navigate to="/admin" replace /> : <Navigate to="/login?role=admin" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main Layout Routes */}
          <Route path="/" element={<CustomerRoute><MainLayout /></CustomerRoute>}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="categories" element={<Categories />} />
            <Route
              path="categories/:categoryId"
              element={<CategoryProducts />}
            />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin has a separate layout and cannot use customer pages. */}
          <Route path="admin/*" element={<AdminRoute />} />

          {/* Auth Routes (without main layout) */}
          <Route path="login" element={<CustomerAuthRoute><Login /></CustomerAuthRoute>} />
          <Route path="admin/login" element={<AdminLoginRoute />} />
          <Route path="register" element={<CustomerAuthRoute><Register /></CustomerAuthRoute>} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
