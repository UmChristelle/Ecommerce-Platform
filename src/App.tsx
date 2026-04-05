import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import UserRoute from "./routes/UserRoute";
import AdminRoute from "./routes/AdminRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Dashboard from "./pages/admin/Dashboard";
import ProductForm from "./pages/admin/ProductForm";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products/:id" element={<ProductDetail />} />

                {/* User Protected */}
                <Route element={<UserRoute />}>
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Admin Protected */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<Dashboard />} />
                  <Route path="/admin/product/new" element={<ProductForm />} />
                  <Route path="/admin/product/:id/edit" element={<ProductForm />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                    <h1 className="text-7xl font-black text-gray-200 mb-4">404</h1>
                    <p className="text-xl font-semibold text-gray-700 mb-2">Page not found</p>
                    <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: "12px", fontWeight: 500 } }} />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;