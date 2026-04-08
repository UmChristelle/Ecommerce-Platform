import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { loginSchema, type LoginFormData } from "../utils/validators";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { getErrorMessage } from "../utils/errors";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const role = await login(data.email, data.password);
      navigate(role === "ADMIN" ? "/admin" : "/", { replace: true });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Invalid credentials"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/40 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden overflow-hidden border-r border-slate-800 bg-slate-950/80 p-10 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(14,165,233,0.14),_transparent_24%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-2 text-sm text-primary-200">
                <Package size={16} />
                E-Comus access portal
              </div>
              <h1 className="max-w-md text-4xl font-extrabold leading-tight text-white">
                Sign in to manage your store or continue shopping.
              </h1>
              <p className="mt-4 max-w-md leading-7 text-slate-400">
                Your admin and customer experience now shares the same polished dark interface across the storefront.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/80 p-6">
              <div className="mb-3 flex items-center gap-2 text-primary-200">
                <ShieldCheck size={18} />
                <span className="font-semibold">Admin demo</span>
              </div>
              <p className="text-sm text-slate-300">Email: admin@admin.com</p>
              <p className="mt-1 text-sm text-slate-300">Password: admin123</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-500/15 text-primary-300 ring-1 ring-primary-500/20">
                <Package size={30} />
              </div>
              <h2 className="text-3xl font-extrabold text-white">Welcome back</h2>
              <p className="mt-2 text-slate-400">Sign in to your account</p>
            </div>

            <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200 lg:hidden">
              <strong>Admin Demo:</strong> admin@admin.com / admin123
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />

              <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-primary-300 hover:text-primary-200">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
