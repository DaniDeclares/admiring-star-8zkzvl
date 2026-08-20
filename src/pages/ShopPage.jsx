import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, Printer, ArrowRight, ShieldCheck } from 'lucide-react';
import { getPriceLabel } from '../data/pricingCanon';

export default function ShopPage() {
  const products = [
    { name: "SmartTap™ NFC Business Card", category: "Smart Hardware", priceKey: "nfc", margin: "High-Tech NFC", icon: Sparkles, desc: "Instant contact & profile sharing via NFC tap." },
    { name: "Smart Review Counter Stand", category: "Smart Hardware", priceKey: "review_stand", margin: "NFC + QR", icon: Sparkles, desc: "Direct Google Review capture plaque for retail counters." },
    { name: "Custom Heat-Press DTF Apparel (4-Pack)", category: "Creative Merch", priceKey: "apparel", margin: "Volume Apparel", icon: Printer, desc: "High-grade DTF printed branded tees or event shirts." },
    { name: "Sublimated 20 oz Tumbler (2-Pack)", category: "Creative Merch", priceKey: "tumbler", margin: "Drinkware", icon: Printer, desc: "Double-wall insulated custom branded tumblers." },
    { name: "Express Family Care Snack Box", category: "Market Goods", priceKey: "snack_box", margin: "Curated Box", icon: ShoppingBag, desc: "Premium snack assortment for move-in gifts or event staff." },
    { name: "Business Startup Infrastructure Kit", category: "Business Kits", priceKey: "startup_kit", margin: "Turnkey SOPs", icon: ShieldCheck, desc: "Complete registration binders, corporate seals, and setup." }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-400 font-mono text-sm uppercase tracking-wider">Express Commerce & Smart Hardware</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-2 mb-4">Dani Declares Shop & Catalog</h1>
          <p className="text-slate-300 text-lg">SmartTap™ NFC hardware, custom printed merchandise, care bundles, and business startup kits.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {products.map((p, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">{p.category}</span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">{p.margin}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{p.desc}</p>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-amber-400 mb-4">{getPriceLabel(p.priceKey)}</div>
                <Link to="/request-service" className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-semibold text-sm transition-all">
                  Order Deliverable <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
