import type { ButtonHTMLAttributes, ReactNode } from "react";
import Spinner from "./Spinner";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: ReactNode;
}

const variants = {
  primary: "bg-primary-500 hover:bg-primary-400 text-slate-950 shadow-lg shadow-primary-500/20",
  secondary: "bg-slate-900/80 hover:bg-slate-800 text-slate-100 border border-slate-700/80",
  danger: "bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20",
  ghost: "hover:bg-slate-800 text-slate-200",
};
const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

const Button = ({ variant = "primary", size = "md", isLoading, children, className, disabled, ...props }: Props) => (
  <button
    className={clsx(
      "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
      variants[variant],
      sizes[size],
      className
    )}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading && <Spinner size="sm" color="border-white" />}
    {children}
  </button>
);

export default Button;
