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
  primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-sm",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300",
  danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm",
  ghost: "hover:bg-gray-100 text-gray-700",
};
const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
};

const Button = ({ variant = "primary", size = "md", isLoading, children, className, disabled, ...props }: Props) => (
  <button
    className={clsx(
      "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
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