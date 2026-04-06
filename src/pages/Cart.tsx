import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { getCart, removeCartItem, updateCartItem } from "../api/cart";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";

const Cart = () => {
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  const { mutate: updateQty } = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: () => toast.error("Failed to update cart"),
  });

  const { mutate: removeItem } = useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: () => toast.error("Failed to remove item"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  const items = cart?.items ?? [];
  const total = cart?.total ?? items.reduce((sum, item) => sum + item.subtotal, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse our store and add some products!</p>
        <Link to="/"><Button>Continue Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
              <img
                src={item.product.images[0] ?? "https://placehold.co/96x96?text=Img"}
                alt={item.product.title}
                className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/96x96?text=Img"; }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{item.product.title}</h3>
                <p className="text-sm text-gray-400">{item.product.brand || item.product.category?.name}</p>
                <p className="text-primary-600 font-bold mt-1">${item.unitPrice.toFixed(2)}</p>
                {item.variant && (
                  <p className="text-xs text-gray-400 mt-1">
                    {item.variant.color ?? "Variant"}
                    {item.variant.size ? ` • ${item.variant.size}` : ""}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQty({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors"
                  >
                    -
                  </button>
                  <span className="font-semibold text-gray-800 w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty({ itemId: item.id, quantity: item.quantity + 1 })}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-gray-900">${item.subtotal.toFixed(2)}</p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-2 p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-600">
                  <span className="truncate mr-2">{item.product.title} x {item.quantity}</span>
                  <span className="shrink-0">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary-600">${total.toFixed(2)}</span>
            </div>
            <Link to="/checkout">
              <Button className="w-full mt-4 gap-2" size="lg">
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
