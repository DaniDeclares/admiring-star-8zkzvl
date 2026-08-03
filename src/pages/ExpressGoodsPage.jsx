import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function ExpressGoodsPage() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20 text-center">
      <div className="max-w-3xl mx-auto px-4">
        <ShoppingBag className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h1 className="text-4xl font-extrabold text-white mb-4">Express Marketplace & Care Bundles</h1>
        <p className="text-slate-300 text-lg mb-8">Curated snack boxes, event refreshment kits, custom merchandise, and smart NFC displays.</p>
        <Link to="/shop" className="inline-flex items-center px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base transition-all">
          Visit Express Shop <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
