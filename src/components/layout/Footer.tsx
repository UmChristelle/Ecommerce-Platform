import { Package } from "lucide-react";

const Footer = () => (
  <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
        <div className="flex items-center gap-2 text-lg font-bold text-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-300 ring-1 ring-primary-500/20">
            <Package size={18} />
          </div>
          E-Comus
        </div>
        <p className="text-sm text-slate-400">Copyright {new Date().getFullYear()} E-Comus. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
