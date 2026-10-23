import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';

// Public Shopify product feed: no Admin credentials or checkout secrets in the browser.
// Shopify is the authority for product publication, variants, current prices and inventory.
const STORE = 'https://danideclares.myshopify.com';
const currency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));
const purchasable = (product) => product && product.published_at &&
  Array.isArray(product.variants) && product.variants.some((variant) => variant.available === true);
const productUrl = (product) => `${STORE}/products/${encodeURIComponent(product.handle)}`;

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${STORE}/products.json?limit=250`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Catalog unavailable');
        return response.json();
      })
      .then((result) => {
        if (!Array.isArray(result.products)) throw new Error('Invalid catalog');
        setProducts(result.products.filter((product) => product?.published_at && product?.handle && Array.isArray(product.variants)));
        setError(false);
      })
      .catch((err) => { if (err.name !== 'AbortError') setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const categories = useMemo(() => {
    const types = new Set(products.map((product) => product.product_type || 'Other'));
    return ['all', ...Array.from(types).sort()];
  }, [products]);
  const visible = products.filter((product) => filter === 'all' || (product.product_type || 'Other') === filter);

  return (
    <main className="min-h-screen bg-[#fffaf1] pt-24 pb-20 text-[#302226]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <header className="mb-10 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#a8791c]">DANI DECLARES MARKET • Print • Merchandise • Digital products</p>
          <h1 className="mt-3 text-4xl font-black text-[#5b1624] sm:text-5xl">Shop DANI DECLARES</h1>
          <p className="mt-4 text-lg text-[#6d5b60]">Browse published products with current Shopify prices and photos. Select an item to choose its available options and check out securely in our store.</p>
        </header>
        {loading && <p role="status">Loading current products…</p>}
        {error && <div role="alert" className="rounded-xl border border-[#d2a83f] bg-white p-5">The live product catalog could not be loaded. <a className="font-bold underline" href={STORE} target="_blank" rel="noopener noreferrer">Open our Shopify store</a> to browse products directly.</div>}
        {!loading && !error && <>
          <div className="mb-7 flex flex-wrap gap-2" aria-label="Product categories">
            {categories.map((category) => <button key={category} type="button" aria-pressed={filter === category} onClick={() => setFilter(category)} className={`rounded-full border px-4 py-2 text-sm font-bold ${filter === category ? 'border-[#5b1624] bg-[#5b1624] text-white' : 'border-[#d9cbbf] bg-white text-[#5b1624]'}`}>{category === 'all' ? 'All products' : category}</button>)}
          </div>
          {visible.length === 0 && <p role="status">No published products in this category.</p>}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => {
              const image = product.image?.src || product.images?.[0]?.src;
              const available = purchasable(product);
              const prices = product.variants.map((variant) => Number(variant.price)).filter(Number.isFinite);
              const low = Math.min(...prices);
              const high = Math.max(...prices);
              return <article key={product.id} className="flex overflow-hidden rounded-2xl border border-[#e3d2a8] bg-white shadow-sm flex-col">
                <a href={productUrl(product)} target="_blank" rel="noopener noreferrer" aria-label={`View ${product.title} in Shopify`} className="block aspect-square overflow-hidden bg-[#f6ede7]">
                  {image ? <img src={image} alt={product.image?.alt || product.title} loading="lazy" className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center text-[#6d5b60]"><Package size={48} aria-label="Image unavailable" /></div>}
                </a>
                <div className="flex flex-1 flex-col p-6">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#a8791c]">{product.product_type || 'DANI product'}</p>
                  <h2 className="text-xl font-black text-[#5b1624]">{product.title}</h2>
                  <div className="mt-auto pt-5">
                    <p className="mb-3 font-bold">{prices.length ? `${currency(low)}${low === high ? '' : ` – ${currency(high)}`}` : 'See store for price'}</p>
                    <a href={productUrl(product)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#6b1f2b] px-4 py-3 text-sm font-black text-white">{available ? 'View options & buy' : 'View product in store'} <ArrowRight size={16} /></a>
                  </div>
                </div>
              </article>;
            })}
          </div>
        </>}
        <section className="mt-12 rounded-3xl bg-[#5a1422] p-8 text-white sm:p-10">
          <h2 className="text-2xl font-black">Need custom printing or a business service?</h2>
          <p className="mt-2 text-[#f1e4e6]">Custom quotes, production requests and services continue through our service request process.</p>
          <Link to="/request-service" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#d2a83f] px-6 py-4 font-black text-[#45101b]">Request a custom quote <ArrowRight size={18} /></Link>
        </section>
      </div>
    </main>
  );
}
