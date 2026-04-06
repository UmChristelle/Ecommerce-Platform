import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, ClipboardList, CreditCard, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createOrder, getMyOrders } from "../api/orders";
import { getCart } from "../api/cart";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { checkoutSchema, type CheckoutFormData } from "../utils/validators";
import { getErrorMessage } from "../utils/errors";

const PAYMENT_METHODS = ["CREDIT_CARD", "PAYPAL", "MOBILE_MONEY", "CASH_ON_DELIVERY"] as const;
const STEPS = ["Shipping", "Payment", "Review"];

const Checkout = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cart } = useQuery({ queryKey: ["cart"], queryFn: getCart });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    trigger,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    reValidateMode: "onBlur",
    defaultValues: { paymentMethod: "CASH_ON_DELIVERY" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CheckoutFormData) => createOrder(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      await queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      await queryClient.prefetchQuery({ queryKey: ["myOrders"], queryFn: getMyOrders });
      toast.success("Order placed successfully!");
      navigate("/profile");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Order failed")),
  });

  const nextStep = async () => {
    const fields: Record<number, (keyof CheckoutFormData)[]> = {
      0: ["fullName", "shippingAddress", "city", "postalCode", "phoneNumber", "email"],
      1: ["paymentMethod"],
    };

    const valid = await trigger(fields[step] ?? []);
    if (valid) setStep((current) => current + 1);
  };

  const values = useWatch({ control });
  const items = cart?.items ?? [];
  const total = cart?.total ?? items.reduce((sum, item) => sum + item.subtotal, 0);
  const stepIcons = [<MapPin size={16} />, <CreditCard size={16} />, <ClipboardList size={16} />];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 mb-10">
        {STEPS.map((label, index) => (
          <div key={label} className="flex items-center flex-1 w-full">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                index === step
                  ? "bg-primary-600 text-white"
                  : index < step
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {index < step ? <CheckCircle size={14} /> : stepIcons[index]}
              <span className="hidden sm:inline">{label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`hidden sm:block flex-1 h-0.5 mx-2 ${index < step ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit((data) => mutate(data))}>
        {step === 0 && (
          <div className="card space-y-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MapPin size={18} className="text-primary-600" /> Shipping Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" placeholder="John Doe" error={errors.fullName?.message} {...register("fullName")} />
              <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
            </div>
            <Input label="Shipping Address" placeholder="123 Main St" error={errors.shippingAddress?.message} {...register("shippingAddress")} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="City" placeholder="Kigali" error={errors.city?.message} {...register("city")} />
              <Input label="Postal Code" placeholder="00000" error={errors.postalCode?.message} {...register("postalCode")} />
            </div>
            <Input label="Phone Number (10 digits)" placeholder="0712345678" error={errors.phoneNumber?.message} {...register("phoneNumber")} />
          </div>
        )}

        {step === 1 && (
          <div className="card space-y-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CreditCard size={18} className="text-primary-600" /> Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method}
                  className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    values.paymentMethod === method ? "border-primary-600 bg-primary-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input type="radio" value={method} {...register("paymentMethod")} className="accent-primary-600" />
                  <span className="font-medium text-sm text-gray-700">{method.replace(/_/g, " ")}</span>
                </label>
              ))}
            </div>
            {errors.paymentMethod && <p className="text-xs text-red-500">{errors.paymentMethod.message}</p>}
          </div>
        )}

        {step === 2 && (
          <div className="card space-y-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ClipboardList size={18} className="text-primary-600" /> Order Review
            </h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <p><span className="text-gray-500">Name:</span> <strong>{values.fullName}</strong></p>
              <p><span className="text-gray-500">Address:</span> <strong>{values.shippingAddress}, {values.city}</strong></p>
              <p><span className="text-gray-500">Phone:</span> <strong>{values.phoneNumber}</strong></p>
              <p><span className="text-gray-500">Payment:</span> <strong>{values.paymentMethod?.replace(/_/g, " ")}</strong></p>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-600">{item.product.title} x {item.quantity}</span>
                  <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Total</span>
                <span className="text-primary-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6">
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={() => setStep((current) => current - 1)} className="w-full sm:w-auto">
              Back
            </Button>
          ) : <div />}

          {step < 2 ? (
            <Button type="button" onClick={nextStep} className="w-full sm:w-auto">Continue</Button>
          ) : (
            <Button type="submit" isLoading={isPending} size="lg" className="w-full sm:w-auto">Place Order</Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default Checkout;
