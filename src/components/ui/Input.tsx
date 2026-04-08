import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-slate-200">{label}</label>}
    <input
      ref={ref}
      className={clsx(
        "input-field",
        error && "input-error border-red-500 focus:ring-red-500",
        className
      )}
      {...props}
    />
    {error && <p className="mt-0.5 text-xs text-red-400">{error}</p>}
  </div>
));

Input.displayName = "Input";
export default Input;
