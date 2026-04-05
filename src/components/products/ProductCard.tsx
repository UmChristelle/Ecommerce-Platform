import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import type { Product } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "../../api/cart";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import clsx from "clsx";

interface Props { product: Product; }

const ProductCard = ({ product }: Props) => {
  const { isAuthenticated, userRole } = useAuth();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => addToCart(product.id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`${product.title} added to cart!`);
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  const image = product.images?.[0] ?? "https://placehold.co/400x300?text=No+Image";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group flex flex-col">
      <Link to={`/products/${product.id}`} className="overflow-hidden">
        <img
          src={image}
          alt={product.title}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=No+Image"; }}
        />
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{product.brand}</p>
            <Link to={`/products/${product.id}`}>
              <h3 className="font-semibold text-gray-900 leading-snug hover:text-primary-600 transition-colors line-clamp-2">
                {product.title}
              </h3>
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 flex-1">{product.description}</p>

        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
          ))}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xl font-bold text-primary-600">${product.price.toFixed(2)}</span>
          <span className={clsx("text-xs font-medium px-2 py-1 rounded-full", product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        {isAuthenticated && userRole === "USER" && (
          <Button
            size="sm"
            isLoading={isPending}
            onClick={() => mutate()}
            disabled={product.stock === 0}
            className="w-full mt-1 gap-1.5"
          >
            <ShoppingCart size={14} />
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;