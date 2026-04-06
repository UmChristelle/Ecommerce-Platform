import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../api/products";
import { getCategories } from "../api/categories";
import ProductCard from "../components/products/ProductCard";
import Spinner from "../components/ui/Spinner";
import { Search, SlidersHorizontal } from "lucide-react";

const Home = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10,
  });

  const filtered = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "all" || p.categoryId === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-6 sm:p-8 lg:p-12 mb-10 text-white text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3">Welcome to E-Comus</h1>
        <p className="text-primary-100 text-base sm:text-lg mb-6">Discover amazing products at unbeatable prices</p>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or brands..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
        <SlidersHorizontal size={16} className="text-gray-500 shrink-0" />
        <button
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === "all" ? "bg-primary-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.id ? "bg-primary-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : isError ? (
        <div className="text-center py-20 text-red-500 font-medium">Failed to load products. Please try again.</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No products found.</div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{filtered.length} product{filtered.length !== 1 ? "s" : ""} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
