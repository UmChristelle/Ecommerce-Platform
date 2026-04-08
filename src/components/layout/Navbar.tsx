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
    <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 shadow-lg shadow-black/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-300 ring-1 ring-primary-500/20">
              <Package size={22} />
            </div>
            <span>E-Comus</span>
          </Link>

          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            <Link to="/" className="font-medium text-slate-300 transition-colors hover:text-primary-300">
              Store
            </Link>

            {isAuthenticated && userRole === "ADMIN" && (
              <Link to="/admin" className="flex items-center gap-1.5 font-medium text-slate-300 transition-colors hover:text-primary-300">
                <LayoutDashboard size={16} />
                Admin Dashboard
              </Link>
            )}

            {isAuthenticated && userRole === "USER" && (
              <>
                <Link to="/cart" className="relative flex items-center gap-1.5 font-medium text-slate-300 transition-colors hover:text-primary-300">
                  <ShoppingCart size={18} />
                  My Cart
                  {cartCount > 0 && (
                    <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-400 text-xs font-bold text-slate-950">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center gap-1.5 font-medium text-slate-300 transition-colors hover:text-primary-300">
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
                <span className="hidden max-w-32 truncate text-sm text-slate-400 xl:block">Hi, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 font-medium text-slate-300 transition-colors hover:text-red-300"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-slate-800 lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="space-y-3 border-t border-slate-800 bg-slate-950/95 px-4 py-4 shadow-lg lg:hidden">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block py-2 font-medium text-slate-200 hover:text-primary-300">Store</Link>

          {isAuthenticated && userRole === "ADMIN" && (
            <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 font-medium text-slate-200 hover:text-primary-300">
              <LayoutDashboard size={16} /> Admin Dashboard
            </Link>
          )}

          {isAuthenticated && userRole === "USER" && (
            <>
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 font-medium text-slate-200 hover:text-primary-300">
                <ShoppingCart size={16} /> My Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 font-medium text-slate-200 hover:text-primary-300">
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
