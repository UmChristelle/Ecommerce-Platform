import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Package, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { getProductById } from "../api/products";
import { addToCart } from "../api/cart";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import { getErrorMessage } from "../utils/errors";

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

  const selectedVariant = product?.variants.find((variant) => variant.stock > 0) ?? product?.variants[0];

  const { mutate, isPending } = useMutation({
    mutationFn: () => addToCart(id!, 1, selectedVariant?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Failed to add to cart")),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !product) {
    return <div className="py-20 text-center text-red-300">Product not found.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-slate-400 transition-colors hover:text-slate-100"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid gap-8 rounded-[2rem] border border-slate-800 bg-slate-900/75 p-6 shadow-2xl shadow-slate-950/40 lg:grid-cols-2 lg:gap-10 lg:p-8">
        <div>
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950/70">
            <img
              src={product.images[activeImg] ?? "https://placehold.co/600x400?text=No+Image"}
              alt={product.title}
              className="h-80 w-full object-cover lg:h-[30rem]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=No+Image";
              }}
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.title} preview ${index + 1}`}
                  onClick={() => setActiveImg(index)}
                  className={`h-20 w-20 cursor-pointer rounded-2xl border-2 object-cover transition-all ${
                    activeImg === index ? "border-primary-400" : "border-slate-800"
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/80x80?text=Img";
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{product.brand || "Brand"}</p>
          <h1 className="text-3xl font-extrabold text-white lg:text-4xl">{product.title}</h1>
          <p className="leading-7 text-slate-300">{product.description}</p>

          <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-950/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-3xl font-extrabold text-primary-300">${product.price.toFixed(2)}</span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                product.stock > 0
                  ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20"
                  : "bg-red-500/15 text-red-300 ring-1 ring-red-500/20"
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Package size={14} />
            Category: <span className="font-medium text-slate-200">{product.category?.name || "Uncategorized"}</span>
          </div>

          {isAuthenticated && userRole === "USER" && (
            <Button
              size="lg"
              isLoading={isPending}
              onClick={() => mutate()}
              disabled={product.stock === 0}
              className="mt-2 gap-2"
            >
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
