import { Package } from "lucide-react";

const Footer = () => (
  <footer className="bg-white border-t border-gray-200 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-bold text-lg text-primary-600">
          <Package size={20} />
          E-Comus
        </div>
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} E-Comus. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;