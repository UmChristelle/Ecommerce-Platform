import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { getCart, replaceCart } from "../api/cart";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import { getErrorMessage } from "../utils/errors";

const Cart = () => {
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  const { mutateAsync: rewriteCart, isPending: isUpdatingCart } = useMutation({
    mutationFn: replaceCart,
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["cart"], updatedCart);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Failed to update cart")),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const items = cart?.items ?? [];
  const total = cart?.total ?? items.reduce((sum, item) => sum + item.subtotal, 0);

  const syncItems = async (nextItems: typeof items, fallbackMessage: string) => {
    const previousCart = cart;
    const optimisticCart = previousCart
      ? {
          ...previousCart,
          items: nextItems.map((item) => ({
            ...item,
            subtotal: item.unitPrice * item.quantity,
          })),
          total: nextItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
          itemCount: nextItems.reduce((sum, item) => sum + item.quantity, 0),
        }
      : previousCart;

    if (optimisticCart) {
      queryClient.setQueryData(["cart"], optimisticCart);
    }

    const replacementItems = nextItems
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        variantId: item.variantId,
      }))
      .filter((item) => item.productId && item.quantity > 0);

    try {
      await rewriteCart(replacementItems);
    } catch (error) {
      if (previousCart) {
        queryClient.setQueryData(["cart"], previousCart);
      }
      toast.error(getErrorMessage(error, fallbackMessage));
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-slate-800 bg-slate-900/80">
          <ShoppingBag size={34} className="text-slate-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">Your cart is empty</h2>
        <p className="mb-6 text-slate-400">Browse our store and add some products.</p>
        <Link to="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Shopping Cart</h1>
        <p className="mt-2 text-slate-400">Review your items, adjust quantities, and continue to checkout.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-800 bg-slate-900/75 p-4 shadow-xl shadow-slate-950/20 sm:flex-row"
            >
              <img
                src={item.product.images[0] ?? "https://placehold.co/96x96?text=Img"}
                alt={item.product.title}
                className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/96x96?text=Img";
                }}
              />

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-white">{item.product.title}</h3>
                <p className="text-sm text-slate-400">{item.product.brand || item.product.category?.name || "Product"}</p>
                <p className="mt-1 font-bold text-primary-300">${item.unitPrice.toFixed(2)}</p>

                {item.variant && (
                  <p className="mt-1 text-xs text-slate-500">
                    {item.variant.color ?? "Variant"}
                    {item.variant.size ? ` / ${item.variant.size}` : ""}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void syncItems(
                        items.map((cartItem) =>
                          cartItem.id === item.id
                            ? { ...cartItem, quantity: Math.max(1, cartItem.quantity - 1) }
                            : cartItem
                        ),
                        "Failed to reduce cart quantity"
                      )
                    }
                    disabled={isUpdatingCart}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold text-slate-100">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      void syncItems(
                        items.map((cartItem) =>
                          cartItem.id === item.id
                            ? { ...cartItem, quantity: cartItem.quantity + 1 }
                            : cartItem
                        ),
                        "Failed to increase cart quantity"
                      )
                    }
                    disabled={isUpdatingCart}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-3 text-left sm:block sm:text-right">
                <p className="font-bold text-white">${item.subtotal.toFixed(2)}</p>
                <button
                  type="button"
                  onClick={() =>
                    void syncItems(
                      items.filter((cartItem) => cartItem.id !== item.id),
                      "Failed to remove item from cart"
                    )
                  }
                  disabled={isUpdatingCart}
                  className="mt-2 rounded-xl p-2 text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30 lg:sticky lg:top-24">
            <h2 className="mb-4 text-lg font-bold text-white">Order Summary</h2>
            <div className="space-y-3 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 text-slate-400">
                  <span className="truncate">
                    {item.product.title} x {item.quantity}
                  </span>
                  <span className="shrink-0 text-slate-200">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-between border-t border-slate-800 pt-4 text-lg font-bold">
              <span className="text-slate-200">Total</span>
              <span className="text-primary-300">${total.toFixed(2)}</span>
            </div>

            <Link to="/checkout">
              <Button className="mt-5 w-full gap-2" size="lg">
                Proceed to Checkout <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
