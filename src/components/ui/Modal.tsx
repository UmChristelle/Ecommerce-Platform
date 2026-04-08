import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children, footer }: Props) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 text-slate-300">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-slate-800 bg-slate-950/50 px-6 py-5">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
