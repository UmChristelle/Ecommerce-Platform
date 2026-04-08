import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { getProducts } from "../api/products";
import { getCategories } from "../api/categories";
import ProductCard from "../components/products/ProductCard";
import Spinner from "../components/ui/Spinner";

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

  const filtered = products.filter((product) => {
    const matchSearch =
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      product.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "all" || product.categoryId === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/80 px-6 py-10 shadow-2xl shadow-slate-950/50 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.24),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(59,130,246,0.18),_transparent_28%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-sm font-medium text-primary-200">
              <Sparkles size={14} />
              Modern storefront experience
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Premium shopping, with a sharper dark experience.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Browse curated products, filter by category, and shop with a cleaner, more polished interface.
            </p>
            <div className="relative mt-8 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products or brands..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 py-3 pl-11 pr-4 text-slate-100 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:max-w-sm lg:justify-self-end">
            {[
              { label: "Products", value: products.length },
              { label: "Categories", value: categories.length },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
        <SlidersHorizontal size={16} className="shrink-0 text-slate-400" />
        <button
          onClick={() => setSelectedCategory("all")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            selectedCategory === "all"
              ? "bg-primary-400 text-slate-950 shadow-lg shadow-primary-500/20"
              : "border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:text-slate-100"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? "bg-primary-400 text-slate-950 shadow-lg shadow-primary-500/20"
                : "border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:text-slate-100"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 py-20 text-center font-medium text-red-300">
          Failed to load products. Please try again.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 py-20 text-center text-slate-400">
          No products found.
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-400">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
