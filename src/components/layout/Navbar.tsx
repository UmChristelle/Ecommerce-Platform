import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LayoutDashboard, Menu, X, LogOut, Package } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getCart } from "../../api/cart";

const Navbar = () => {
  const { isAuthenticated, userRole, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: isAuthenticated && userRole === "USER",
  });

  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <Package size={24} />
            <span>E-Comus</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Store
            </Link>

            {isAuthenticated && userRole === "ADMIN" && (
              <Link to="/admin" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 font-medium transition-colors">
                <LayoutDashboard size={16} />
                Admin Dashboard
              </Link>
            )}

            {isAuthenticated && userRole === "USER" && (
              <>
                <Link to="/cart" className="relative flex items-center gap-1.5 text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  <ShoppingCart size={18} />
                  My Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  <User size={16} />
                  Profile
                </Link>
              </>
            )}

            {!isAuthenticated && (
              <Link to="/login" className="btn-primary text-sm px-4 py-2 rounded-lg">
                Login
              </Link>
            )}

            {isAuthenticated && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 hidden lg:block">Hi, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 font-medium transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 shadow-lg">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 font-medium hover:text-primary-600">Store</Link>

          {isAuthenticated && userRole === "ADMIN" && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-gray-700 font-medium hover:text-primary-600">
              <LayoutDashboard size={16} /> Admin Dashboard
            </Link>
          )}

          {isAuthenticated && userRole === "USER" && (
            <>
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-gray-700 font-medium hover:text-primary-600">
                <ShoppingCart size={16} /> My Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-gray-700 font-medium hover:text-primary-600">
                <User size={16} /> Profile
              </Link>
            </>
          )}

          {!isAuthenticated ? (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-primary-600 font-semibold">Login</Link>
          ) : (
            <button onClick={handleLogout} className="flex items-center gap-2 py-2 text-red-500 font-medium w-full">
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;