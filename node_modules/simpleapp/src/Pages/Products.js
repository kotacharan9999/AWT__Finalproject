import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, ChevronDown, ChevronUp, Star, ShoppingCart, Filter } from 'lucide-react';
import SafeImage from '../Components/SafeImage';

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 – ₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000 – ₹20,000', min: 5000, max: 20000 },
  { label: '₹20,000 – ₹50,000', min: 20000, max: 50000 },
  { label: 'Above ₹50,000', min: 50000, max: Infinity },
];

const RATINGS = [4, 3, 2, 1];

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'price-low', label: 'Price — Low to High' },
  { value: 'price-high', label: 'Price — High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'newest', label: 'Newest First' },
];

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '800', color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
      >
        {title}
        {open ? <ChevronUp size={14} color="var(--text-3)" /> : <ChevronDown size={14} color="var(--text-3)" />}
      </button>
      {open && <div style={{ padding: '0 24px 20px' }}>{children}</div>}
    </div>
  );
};

const Products = ({ addToCart, wishlist, toggleWishlist }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const initialSub = searchParams.get('sub') || '';

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [minRating, setMinRating] = useState(0);
  const [sortOrder, setSortOrder] = useState('popularity');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (initialCategory) params.append('category', initialCategory);
    fetch(`/api/meta/brands?${params}`)
      .then(r => r.json())
      .then(data => setBrands(data))
      .catch(console.error);
  }, [initialCategory]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', 24);
    if (initialCategory) params.append('category', initialCategory);
    if (searchQuery) params.append('search', searchQuery);
    if (initialSub) params.append('sub', initialSub);
    if (sortOrder) params.append('sort', sortOrder);
    if (selectedBrands.length > 0) params.append('brands', selectedBrands.join(','));
    if (selectedPriceRange) {
      params.append('minPrice', selectedPriceRange.min);
      if (selectedPriceRange.max !== Infinity) params.append('maxPrice', selectedPriceRange.max);
    }
    if (minRating > 0) params.append('minRating', minRating);

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (page === 1) setProducts(data.products || []);
      else setProducts(prev => [...prev, ...(data.products || [])]);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalProducts || 0);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page, initialCategory, searchQuery, initialSub, selectedBrands, selectedPriceRange, minRating, sortOrder]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [initialCategory, searchQuery, initialSub, selectedBrands, selectedPriceRange, minRating, sortOrder]);

  const isWishlisted = (id) => wishlist?.some(item => item.id === id);

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedPriceRange(null);
    setMinRating(0);
    setSortOrder('popularity');
  };

  const pageTitle = initialCategory || (searchQuery ? `"${searchQuery}"` : 'Shop All');

  const Sidebar = () => (
    <aside style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '100px', height: 'fit-content' }}>
      <div className="modern-card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: '800', color: 'var(--text-1)' }}>
            <Filter size={18} color="var(--primary)" /> Filters
          </div>
          {(selectedBrands.length > 0 || selectedPriceRange || minRating > 0) && (
            <button onClick={clearFilters} style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800', background: 'transparent', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>Clear All</button>
          )}
        </div>

        <FilterSection title="Price Range">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {PRICE_RANGES.map(range => (
                <label key={range.label} className="modern-checkbox-label">
                    <input type="radio" name="price" checked={selectedPriceRange?.label === range.label}
                    onChange={() => setSelectedPriceRange(range)}
                    />
                    <span>{range.label}</span>
                </label>
                ))}
            </div>
        </FilterSection>

        <FilterSection title="Customer Ratings">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {RATINGS.map(r => (
                <label key={r} className="modern-checkbox-label">
                    <input type="radio" name="rating" checked={minRating === r}
                    onChange={() => setMinRating(r === minRating ? 0 : r)}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {r} <Star size={12} fill="var(--gold)" color="var(--gold)" /> & above
                    </span>
                </label>
                ))}
            </div>
        </FilterSection>

        {brands.length > 0 && (
            <FilterSection title="Brand">
            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {brands.map(brand => (
                <label key={brand} className="modern-checkbox-label">
                    <input type="checkbox" checked={selectedBrands.includes(brand)}
                    onChange={() => setSelectedBrands(prev =>
                        prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
                    )}
                    />
                    <span>{brand}</span>
                </label>
                ))}
            </div>
            </FilterSection>
        )}
      </div>
    </aside>
  );

  const ProductCard = ({ product }) => {
    const wished = isWishlisted(product.id);
    const discount = Math.floor(Math.random() * 30) + 15;
    const mrp = Math.round(product.price * (1 + discount / 100));

    return (
      <div className="hover-card" onClick={() => navigate(`/product/${product.id}`)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ position: 'relative', height: '240px', padding: '32px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)' }}>
          <SafeImage src={product.image} alt={product.name} productId={product.id}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
          <button onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
            style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '50%', background: '#fff', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Heart size={18} fill={wished ? 'var(--accent)' : 'none'} color={wished ? 'var(--accent)' : 'var(--text-3)'} />
          </button>
        </div>

        <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.brand}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-1)', fontWeight: '600', lineHeight: 1.5, marginBottom: '10px', height: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {product.name}
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--success)', color: '#fff', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', fontWeight: '800', width: 'fit-content', marginBottom: '12px' }}>
            {product.rating} <Star size={10} fill="#fff" color="#fff" />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-1)' }}>₹{product.price?.toLocaleString('en-IN')}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-3)', textDecoration: 'line-through' }}>₹{mrp.toLocaleString('en-IN')}</span>
            <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '800' }}>{discount}% OFF</span>
          </div>

          <button onClick={e => { e.stopPropagation(); addToCart(product); }} className="btn-gradient" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
            <ShoppingCart size={14} /> Add to Cart
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* ── BREADCRUMB + SORT BAR ── */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid var(--border)', sticky: 'top', top: '100px', zIndex: 800 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>Home / </span>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{pageTitle}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-3)', marginLeft: '12px' }}>{totalItems.toLocaleString()} items</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: '700' }}>SORT BY</span>
            <div style={{ display: 'flex', gap: '6px' }}>
                {SORT_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setSortOrder(opt.value)}
                    style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer', background: sortOrder === opt.value ? 'var(--primary)' : 'transparent', color: sortOrder === opt.value ? '#fff' : 'var(--text-2)', border: sortOrder === opt.value ? '1px solid var(--primary)' : '1px solid var(--border)', transition: 'all 0.2s' }}
                >
                    {opt.label}
                </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '32px', display: 'flex', gap: '32px' }}>
        <div className="filters-sidebar">
          <Sidebar />
        </div>

        <main style={{ flex: 1 }}>
          {loading && page === 1 ? (
            <div className="product-grid" style={{ gap: '24px' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '380px' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="modern-card free-padding" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '72px', marginBottom: '24px' }}>🔍</div>
              <h2 className="text-h1" style={{ marginBottom: '12px' }}>We couldn't find any matches</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '16px', marginBottom: '32px' }}>Try adjusting your filters or checking your spelling.</p>
              <button onClick={clearFilters} className="btn-primary">Clear All Filters</button>
            </div>
          ) : (
            <>
              <div className="product-grid" style={{ gap: '24px' }}>
                {products.map(product => (
                  <ProductCard key={`${product.id}-${product._id}`} product={product} />
                ))}
              </div>
              {page < totalPages && (
                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                  <button onClick={() => setPage(p => p + 1)} disabled={loading} className="btn-outline" style={{ padding: '14px 64px', fontSize: '15px' }}>
                    {loading ? 'Fetching More...' : 'Load 24 More Products'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Products;
