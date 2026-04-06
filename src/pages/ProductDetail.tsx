import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProductById } from "../api/products";
import { addToCart } from "../api/cart";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import { ShoppingCart, ArrowLeft, Package } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const queryClient = useQueryClient();
  const [activeImg, setActiveImg] = useState(0);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () => addToCart(id!, 1, product?.variants[0]?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (isError || !product) return <div className="text-center py-20 text-red-500">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <img
            src={product.images[activeImg] ?? "https://placehold.co/600x400?text=No+Image"}
            alt={product.title}
            className="w-full h-80 object-cover rounded-2xl shadow-sm"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=No+Image"; }}
          />
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${activeImg === i ? "border-primary-600" : "border-transparent"}`}
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/64x64?text=Img"; }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">{product.brand}</p>
          <h1 className="text-3xl font-extrabold text-gray-900">{product.title}</h1>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <div className="flex items-center gap-4 py-4 border-y border-gray-100">
            <span className="text-3xl font-bold text-primary-600">${product.price.toFixed(2)}</span>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Package size={14} />
            Category: <span className="font-medium text-gray-700">{product.category?.name}</span>
          </div>

          {isAuthenticated && userRole === "USER" && (
            <Button size="lg" isLoading={isPending} onClick={() => mutate()} disabled={product.stock === 0} className="mt-2 gap-2">
              <ShoppingCart size={18} />
              Add to Cart
            </Button>
          )}
          {!isAuthenticated && (
            <Button size="lg" variant="secondary" onClick={() => navigate("/login")} className="mt-2">
              Login to Purchase
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
