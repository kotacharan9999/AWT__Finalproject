import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Zap, ArrowRight } from 'lucide-react';
import SafeImage from '../Components/SafeImage';

const FEATURE_CATEGORIES = [
  { label: 'Electronics', emoji: '💻', link: '/products?category=Electronics & Gadgets', color: '#1e3a5f' },
  { label: 'Fashion', emoji: '👗', link: '/products?category=Ladies Corner', color: '#6d1436' },
  { label: 'Home', emoji: '🛋️', link: '/products?category=Home & Furniture', color: '#2d3748' },
  { label: 'Beauty', emoji: '💄', link: '/products?category=Beauty & Personal Care', color: '#5b1e4f' },
  { label: 'Sports', emoji: '🏋️', link: '/products?category=Lifestyle & Hobbies', color: '#1a3a2a' },
  { label: 'Grocery', emoji: '🛒', link: '/products?category=Grocery', color: '#1a3629' },
];

// Countdown hook — resets every 24 hours
const useCountdown = () => {
  const getEndTime = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 0);
    return end;
  };
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, getEndTime() - new Date());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000)
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
};

const CountdownBox = ({ value, unit }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', borderRadius: '10px', padding: '10px 14px', minWidth: '52px', fontFamily: "'Outfit',sans-serif", fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
      {String(value).padStart(2, '0')}
    </div>
    <div style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '5px' }}>{unit}</div>
  </div>
);

const ProductCard = ({ product, addToCart, toggleWishlist, wishlist, navigate }) => {
  const wished = wishlist?.some(w => w.id === product.id);
  const discount = Math.floor(Math.random() * 25) + 10;
  const mrp = Math.round(product.price * (1 + discount / 100));
  return (
    <div className="hover-card" onClick={() => navigate(`/product/${product.id}`)}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}>
      <div style={{ position: 'relative', height: '220px', padding: '24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)' }}>
        <SafeImage src={product.image} alt={product.name} productId={product.id}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        <button onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
          style={{ position: 'absolute', top: '12px', right: '12px', width: '34px', height: '34px', borderRadius: '50%', background: '#fff', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
          <Heart size={16} fill={wished ? 'var(--accent)' : 'none'} color={wished ? 'var(--accent)' : 'var(--text-3)'} />
        </button>
        <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--accent)', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>
          {discount}% OFF
        </span>
      </div>
      <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>{product.brand}</div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-1)', lineHeight: 1.4, marginBottom: '10px', height: '36px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {product.name}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#16a34a', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', fontWeight: '800', width: 'fit-content', marginBottom: '8px' }}>
          {product.rating} <Star size={9} fill="#fff" color="#fff" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '17px', fontWeight: '900', color: 'var(--text-1)' }}>₹{product.price?.toLocaleString('en-IN')}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-3)', textDecoration: 'line-through' }}>₹{mrp.toLocaleString('en-IN')}</span>
        </div>
        <button onClick={e => { e.stopPropagation(); addToCart(product); }}
          className="btn-gradient" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', padding: '10px' }}>
          <ShoppingCart size={14} /> Add to Cart
        </button>
      </div>
    </div>
  );
};

const Home = ({ addToCart, toggleWishlist, wishlist = [] }) => {
  const navigate = useNavigate();
  const countdown = useCountdown();
  const [allProducts, setAllProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const dealScrollRef = useRef(null);

  useEffect(() => {
    fetch('/api/products?limit=300')
      .then(r => r.json())
      .then(data => {
        const prods = data.products || [];
        setAllProducts(prods);
        // Pick 8 random-ish "deals" — sorted by highest price for max impact
        setDealProducts([...prods].sort((a, b) => b.price - a.price).slice(0, 8));
      })
      .catch(console.error);
  }, []);

  const trendingProducts = allProducts.slice(0, 4);
  const newArrivals = allProducts.slice(4, 10);

  const scroll = (dir) => {
    if (dealScrollRef.current) {
      dealScrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page-wrap">
      <div className="inner">

        {/* ── HERO ── */}
        <div className="hero-grid-container">
          <div className="hero-text-side">
            <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--accent)', marginBottom: '20px' }}>Curated for you</div>
            <h1 style={{ fontSize: 'clamp(3rem, 4.8vw, 4.6rem)', lineHeight: 1.02, fontWeight: '900', marginBottom: '26px', color: 'var(--text-1)' }}>
              Shop the essentials <br />crafted for modern living.
            </h1>
            <p style={{ maxWidth: '580px', color: 'var(--text-2)', fontSize: '1rem', lineHeight: 1.78, marginBottom: '34px' }}>
              Discover premium products across fashion, electronics, home, and beauty. Whether it's work, leisure or everyday style, find everything your lifestyle needs in one place.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ padding: '14px 32px', minWidth: '165px' }} onClick={() => navigate('/products')}>Shop Now</button>
              <button className="btn-outline" style={{ padding: '14px 32px', minWidth: '165px' }} onClick={() => navigate('/products?category=Electronics & Gadgets')}>Browse Deals</button>
            </div>
            <div className="hero-features-grid">
              {[
                { title: 'Fast Delivery', desc: '2-day express shipping' },
                { title: 'Trusted Brands', desc: 'Quality curated by experts' },
                { title: 'Secure Checkout', desc: 'Safe payments every time' },
              ].map(f => (
                <div key={f.title} style={{ background: 'var(--bg-card)', borderRadius: '18px', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{f.title}</div>
                  <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-1)' }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-image-side">
            <div className="hero-visual-card">
              <div style={{ textAlign: 'center', padding: '40px', position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '60px', marginBottom: '16px' }}>🛍️</div>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '42px', fontWeight: '900', color: '#fff', fontStyle: 'italic', letterSpacing: '-1px' }}>
                  Shop<span style={{ color: '#f0b429' }}>Plus</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginTop: '12px', lineHeight: 1.6 }}>
                  India's most trusted<br />premium marketplace
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                  {['📱', '👗', '🛋️', '💄'].map((e, i) => (
                    <div key={i} style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{e}</div>
                  ))}
                </div>
              </div>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ position: 'absolute', bottom: '-60px', left: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(240,180,41,0.1)' }} />
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(255,85,51,0.9), rgba(251,100,27,0.9))', borderRadius: '24px', padding: '28px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0.9, marginBottom: '6px' }}>🔥 Hot Deal</div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '900', lineHeight: 1.1 }}>Up to 70% Off on Electronics</h2>
              </div>
              <button onClick={() => navigate('/products?category=Electronics & Gadgets')} className="btn-outline" style={{ background: '#fff', color: 'var(--accent)', flexShrink: 0, borderColor: '#fff' }}>
                Shop Now
              </button>
            </div>
          </div>
        </div>

        {/* ── CATEGORY TILES ── */}
        <div style={{ marginTop: '56px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '0.18em' }}>Shop by category</div>
              <h2 className="text-h2" style={{ marginTop: '8px' }}>Find everything you need</h2>
            </div>
            <button className="btn-outline" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/products')}>
              Browse all <ArrowRight size={14} />
            </button>
          </div>
          <div className="horizontal-scroll-mobile categories-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
            {FEATURE_CATEGORIES.map(cat => (
              <div key={cat.label} onClick={() => navigate(cat.link)}
                style={{ background: cat.color, padding: '24px 16px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: 'var(--shadow-md)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{cat.emoji}</div>
                <div style={{ fontWeight: '800', fontSize: '13px', color: '#fff', textAlign: 'center' }}>{cat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DEALS OF THE DAY ── */}
        <div style={{ marginTop: '60px' }}>
          <div style={{ background: 'linear-gradient(135deg, #1a1d2e 0%, #2d3a8c 100%)', borderRadius: '24px', padding: '28px 32px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <Zap size={20} color="#f0b429" />
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#f0b429' }}>Deals of the Day</span>
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', margin: 0 }}>Today's Best Prices</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>Ends in</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CountdownBox value={countdown.h} unit="Hrs" />
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '22px', fontWeight: '900', marginBottom: '18px' }}>:</span>
                  <CountdownBox value={countdown.m} unit="Min" />
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '22px', fontWeight: '900', marginBottom: '18px' }}>:</span>
                  <CountdownBox value={countdown.s} unit="Sec" />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => scroll(-1)} style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>←</button>
              <button onClick={() => scroll(1)} style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>→</button>
            </div>
          </div>
          <div ref={dealScrollRef} style={{ display: 'flex', gap: '20px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '8px' }}>
            {(dealProducts.length > 0 ? dealProducts : Array.from({ length: 4 })).map((product, i) => (
              <div key={product?.id || i} style={{ flexShrink: 0, width: '240px' }}>
                {product ? (
                  <ProductCard product={product} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} navigate={navigate} />
                ) : (
                  <div className="skeleton" style={{ height: '380px', borderRadius: '16px' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── TRENDING SECTION ── */}
        <div style={{ marginTop: '64px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.18em' }}>Top picks</div>
              <h2 className="text-h2" style={{ marginTop: '8px' }}>Trending right now</h2>
            </div>
            <button className="btn-outline" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/products')}>
              See all <ArrowRight size={14} />
            </button>
          </div>
          <div className="horizontal-scroll-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {trendingProducts.length > 0 ? trendingProducts.map(product => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} navigate={navigate} />
            )) : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '380px', borderRadius: '16px' }} />
            ))}
          </div>
        </div>

        {/* ── NEW ARRIVALS ── */}
        <div style={{ marginTop: '64px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '0.18em' }}>Latest drops</div>
              <h2 className="text-h2" style={{ marginTop: '8px' }}>New arrivals</h2>
            </div>
            <button className="btn-outline" style={{ padding: '10px 18px' }} onClick={() => navigate('/products')}>View all</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '20px' }}>
              <div className="hover-card" style={{ borderRadius: '24px', background: 'linear-gradient(180deg, rgba(24,28,51,0.96), rgba(61,90,241,0.88))', color: '#fff', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px', boxShadow: 'var(--shadow-lg)' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0.9 }}>New Release</div>
                  <h3 style={{ marginTop: '16px', fontSize: '2rem', lineHeight: 1.05, fontWeight: '900' }}>TabPro Signature Edition</h3>
                  <p style={{ marginTop: '14px', fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}>Stylish, smart and engineered to move with your routine.</p>
                </div>
                <button className="btn-outline" style={{ width: 'fit-content', background: '#fff', color: 'var(--text-1)', padding: '11px 22px' }} onClick={() => navigate('/products?search=Tablet')}>Explore now</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {newArrivals.slice(0, 2).map(product => (
                  <div key={product.id} className="hover-card" style={{ borderRadius: '20px', background: 'var(--bg-card)', padding: '20px', cursor: 'pointer' }} onClick={() => navigate(`/product/${product.id}`)}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-3)', marginBottom: '8px' }}>{product.brand}</div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-1)', lineHeight: 1.2 }}>{product.name}</div>
                    <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>₹{product.price?.toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', gap: '16px' }}>
              {newArrivals.slice(2, 6).map(product => (
                <div key={product.id} className="hover-card" style={{ borderRadius: '20px', background: 'var(--bg-card)', padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => navigate(`/product/${product.id}`)}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '4px' }}>{product.category}</div>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{product.name}</h4>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '800' }}>₹{product.price?.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', marginTop: '4px' }}>Shop →</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TRUST BADGES ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '20px', marginTop: '64px' }}>
          {[
            { icon: '🚚', title: 'Free Shipping', desc: 'On all orders ₹1500 and above.' },
            { icon: '🏆', title: 'Premium Brands', desc: 'Handpicked collections from top suppliers.' },
            { icon: '↩️', title: 'Easy Returns', desc: '60-day no-hassle return policy.' },
            { icon: '🎧', title: '24/7 Support', desc: 'Live help for every purchase.' },
          ].map(b => (
            <div key={b.title} style={{ background: 'var(--bg-card)', borderRadius: '20px', padding: '28px', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '28px', flexShrink: 0 }}>{b.icon}</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-1)' }}>{b.title}</div>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.6, fontSize: '13px', margin: 0 }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
