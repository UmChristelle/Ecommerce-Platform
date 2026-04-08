import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import type { Product } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "../../api/cart";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import clsx from "clsx";
import { getErrorMessage } from "../../utils/errors";

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const { isAuthenticated, userRole } = useAuth();
  const queryClient = useQueryClient();
  const defaultVariant = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];

  const { mutate, isPending } = useMutation({
    mutationFn: () => addToCart(product.id, 1, defaultVariant?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`${product.title} added to cart!`);
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Failed to add to cart")),
  });

  const image = product.images[0] ?? "https://placehold.co/400x300?text=No+Image";

  return (
    <div className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/75 shadow-xl shadow-slate-950/30 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl">
      <Link to={`/products/${product.id}`} className="overflow-hidden">
        <img
          src={image}
          alt={product.title}
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=No+Image";
          }}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{product.brand || "Brand"}</p>
            <Link to={`/products/${product.id}`}>
              <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-white transition-colors hover:text-primary-300">
                {product.title}
              </h3>
            </Link>
          </div>
        </div>

        <p className="line-clamp-2 flex-1 text-sm leading-6 text-slate-400">{product.description}</p>

        <div className="flex items-center gap-0.5 text-amber-300">
          {[...Array(5)].map((_, index) => (
            <Star key={index} size={12} className="fill-current" />
          ))}
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-2xl font-extrabold text-primary-300">${product.price.toFixed(2)}</span>
          <span
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-medium",
              product.stock > 0
                ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20"
                : "bg-red-500/15 text-red-300 ring-1 ring-red-500/20"
            )}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        {isAuthenticated && userRole === "USER" && (
          <Button
            size="sm"
            isLoading={isPending}
            onClick={() => mutate()}
            disabled={product.stock === 0}
            className="mt-1 w-full gap-1.5"
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
