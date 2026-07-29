import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import './ShopPage.css';

const SNACK_COMBOS = [
  { id: 'combo-3', name: '$3.00 Quick Snack Pack', desc: '1 Snack (Frito-Lay/Ritz) + 1 Cold Drink + 1 Sweet Treat (Rice Krispies/Debbie)', price: 3.00, tag: 'Best Seller' },
  { id: 'combo-5-afterschool', name: '$5.00 After-School Box', desc: '5 Items: 2 Savory Snacks + 1 Cold Drink + 1 Sweet Treat + 1 Fruit Snack or Frozen Treat', price: 5.00, tag: 'Popular' },
  { id: 'combo-5-gamer', name: '$5.00 Gamer Pack', desc: '2 Chip/Savory Snacks (Takis/Hot Chips) + 1 Gatorade + 1 Full-Size Candy + 1 Frozen Treat', price: 5.00, tag: 'Gamer Pack' },
  { id: 'combo-5-sweetsalty', name: '$5.00 Sweet & Salty Box', desc: '1 Savory Snack + 2 Sweet Treats + 1 Cold Drink + 1 Fruit Snack or Frozen Treat', price: 5.00, tag: 'Variety Box' },
  { id: 'combo-10-movie', name: '$10.00 Family Movie Night', desc: '12 Items: 4 Snacks + 4 Cold Drinks + 4 Sweet Treats (Mix & Match)', price: 10.00, tag: 'Family Combo' },
  { id: 'combo-15-family', name: '$15.00 Family Snack Run', desc: '16 Items: 6 Snacks + 5 Cold Drinks + 5 Treats', price: 15.00, tag: 'Mega Bundle' }
];

const MERCH_PRODUCTS = [
  {
    id: "cheaper-to-keep-dad-mug",
    name: "Cheaper to Keep Dad Mug",
    price: 14.99,
    desc: "Classic white ceramic mug. Bold graphic in deep green. Dishwasher & microwave safe. 11oz.",
    image: "/images/products/cheaper-to-keep-dad-mug/13417731404300332877_2048.jpg",
  },
  {
    id: "signed-sealed-dadlivered-glass-mug",
    name: "Signed. Sealed. Dad-livered. Glass Mug",
    price: 17.99,
    desc: "Crystal clear glass mug with 'Signed. Sealed. Dad-livered.' print.",
    image: "/images/products/signed-sealed-dadlivered-glass-mug/13417731404300332877_2048_800.jpg",
  },
  {
    id: "license-to-dad-mug",
    name: "License to Dad Mug",
    price: 14.99,
    desc: "Ceramic mug featuring gold 'License to Dad' design.",
    image: "/images/products/license-to-dad-mug/13673897199289775117_2048_800.jpg",
  },
  {
    id: "license-to-dad-beach-towel",
    name: "License to Dad Beach Towel",
    price: 34.99,
    desc: "Soft, oversized towel with gold shades and 'License to Dad' print.",
    image: "/images/products/license-to-dad-beach-towel/10363092619905953242_2048.jpg",
  },
  {
    id: "official-dad-documents-tote-bag",
    name: "Official Dad Documents Tote Bag",
    price: 19.99,
    desc: "Eco-friendly, sturdy canvas tote bag printed with 'Official Dad Documents Only.'",
    image: "/images/products/official-dad-documents-tote-bag/11901353032387740085_2048_800x800.jpg",
  },
  {
    id: "dad-documents-laptop-sleeve",
    name: "Dad Documents Laptop Sleeve",
    price: 24.99,
    desc: "Protective sleeve for laptops with 'Dad Documents' design.",
    image: "/images/products/dad-documents-laptop-sleeve/11010138353168134045_2048_800x800.jpg",
  },
  {
    id: "declare-your-worth-tee",
    name: "Inspirational T-shirt: Declare Your Worth",
    price: 24.99,
    desc: "'Declare Your Worth' empowerment tee in 100% combed cotton.",
    image: "/images/products/declare-your-worth-tee/11901353032387740085_2048_800x800.jpg",
  },
  {
    id: "declare-your-worth-ebook",
    name: "Declare Your Worth – eBook (Digital Download)",
    price: 9.99,
    desc: "Empowerment guide for entrepreneurs and creatives. PDF format, instant access.",
    image: "/images/products/declare-your-worth-ebook.png",
  }
];

export default function ShopPage() {
  const [activeTab, setActiveTab] = useState('snacks');
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <main className="shop-page">
      <Helmet>
        <title>Express Goods &amp; Merchandise Shop • Dani Declares LLC</title>
        <meta
          name="description"
          content="Shop local on-demand snack packs, combo boxes, custom t-shirts, branded mugs, and digital entrepreneur tools from Dani Declares LLC."
        />
      </Helmet>

      {/* Hero Banner */}
      <section className="shop-hero" style={{ backgroundColor: '#8B1E2E', color: '#fff', padding: '60px 20px', textAlign: 'center', borderBottom: '5px solid #D4AF37' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ backgroundColor: '#D4AF37', color: '#111', padding: '4px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block', marginBottom: '16px' }}>
            Marketplace &amp; Local On-Demand
          </span>
          <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 16px 0' }}>Shop Dani Declares</h1>
          <p style={{ fontSize: '17px', opacity: 0.95, lineHeight: '1.6' }}>
            Local doorstep snack delivery, branded apparel, tumblers, and digital tools designed to help you execute and Declare Your Worth.
          </p>
          <div style={{ marginTop: '16px', fontSize: '15px' }}>
            Call/Text Order Line: <a href="tel:4704857173" style={{ color: '#D4AF37', fontWeight: 'bold' }}>(470) 485-7173</a>
          </div>
        </div>
      </section>

      {/* Mode Switcher Tabs */}
      <section style={{ padding: '30px 20px 0 20px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', gap: '10px', backgroundColor: '#E5E0DA', padding: '6px', borderRadius: '30px' }}>
          <button
            onClick={() => setActiveTab('snacks')}
            style={{
              backgroundColor: activeTab === 'snacks' ? '#8B1E2E' : 'transparent',
              color: activeTab === 'snacks' ? '#fff' : '#111',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '20px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Local Snack Combos &amp; Packs
          </button>
          <button
            onClick={() => setActiveTab('merch')}
            style={{
              backgroundColor: activeTab === 'merch' ? '#8B1E2E' : 'transparent',
              color: activeTab === 'merch' ? '#fff' : '#111',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '20px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Apparel, Merch &amp; Digital Tools
          </button>
        </div>
      </section>

      {/* Product Display Section */}
      <section style={{ padding: '40px 20px 60px 20px', maxWidth: '1150px', margin: '0 auto' }}>
        {activeTab === 'snacks' ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '26px', color: '#8B1E2E', margin: '0 0 8px 0' }}>Dani Declares Express &amp; Goods Menu</h2>
              <p style={{ color: '#555', fontSize: '15px' }}>On-demand doorstep delivery across local service area. Call or text to order instantly!</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {SNACK_COMBOS.map((product) => (
                <div key={product.id} style={{ backgroundColor: '#fff', border: '1px solid #E5E0DA', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ backgroundColor: '#F8F5F1', color: '#8B1E2E', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', border: '1px solid #D4AF37' }}>
                      {product.tag}
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#111' }}>${product.price.toFixed(2)}</span>
                  </div>
                  <h3 style={{ fontSize: '20px', color: '#8B1E2E', margin: '0 0 10px 0', fontWeight: '700' }}>{product.name}</h3>
                  <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px', flexGrow: 1 }}>{product.desc}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => addToCart(product)}
                      style={{ flex: 1, backgroundColor: '#8B1E2E', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Add to Order
                    </button>
                    <a
                      href={`tel:4704857173?text=I want to order ${encodeURIComponent(product.name)}`}
                      style={{ backgroundColor: '#D4AF37', color: '#111', textDecoration: 'none', padding: '10px 14px', borderRadius: '4px', fontWeight: '700', fontSize: '14px', textAlign: 'center' }}
                    >
                      Text Order
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {MERCH_PRODUCTS.map((product) => (
              <div key={product.id} style={{ backgroundColor: '#fff', border: '1px solid #E5E0DA', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '200px', backgroundColor: '#FAF7F4', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/images/stock/Clipboards.jpg'; }}
                  />
                </div>
                <h3 style={{ fontSize: '18px', color: '#111', margin: '0 0 8px 0', fontWeight: '700' }}>{product.name}</h3>
                <p style={{ color: '#555', fontSize: '13px', lineHeight: '1.4', marginBottom: '16px', flexGrow: 1 }}>{product.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#8B1E2E' }}>${product.price.toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(product)}
                    style={{ backgroundColor: '#8B1E2E', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Quick Cart Drawer */}
        {cart.length > 0 && (
          <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#111', color: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 6px 20px rgba(0,0,0,0.3)', zIndex: 1000, maxWidth: '340px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#D4AF37', fontSize: '16px' }}>Order Selection ({cart.length})</h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '18px', fontWeight: '800' }}>Total: ${cartTotal.toFixed(2)}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href={`tel:4704857173?text=Order Checkout ($${cartTotal.toFixed(2)}): ${encodeURIComponent(cart.map(i => i.name || i.title).join(', '))}`}
                style={{ flex: 1, backgroundColor: '#D4AF37', color: '#111', textDecoration: 'none', padding: '10px', borderRadius: '4px', fontWeight: '700', textAlign: 'center', fontSize: '14px' }}
              >
                Text Order to Dispatch
              </a>
              <button onClick={() => setCart([])} style={{ backgroundColor: '#444', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>Clear</button>
            </div>
          </div>
        )}
      </section>

      {/* Support Strip */}
      <section className="contact-info" style={{ backgroundColor: '#F8F5F1', padding: '30px 20px', textAlign: 'center', borderTop: '1px solid #E5E0DA' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#8B1E2E' }}>Need Assistance or Custom Orders?</h3>
        <p style={{ margin: 0, color: '#555', fontSize: '15px' }}>
          Call or text dispatch directly at <strong>(470) 485-7173</strong> or email <a href="mailto:admin@danideclares.com" style={{ color: '#8B1E2E' }}>admin@danideclares.com</a>.
        </p>
      </section>
    </main>
  );
}
